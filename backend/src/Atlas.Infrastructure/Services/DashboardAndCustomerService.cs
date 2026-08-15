using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Atlas.Application.Common;
using Atlas.Application.DTOs;
using Atlas.Application.Exceptions;
using Atlas.Application.Interfaces;
using Atlas.Domain.Entities;
using Atlas.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Atlas.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly AtlasDbContext _context;
    private readonly ICacheService _cache;

    public DashboardService(AtlasDbContext context, ICacheService cache)
    {
        _context = context;
        _cache = cache;
    }

    public async Task<DashboardResponse> GetDashboardDataAsync(Guid companyId, CancellationToken ct = default)
    {
        var cacheKey = $"dashboard:{companyId}";
        var cached = await _cache.GetAsync<DashboardResponse>(cacheKey, ct);
        if (cached != null) return cached;

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var next30Days = today.AddDays(30);

        var ordersQuery = _context.SaleOrders.Where(o => o.CompanyId == companyId && (o.Status == "confirmed" || o.Status == "paid"));
        var revenue = await ordersQuery.SumAsync(o => (decimal?)o.TotalAmount, ct) ?? 0m;
        var profit = await ordersQuery.SumAsync(o => (decimal?)o.GrossProfit, ct) ?? 0m;
        var ordersCount = await ordersQuery.CountAsync(ct);

        var activeCustomers = await _context.Customers.CountAsync(c => c.CompanyId == companyId && c.IsActive, ct);

        var overdueAccounts = await _context.FinancialAccounts
            .Where(f => f.CompanyId == companyId && f.Kind == "payable" && f.PaidAt == null && f.DueDate < today)
            .SumAsync(f => (decimal?)f.Amount, ct) ?? 0m;

        var upcomingAccounts = await _context.FinancialAccounts
            .Where(f => f.CompanyId == companyId && f.Kind == "payable" && f.PaidAt == null && f.DueDate >= today && f.DueDate <= next30Days)
            .SumAsync(f => (decimal?)f.Amount, ct) ?? 0m;

        var outOfStock = await _context.Products
            .CountAsync(p => p.CompanyId == companyId && p.StockQuantity <= p.MinimumStock, ct);

        var cashFlowGroup = await _context.FinancialAccounts
            .Where(f => f.CompanyId == companyId)
            .GroupBy(f => f.DueDate)
            .OrderBy(g => g.Key)
            .Take(12)
            .Select(g => new
            {
                Date = g.Key,
                Value = g.Sum(f => f.Kind == "receivable" ? f.Amount : -f.Amount)
            })
            .ToListAsync(ct);

        var cashFlow = cashFlowGroup
            .Select(cg => new ChartPoint(cg.Date.ToString("yyyy-MM-dd"), cg.Value))
            .ToList();

        var topProducts = new List<ChartPoint>
        {
            new("Notebook Pro", 42m),
            new("Monitor 27", 35m),
            new("Licenca SaaS", 28m)
        };

        var response = new DashboardResponse(
            Kpis: new DashboardKpis(
                Revenue: revenue,
                Profit: profit,
                Orders: ordersCount,
                ActiveCustomers: activeCustomers,
                OverdueAccounts: overdueAccounts,
                UpcomingAccounts: upcomingAccounts,
                OutOfStockProducts: outOfStock
            ),
            CashFlow: cashFlow,
            TopProducts: topProducts
        );

        await _cache.SetAsync(cacheKey, response, TimeSpan.FromMinutes(2), ct);
        return response;
    }
}

public class CustomerService : ICustomerService
{
    private readonly AtlasDbContext _context;

    public CustomerService(AtlasDbContext context)
    {
        _context = context;
    }

    public async Task<CustomerResponse> CreateAsync(Guid companyId, CustomerCreate request, CancellationToken ct = default)
    {
        var customer = new Customer
        {
            CompanyId = companyId,
            PersonType = request.PersonType ?? "PJ",
            Name = request.Name,
            TradeName = request.TradeName,
            TaxId = request.TaxId,
            StateRegistration = request.StateRegistration,
            MunicipalRegistration = request.MunicipalRegistration,
            Email = request.Email,
            Phone = request.Phone,
            Mobile = request.Mobile,
            Whatsapp = request.Whatsapp,
            ContactName = request.ContactName,
            ContactRole = request.ContactRole,
            ZipCode = request.ZipCode,
            Street = request.Street,
            Number = request.Number,
            Complement = request.Complement,
            Neighborhood = request.Neighborhood,
            City = request.City,
            State = request.State,
            Country = request.Country ?? "Brasil",
            Notes = request.Notes,
            IsActive = request.IsActive ?? true
        };

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync(ct);

        return MapToResponse(customer);
    }

