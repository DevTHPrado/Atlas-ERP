using System;
using System.Collections.Generic;

namespace Atlas.Application.DTOs;

// Category
public record CategoryCreate(string Name, string? Description, bool? IsActive);
public record CategoryUpdate(string? Name, string? Description, bool? IsActive);
public record CategoryResponse(Guid Id, Guid CompanyId, string Name, string? Description, bool IsActive, DateTime CreatedAt);

// Brand
public record BrandCreate(string Name, string? Description, bool? IsActive);
public record BrandUpdate(string? Name, string? Description, bool? IsActive);
public record BrandResponse(Guid Id, Guid CompanyId, string Name, string? Description, bool IsActive, DateTime CreatedAt);

// Unit
public record UnitCreate(string Name, string Abbreviation, string? Description, bool? IsActive);
public record UnitUpdate(string? Name, string? Abbreviation, string? Description, bool? IsActive);
public record UnitResponse(Guid Id, Guid CompanyId, string Name, string Abbreviation, string? Description, bool IsActive, DateTime CreatedAt);

// Warehouse
public record WarehouseCreate(string Name, string? Location, string? Description, bool? IsDefault, bool? IsActive);
public record WarehouseUpdate(string? Name, string? Location, string? Description, bool? IsDefault, bool? IsActive);
public record WarehouseResponse(Guid Id, Guid CompanyId, string Name, string? Location, string? Description, bool IsDefault, bool IsActive, DateTime CreatedAt);

// Product Image
public record ProductImageCreate(string Url, string? AltText, int? DisplayOrder, bool? IsPrimary);
public record ProductImageResponse(Guid Id, Guid ProductId, string Url, string? AltText, int DisplayOrder, bool IsPrimary);

// Product
public record ProductCreate(
    string Sku,
    string? Barcode,
    string Name,
    string? Description,
    Guid? CategoryId,
    Guid? BrandId,
    Guid? UnitId,
    decimal CostPrice,
    decimal SalePrice,
    decimal? InitialStock,
    decimal? MinimumStock,
    decimal? MaximumStock,
    string? LocationInWarehouse,
    bool? AllowNegativeStock,
    bool? IsActive
);

public record ProductUpdate(
    string? Sku,
    string? Barcode,
    string? Name,
    string? Description,
    Guid? CategoryId,
    Guid? BrandId,
    Guid? UnitId,
    decimal? CostPrice,
    decimal? SalePrice,
    decimal? MinimumStock,
    decimal? MaximumStock,
    string? LocationInWarehouse,
    bool? AllowNegativeStock,
    bool? IsActive
);

public record ProductResponse(
    Guid Id,
    Guid CompanyId,
    string Sku,
    string? Barcode,
    string Name,
    string? Description,
    Guid? CategoryId,
    CategoryResponse? Category,
    Guid? BrandId,
    BrandResponse? Brand,
    Guid? UnitId,
    UnitResponse? Unit,
    decimal CostPrice,
    decimal SalePrice,
    decimal StockQuantity,
    decimal MinimumStock,
    decimal MaximumStock,
    string? LocationInWarehouse,
    bool AllowNegativeStock,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    List<ProductImageResponse>? Images
);

public record ProductListResponse(
    Guid Id,
    string Sku,
    string Name,
    string? CategoryName,
    string? BrandName,
    string? UnitAbbreviation,
    decimal SalePrice,
    decimal StockQuantity,
    decimal MinimumStock,
    bool IsActive
);

// Stock Movement
public record StockMovementCreate(
    Guid ProductId,
    Guid? WarehouseId,
    string MovementType, // IN, OUT, TRANSFER, ADJUSTMENT
    string Reason,
    decimal Quantity,
    decimal? UnitCost,
    string? ReferenceType,
    Guid? ReferenceId,
    string? Notes
);

public record StockMovementResponse(
    Guid Id,
    Guid CompanyId,
    Guid ProductId,
    string? ProductName,
    string? ProductSku,
    Guid? WarehouseId,
    string? WarehouseName,
    Guid? UserId,
    string? UserName,
    string MovementType,
    string Reason,
    decimal Quantity,
    decimal UnitCost,
    decimal TotalCost,
    decimal PreviousStock,
    decimal NewStock,
    string? ReferenceType,
    Guid? ReferenceId,
    string? Notes,
    DateTime CreatedAt
);

public record StockSummary(
    int TotalProducts,
    decimal TotalStockValue,
    int LowStockCount,
    int OutOfStockCount
);

// Inventory Adjustment
public record InventoryAdjustmentItemCreate(
    Guid ProductId,
    decimal NewQuantity,
    decimal? UnitCost,
    string? Notes
);

public record InventoryAdjustmentItemResponse(
    Guid Id,
    Guid AdjustmentId,
    Guid ProductId,
    string? ProductName,
    string? ProductSku,
    decimal PreviousQuantity,
    decimal NewQuantity,
    decimal Difference,
    decimal UnitCost,
    string? Notes
);

public record InventoryAdjustmentCreate(
    Guid? WarehouseId,
    string Reason,
    string? Notes,
    List<InventoryAdjustmentItemCreate> Items
);

public record InventoryAdjustmentResponse(
    Guid Id,
    Guid CompanyId,
    Guid? WarehouseId,
    string? WarehouseName,
    Guid? UserId,
    string? UserName,
    string Reason,
    string Status,
    DateTime? AppliedAt,
    string? Notes,
    DateTime CreatedAt,
    List<InventoryAdjustmentItemResponse> Items
);
