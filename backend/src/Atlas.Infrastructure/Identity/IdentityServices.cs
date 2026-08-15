using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Atlas.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Atlas.Infrastructure.Identity;

public interface IPasswordHasher
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string passwordHash);
}

public class BcryptPasswordHasher : IPasswordHasher
{
    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public bool VerifyPassword(string password, string passwordHash)
    {
        try
        {
            return BCrypt.Net.BCrypt.Verify(password, passwordHash);
        }
        catch
        {
            return false;
        }
    }
}

public interface IJwtTokenGenerator
{
    (string Token, int ExpiresIn) GenerateToken(User user, IEnumerable<string> permissions);
    string GenerateRefreshToken();
}

public class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly IConfiguration _config;

    public JwtTokenGenerator(IConfiguration config)
    {
        _config = config;
    }

    public (string Token, int ExpiresIn) GenerateToken(User user, IEnumerable<string> permissions)
    {
        var secret = _config["JWT_SECRET_KEY"] ?? _config["Jwt:Secret"] ?? "atlas_erp_super_secret_jwt_key_2026_modern_production_ready";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(JwtRegisteredClaimNames.Name, user.FullName),
            new("company_id", user.CompanyId.ToString()),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
        };

        if (user.Role != null)
        {
            claims.Add(new(ClaimTypes.Role, user.Role.Name));
            claims.Add(new("role_name", user.Role.Name));
        }

        foreach (var perm in permissions)
        {
            claims.Add(new("permission", perm));
        }

        var expiresInMinutes = int.TryParse(_config["JWT_ACCESS_TOKEN_EXPIRE_MINUTES"], out var exp) ? exp : 60;
        var expiresAt = DateTime.UtcNow.AddMinutes(expiresInMinutes);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? "atlas-erp",
            audience: _config["Jwt:Audience"] ?? "atlas-erp-client",
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds
        );

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresInMinutes * 60);
    }

    public string GenerateRefreshToken()
    {
        return Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
    }
}
