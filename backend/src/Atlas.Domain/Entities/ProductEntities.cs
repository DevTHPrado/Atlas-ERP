using System;
using System.Collections.Generic;
using Atlas.Domain.Common;
using Atlas.Domain.Enums;

namespace Atlas.Domain.Entities;

public class Category : BaseEntity, ITenantEntity, ISoftDelete
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? DeletedAt { get; set; }
    public bool IsDeleted => DeletedAt.HasValue;

    public ICollection<Product> Products { get; set; } = new List<Product>();
}

public class Brand : BaseEntity, ITenantEntity, ISoftDelete
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? DeletedAt { get; set; }
    public bool IsDeleted => DeletedAt.HasValue;

    public ICollection<Product> Products { get; set; } = new List<Product>();
}

public class Unit : BaseEntity, ITenantEntity, ISoftDelete
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string Abbreviation { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? DeletedAt { get; set; }
    public bool IsDeleted => DeletedAt.HasValue;

    public ICollection<Product> Products { get; set; } = new List<Product>();
}

public class Warehouse : BaseEntity, ITenantEntity, ISoftDelete
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string? Description { get; set; }
    public bool IsDefault { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public DateTime? DeletedAt { get; set; }
    public bool IsDeleted => DeletedAt.HasValue;
}

public class Product : BaseEntity, ITenantEntity, ISoftDelete
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public Guid? CategoryId { get; set; }
    public Category? Category { get; set; }

    public Guid? BrandId { get; set; }
    public Brand? Brand { get; set; }

    public Guid? UnitId { get; set; }
    public Unit? Unit { get; set; }

    public string Sku { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    public decimal CostPrice { get; set; } = 0;
    public decimal SalePrice { get; set; } = 0;
    public decimal StockQuantity { get; set; } = 0;
    public decimal MinimumStock { get; set; } = 0;
    public decimal MaximumStock { get; set; } = 0;

    public string? LocationInWarehouse { get; set; }
    public bool AllowNegativeStock { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public DateTime? DeletedAt { get; set; }
    public bool IsDeleted => DeletedAt.HasValue;

    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    public ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();
}

public class ProductImage : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public string Url { get; set; } = string.Empty;
    public string? AltText { get; set; }
    public int DisplayOrder { get; set; } = 0;
    public bool IsPrimary { get; set; } = false;
}

public class StockMovement : BaseEntity, ITenantEntity
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public Guid? WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }

    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public string MovementType { get; set; } = "IN"; // IN, OUT, TRANSFER, ADJUSTMENT
    public string Reason { get; set; } = "PURCHASE";
    public decimal Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public decimal TotalCost { get; set; }
    public decimal PreviousStock { get; set; }
    public decimal NewStock { get; set; }

    public string? ReferenceType { get; set; }
    public Guid? ReferenceId { get; set; }
    public string? Notes { get; set; }
}

public class InventoryAdjustment : BaseEntity, ITenantEntity
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public Guid? WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }

    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = "DRAFT"; // DRAFT, APPLIED, CANCELLED
    public DateTime? AppliedAt { get; set; }
    public string? Notes { get; set; }

    public ICollection<InventoryAdjustmentItem> Items { get; set; } = new List<InventoryAdjustmentItem>();
}

public class InventoryAdjustmentItem : BaseEntity
{
    public Guid AdjustmentId { get; set; }
    public InventoryAdjustment Adjustment { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public decimal PreviousQuantity { get; set; }
    public decimal NewQuantity { get; set; }
    public decimal Difference => NewQuantity - PreviousQuantity;
    public decimal UnitCost { get; set; }
    public string? Notes { get; set; }
}
