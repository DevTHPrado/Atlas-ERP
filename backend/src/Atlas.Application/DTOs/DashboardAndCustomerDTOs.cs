using System;
using System.Collections.Generic;

namespace Atlas.Application.DTOs;

public record DashboardKpis(
    decimal Revenue,
    decimal Profit,
    int Orders,
    int ActiveCustomers,
    decimal OverdueAccounts,
    decimal UpcomingAccounts,
    int OutOfStockProducts
);

public record ChartPoint(
    string Label,
    decimal Value
);

public record DashboardResponse(
    DashboardKpis Kpis,
    List<ChartPoint> CashFlow,
    List<ChartPoint> TopProducts
);

public record CustomerCreate(
    string? PersonType,
    string Name,
    string? TradeName,
    string? TaxId,
    string? StateRegistration,
    string? MunicipalRegistration,
    string? Email,
    string? Phone,
    string? Mobile,
    string? Whatsapp,
    string? ContactName,
    string? ContactRole,
    string? ZipCode,
    string? Street,
    string? Number,
    string? Complement,
    string? Neighborhood,
    string? City,
    string? State,
    string? Country,
    string? Notes,
    bool? IsActive
);

public record CustomerUpdate(
    string? PersonType,
    string? Name,
    string? TradeName,
    string? TaxId,
    string? StateRegistration,
    string? MunicipalRegistration,
    string? Email,
    string? Phone,
    string? Mobile,
    string? Whatsapp,
    string? ContactName,
    string? ContactRole,
    string? ZipCode,
    string? Street,
    string? Number,
    string? Complement,
    string? Neighborhood,
    string? City,
    string? State,
    string? Country,
    string? Notes,
    bool? IsActive
);

public record CustomerResponse(
    Guid Id,
    Guid CompanyId,
    string PersonType,
    string Name,
    string? TradeName,
    string? TaxId,
    string? StateRegistration,
    string? MunicipalRegistration,
    string? Email,
    string? Phone,
    string? Mobile,
    string? Whatsapp,
    string? ContactName,
    string? ContactRole,
    string? ZipCode,
    string? Street,
    string? Number,
    string? Complement,
    string? Neighborhood,
    string? City,
    string? State,
    string? Country,
    string? Notes,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
