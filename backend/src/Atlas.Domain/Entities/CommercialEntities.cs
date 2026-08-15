using System;
using System.Collections.Generic;
using Atlas.Domain.Common;

namespace Atlas.Domain.Entities;

public class SaleOrder : BaseEntity, ITenantEntity, ISoftDelete
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

    public string Status { get; set; } = "draft"; // draft, pending, confirmed, paid, cancelled
    public decimal TotalAmount { get; set; } = 0;
    public decimal GrossProfit { get; set; } = 0;
    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;

    public DateTime? DeletedAt { get; set; }
    public bool IsDeleted => DeletedAt.HasValue;

    public ICollection<SaleOrderItem> Items { get; set; } = new List<SaleOrderItem>();
}

public class SaleOrderItem : BaseEntity
{
    public Guid SaleOrderId { get; set; }
    public SaleOrder SaleOrder { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal UnitCost { get; set; }
    public decimal TotalPrice { get; set; }
}

public class FinancialAccount : BaseEntity, ITenantEntity, ISoftDelete
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public string Kind { get; set; } = "receivable"; // receivable, payable
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateOnly DueDate { get; set; }
    public DateTime? PaidAt { get; set; }

    public DateTime? DeletedAt { get; set; }
    public bool IsDeleted => DeletedAt.HasValue;
}

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CompanyId { get; set; }
    public Guid? UserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string? Details { get; set; }
    public string? IpAddress { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
