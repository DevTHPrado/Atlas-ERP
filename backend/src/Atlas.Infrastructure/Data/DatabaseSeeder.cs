using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Atlas.Domain.Entities;
using Atlas.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Atlas.Infrastructure.Data;

public class DatabaseSeeder
{
    private readonly AtlasDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ILogger<DatabaseSeeder> _logger;

    public DatabaseSeeder(AtlasDbContext context, IPasswordHasher passwordHasher, ILogger<DatabaseSeeder> logger)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        try
        {
            await _context.Database.EnsureCreatedAsync();

            if (await _context.Users.AnyAsync(u => u.Email == "admin@erp.local"))
            {
                _logger.LogInformation("Database já semeado anteriormente.");
                return;
            }

            _logger.LogInformation("Iniciando carga de dados de demonstração (Seeder)...");

            var company = new Company
            {
                LegalName = "ERP Pequenas Empresas LTDA",
                TradeName = "Atlas ERP Demo",
                TaxId = "00000000000100",
                Email = "contato@erp.local",
                Phone = "+55 11 4002-8922"
            };
            _context.Companies.Add(company);
            await _context.SaveChangesAsync();

            var permissions = new List<Permission>
            {
                new() { Code = "admin:*", Description = "Acesso administrativo completo" },
                new() { Code = "dashboard:read", Description = "Visualizar dashboard executivo" },
                new() { Code = "users:read", Description = "Listar usuários" },
                new() { Code = "users:write", Description = "Gerenciar usuários" },
                new() { Code = "customers:read", Description = "Visualizar clientes" },
                new() { Code = "customers:write", Description = "Cadastrar/Editar clientes" },
                new() { Code = "products:read", Description = "Visualizar catálogo e estoque" },
                new() { Code = "products:write", Description = "Gerenciar catálogo e estoque" },
                new() { Code = "stock:read", Description = "Visualizar movimentações de estoque" },
                new() { Code = "stock:write", Description = "Realizar movimentações de estoque" },
            };
            _context.Permissions.AddRange(permissions);
            await _context.SaveChangesAsync();

            var adminRole = new Role
            {
                CompanyId = company.Id,
                Name = "Administrador",
                Description = "Administrador geral do sistema"
            };
            _context.Roles.Add(adminRole);
            await _context.SaveChangesAsync();

            foreach (var p in permissions)
            {
                _context.RolePermissions.Add(new RolePermission
                {
                    RoleId = adminRole.Id,
                    PermissionId = p.Id
                });
            }
            await _context.SaveChangesAsync();

            var adminUser = new User
            {
                CompanyId = company.Id,
                RoleId = adminRole.Id,
                FullName = "Admin",
                Email = "admin@erp.local",
                PasswordHash = _passwordHasher.HashPassword("Sapo1010@"),
                JobTitle = "CEO",
                IsActive = true
            };
            _context.Users.Add(adminUser);

            var category = new Category { CompanyId = company.Id, Name = "Tecnologia", Description = "Hardware e equipamentos de informática" };
            var brand = new Brand { CompanyId = company.Id, Name = "Acme Corp", Description = "Marca padrão" };
            var unit = new Unit { CompanyId = company.Id, Name = "Unidade", Abbreviation = "UN", Description = "Unidade padrão" };
            var warehouse = new Warehouse { CompanyId = company.Id, Name = "Depósito Principal", Location = "Matriz SP", IsDefault = true };

            _context.Categories.Add(category);
            _context.Brands.Add(brand);
            _context.Units.Add(unit);
            _context.Warehouses.Add(warehouse);

            var customer = new Customer
            {
                CompanyId = company.Id,
                Name = "Cliente Exemplo SA",
                TradeName = "Cliente Exemplo",
                TaxId = "11111111000111",
                Email = "compras@cliente.local",
                Phone = "+55 11 3000-0000",
                City = "São Paulo",
                State = "SP",
                IsActive = true
            };
            var supplier = new Supplier
            {
                CompanyId = company.Id,
                Name = "Fornecedor Exemplo LTDA",
                TradeName = "Fornecedor Tech",
                TaxId = "22222222000122",
                Email = "vendas@fornecedor.local",
                Phone = "+55 11 3000-0001",
                IsActive = true
            };
            _context.Customers.Add(customer);
            _context.Suppliers.Add(supplier);

            var product1 = new Product
            {
                CompanyId = company.Id,
                CategoryId = category.Id,
                BrandId = brand.Id,
                UnitId = unit.Id,
                Sku = "NB-PRO-001",
                Barcode = "7891234567890",
                Name = "Notebook Pro 16\"",
                Description = "Notebook corporativo para equipes administrativas e de desenvolvimento.",
                CostPrice = 3200.00m,
                SalePrice = 4990.00m,
                StockQuantity = 12,
                MinimumStock = 3,
                MaximumStock = 50,
                LocationInWarehouse = "A-12",
                IsActive = true
            };

            var product2 = new Product
            {
                CompanyId = company.Id,
                CategoryId = category.Id,
                BrandId = brand.Id,
                UnitId = unit.Id,
                Sku = "MON-4K-002",
                Barcode = "7891234567891",
                Name = "Monitor UltraWide 34\"",
                Description = "Monitor 4K IPS para alta produtividade.",
                CostPrice = 1400.00m,
                SalePrice = 2490.00m,
                StockQuantity = 8,
                MinimumStock = 2,
                MaximumStock = 30,
                LocationInWarehouse = "B-05",
                IsActive = true
            };

            _context.Products.AddRange(product1, product2);
            await _context.SaveChangesAsync();

            var saleOrder = new SaleOrder
            {
                CompanyId = company.Id,
                CustomerId = customer.Id,
                Status = "paid",
                TotalAmount = 14970.00m,
                GrossProfit = 5370.00m,
                IssuedAt = DateTime.UtcNow
            };
            _context.SaleOrders.Add(saleOrder);

            var receivable = new FinancialAccount
            {
                CompanyId = company.Id,
                Kind = "receivable",
                Description = "Venda 0001 - Faturamento Cliente Exemplo",
                Amount = 14970.00m,
                DueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7))
            };

            var payable = new FinancialAccount
            {
                CompanyId = company.Id,
                Kind = "payable",
                Description = "Fornecedor Tech - Aquisição de Lote Notebooks",
                Amount = 6400.00m,
                DueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-3))
            };

            _context.FinancialAccounts.AddRange(receivable, payable);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Carga de dados de demonstração concluída com sucesso.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao semear o banco de dados.");
            throw;
        }
    }
}
