using System;
using Atlas.Domain.Common;

namespace Atlas.Domain.Entities;

public class Customer : BaseEntity, ITenantEntity, ISoftDelete
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public string PersonType { get; set; } = "PJ";
    public string Name { get; set; } = string.Empty;
    public string? TradeName { get; set; }
    public string? TaxId { get; set; }
    public string? StateRegistration { get; set; }
    public string? MunicipalRegistration { get; set; }

    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Mobile { get; set; }
    public string? Whatsapp { get; set; }
    public string? ContactName { get; set; }
    public string? ContactRole { get; set; }

    public string? ZipCode { get; set; }
    public string? Street { get; set; }
    public string? Number { get; set; }
    public string? Complement { get; set; }
    public string? Neighborhood { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; } = "Brasil";

    public string? Notes { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? DeletedAt { get; set; }
    public bool IsDeleted => DeletedAt.HasValue;
}

public class Supplier : BaseEntity, ITenantEntity, ISoftDelete
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string? TradeName { get; set; }
    public string? TaxId { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? DeletedAt { get; set; }
    public bool IsDeleted => DeletedAt.HasValue;
}