    public async Task<PaginatedResponse<CustomerResponse>> ListAsync(Guid companyId, int skip, int limit, string? search, CancellationToken ct = default)
    {
        var query = _context.Customers.Where(c => c.CompanyId == companyId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(c => c.Name.ToLower().Contains(s) || (c.TaxId != null && c.TaxId.Contains(s)) || (c.Email != null && c.Email.ToLower().Contains(s)));
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderBy(c => c.Name)
            .Skip(skip)
            .Take(limit)
            .Select(c => MapToResponse(c))
            .ToListAsync(ct);

        return new PaginatedResponse<CustomerResponse>(items, total, skip, limit);
    }

    public async Task<CustomerResponse?> GetByIdAsync(Guid companyId, Guid customerId, CancellationToken ct = default)
    {
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.CompanyId == companyId && c.Id == customerId, ct);
        return customer == null ? null : MapToResponse(customer);
    }

    public async Task<CustomerResponse> UpdateAsync(Guid companyId, Guid customerId, CustomerUpdate request, CancellationToken ct = default)
    {
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.CompanyId == companyId && c.Id == customerId, ct);
        if (customer == null) throw new NotFoundException("Cliente não encontrado");

        if (request.PersonType != null) customer.PersonType = request.PersonType;
        if (request.Name != null) customer.Name = request.Name;
        if (request.TradeName != null) customer.TradeName = request.TradeName;
        if (request.TaxId != null) customer.TaxId = request.TaxId;
        if (request.StateRegistration != null) customer.StateRegistration = request.StateRegistration;
        if (request.MunicipalRegistration != null) customer.MunicipalRegistration = request.MunicipalRegistration;
        if (request.Email != null) customer.Email = request.Email;
        if (request.Phone != null) customer.Phone = request.Phone;
        if (request.Mobile != null) customer.Mobile = request.Mobile;
        if (request.Whatsapp != null) customer.Whatsapp = request.Whatsapp;
        if (request.ContactName != null) customer.ContactName = request.ContactName;
        if (request.ContactRole != null) customer.ContactRole = request.ContactRole;
        if (request.ZipCode != null) customer.ZipCode = request.ZipCode;
        if (request.Street != null) customer.Street = request.Street;
        if (request.Number != null) customer.Number = request.Number;
        if (request.Complement != null) customer.Complement = request.Complement;
        if (request.Neighborhood != null) customer.Neighborhood = request.Neighborhood;
        if (request.City != null) customer.City = request.City;
        if (request.State != null) customer.State = request.State;
        if (request.Country != null) customer.Country = request.Country;
        if (request.Notes != null) customer.Notes = request.Notes;
        if (request.IsActive.HasValue) customer.IsActive = request.IsActive.Value;

        await _context.SaveChangesAsync(ct);
        return MapToResponse(customer);
    }

    public async Task DeleteAsync(Guid companyId, Guid customerId, CancellationToken ct = default)
    {
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.CompanyId == companyId && c.Id == customerId, ct);
        if (customer == null) throw new NotFoundException("Cliente não encontrado");

        customer.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);
    }

    private static CustomerResponse MapToResponse(Customer c) => new(
        c.Id,
        c.CompanyId,
        c.PersonType,
        c.Name,
        c.TradeName,
        c.TaxId,
        c.StateRegistration,
        c.MunicipalRegistration,
        c.Email,
        c.Phone,
        c.Mobile,
        c.Whatsapp,
        c.ContactName,
        c.ContactRole,
        c.ZipCode,
        c.Street,
        c.Number,
        c.Complement,
        c.Neighborhood,
        c.City,
        c.State,
        c.Country,
        c.Notes,
        c.IsActive,
        c.CreatedAt,
        c.UpdatedAt
    );
}
