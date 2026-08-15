using System;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Atlas.Api.Middlewares;
using Atlas.Api.Security;
using Atlas.Application.Interfaces;
using Atlas.Infrastructure.Data;
using Atlas.Infrastructure.Identity;
using Atlas.Infrastructure.Redis;
using Atlas.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

// 1. JSON Configuration & Controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHttpContextAccessor();

// 2. Swagger OpenAPI with JWT Bearer
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Atlas ERP API",
        Version = "v1",
        Description = "API RESTful do Atlas ERP em .NET 8 com Clean Architecture, EF Core e PostgreSQL."
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Insira o token JWT no formato: Bearer {seu_token}"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// 3. Database Connection String Parser (suporta tanto postgresql:// url quanto Host=... standard)
string GetPostgresConnectionString(IConfiguration config)
{
    var raw = config["DATABASE_URL"] ?? config.GetConnectionString("DefaultConnection");
    if (string.IsNullOrWhiteSpace(raw))
    {
        var dbHost = config["POSTGRES_SERVER"] ?? "localhost";
        var dbPort = config["POSTGRES_PORT"] ?? "5432";
        var dbName = config["POSTGRES_DB"] ?? "erp";
        var dbUser = config["POSTGRES_USER"] ?? "erp";
        var dbPass = config["POSTGRES_PASSWORD"] ?? "erp";
        return $"Host={dbHost};Port={dbPort};Database={dbName};Username={dbUser};Password={dbPass}";
    }

    if (raw.StartsWith("postgresql://") || raw.StartsWith("postgres://"))
    {
        var uri = new Uri(raw);
        var userInfo = uri.UserInfo.Split(':');
        var user = userInfo[0];
        var pass = userInfo.Length > 1 ? userInfo[1] : "";
        var host = uri.Host;
        var port = uri.Port > 0 ? uri.Port : 5432;
        var db = uri.AbsolutePath.TrimStart('/');
        return $"Host={host};Port={port};Database={db};Username={user};Password={pass}";
    }

    return raw;
}

var connectionString = GetPostgresConnectionString(builder.Configuration);
builder.Services.AddDbContext<AtlasDbContext>(options =>
{
    options.UseNpgsql(connectionString, npgsql =>
    {
        npgsql.MigrationsAssembly(typeof(AtlasDbContext).Assembly.FullName);
    });
});

// 4. Redis Connection
var redisUrl = builder.Configuration["REDIS_URL"] ?? builder.Configuration["Redis:Host"] ?? "localhost:6379";
if (redisUrl.StartsWith("redis://"))
{
    var u = new Uri(redisUrl);
    redisUrl = $"{u.Host}:{u.Port}";
}

try
{
    var redisMultiplexer = ConnectionMultiplexer.Connect(new ConfigurationOptions
    {
        EndPoints = { redisUrl },
        AbortOnConnectFail = false,
        ConnectTimeout = 3000
    });
    builder.Services.AddSingleton<IConnectionMultiplexer>(redisMultiplexer);
}
catch
{
    // Permite inicialização mesmo sem Redis presente em dev puro
}

// 5. Dependency Injection
builder.Services.AddSingleton<IPasswordHasher, BcryptPasswordHasher>();
builder.Services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddSingleton<ICacheService, RedisCacheService>();
builder.Services.AddSingleton<IDistributedLockService, RedisDistributedLockService>();

builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IStockService, StockService>();
builder.Services.AddScoped<DatabaseSeeder>();

// 6. Authentication & Authorization
var jwtSecret = builder.Configuration["JWT_SECRET_KEY"] ?? builder.Configuration["Jwt:Secret"] ?? "atlas_erp_super_secret_jwt_key_2026_modern_production_ready";
var jwtKey = Encoding.UTF8.GetBytes(jwtSecret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(jwtKey),
        ValidateIssuer = false,
        ValidateAudience = false,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddSingleton<IAuthorizationHandler, PermissionAuthorizationHandler>();

// 7. CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// 8. Auto-Migration and Seed on Startup
using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<DatabaseSeeder>();
    await seeder.SeedAsync();
}

// 9. Pipeline HTTP
app.UseMiddleware<CorrelationIdMiddleware>();
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Atlas ERP API v1");
    c.RoutePrefix = "docs";
});

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run("http://0.0.0.0:8000");
