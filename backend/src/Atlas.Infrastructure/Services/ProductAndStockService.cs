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
using Microsoft.Extensions.Logging;

namespace Atlas.Infrastructure.Services;

public class ProductService : IProductService
{
    private readonly AtlasDbContext _context;
    private readonly ILogger<ProductService> _logger;

    public ProductService(AtlasDbContext context, ILogger<ProductService> logger)
    {
        _context = context;
        _logger = logger;
    }

    #region Categories
    public async Task<CategoryResponse> CreateCategoryAsync(Guid companyId, CategoryCreate request, CancellationToken ct = default)
    {
        var category = new Category
        {
            CompanyId = companyId,
            Name = request.Name,
            Description = request.Description,
            IsActive = request.IsActive ?? true
        };
        _context.Categories.Add(category);
        await _context.SaveChangesAsync(ct);
        return new CategoryResponse(category.Id, category.CompanyId, category.Name, category.Description, category.IsActive, category.CreatedAt);
    }

    public async Task<List<CategoryResponse>> ListCategoriesAsync(Guid companyId, CancellationToken ct = default)
    {
        return await _context.Categories
            .Where(c => c.CompanyId == companyId)
            .OrderBy(c => c.Name)
            .Select(c => new CategoryResponse(c.Id, c.CompanyId, c.Name, c.Description, c.IsActive, c.CreatedAt))
            .ToListAsync(ct);
    }

    public async Task<CategoryResponse> UpdateCategoryAsync(Guid companyId, Guid categoryId, CategoryUpdate request, CancellationToken ct = default)
    {
        var category = await _context.Categories.FirstOrDefaultAsync(c => c.CompanyId == companyId && c.Id == categoryId, ct);
        if (category == null) throw new NotFoundException("Categoria não encontrada");

        if (request.Name != null) category.Name = request.Name;
        if (request.Description != null) category.Description = request.Description;
        if (request.IsActive.HasValue) category.IsActive = request.IsActive.Value;

        await _context.SaveChangesAsync(ct);
        return new CategoryResponse(category.Id, category.CompanyId, category.Name, category.Description, category.IsActive, category.CreatedAt);
    }

    public async Task DeleteCategoryAsync(Guid companyId, Guid categoryId, CancellationToken ct = default)
    {
        var category = await _context.Categories.FirstOrDefaultAsync(c => c.CompanyId == companyId && c.Id == categoryId, ct);
        if (category == null) throw new NotFoundException("Categoria não encontrada");

        category.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);
    }
    #endregion

    #region Brands
    public async Task<BrandResponse> CreateBrandAsync(Guid companyId, BrandCreate request, CancellationToken ct = default)
    {
        var brand = new Brand
        {
            CompanyId = companyId,
            Name = request.Name,
            Description = request.Description,
            IsActive = request.IsActive ?? true
        };
        _context.Brands.Add(brand);
        await _context.SaveChangesAsync(ct);
        return new BrandResponse(brand.Id, brand.CompanyId, brand.Name, brand.Description, brand.IsActive, brand.CreatedAt);
    }

    public async Task<List<BrandResponse>> ListBrandsAsync(Guid companyId, CancellationToken ct = default)
    {
        return await _context.Brands
            .Where(b => b.CompanyId == companyId)
            .OrderBy(b => b.Name)
            .Select(b => new BrandResponse(b.Id, b.CompanyId, b.Name, b.Description, b.IsActive, b.CreatedAt))
            .ToListAsync(ct);
    }

    public async Task<BrandResponse> UpdateBrandAsync(Guid companyId, Guid brandId, BrandUpdate request, CancellationToken ct = default)
    {
        var brand = await _context.Brands.FirstOrDefaultAsync(b => b.CompanyId == companyId && b.Id == brandId, ct);
        if (brand == null) throw new NotFoundException("Marca não encontrada");

        if (request.Name != null) brand.Name = request.Name;
        if (request.Description != null) brand.Description = request.Description;
        if (request.IsActive.HasValue) brand.IsActive = request.IsActive.Value;

        await _context.SaveChangesAsync(ct);
        return new BrandResponse(brand.Id, brand.CompanyId, brand.Name, brand.Description, brand.IsActive, brand.CreatedAt);
    }

    public async Task DeleteBrandAsync(Guid companyId, Guid brandId, CancellationToken ct = default)
    {
        var brand = await _context.Brands.FirstOrDefaultAsync(b => b.CompanyId == companyId && b.Id == brandId, ct);
        if (brand == null) throw new NotFoundException("Marca não encontrada");

        brand.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);
    }
    #endregion

    #region Units
    public async Task<UnitResponse> CreateUnitAsync(Guid companyId, UnitCreate request, CancellationToken ct = default)
    {
        var unit = new Unit
        {
            CompanyId = companyId,
            Name = request.Name,
            Abbreviation = request.Abbreviation,
            Description = request.Description,
            IsActive = request.IsActive ?? true
        };
        _context.Units.Add(unit);
        await _context.SaveChangesAsync(ct);
        return new UnitResponse(unit.Id, unit.CompanyId, unit.Name, unit.Abbreviation, unit.Description, unit.IsActive, unit.CreatedAt);
    }

    public async Task<List<UnitResponse>> ListUnitsAsync(Guid companyId, CancellationToken ct = default)
    {
        return await _context.Units
            .Where(u => u.CompanyId == companyId)
            .OrderBy(u => u.Name)
            .Select(u => new UnitResponse(u.Id, u.CompanyId, u.Name, u.Abbreviation, u.Description, u.IsActive, u.CreatedAt))
            .ToListAsync(ct);
    }

    public async Task<UnitResponse> UpdateUnitAsync(Guid companyId, Guid unitId, UnitUpdate request, CancellationToken ct = default)
    {
        var unit = await _context.Units.FirstOrDefaultAsync(u => u.CompanyId == companyId && u.Id == unitId, ct);
        if (unit == null) throw new NotFoundException("Unidade não encontrada");

        if (request.Name != null) unit.Name = request.Name;
        if (request.Abbreviation != null) unit.Abbreviation = request.Abbreviation;
        if (request.Description != null) unit.Description = request.Description;
        if (request.IsActive.HasValue) unit.IsActive = request.IsActive.Value;

        await _context.SaveChangesAsync(ct);
        return new UnitResponse(unit.Id, unit.CompanyId, unit.Name, unit.Abbreviation, unit.Description, unit.IsActive, unit.CreatedAt);
    }

    public async Task DeleteUnitAsync(Guid companyId, Guid unitId, CancellationToken ct = default)
    {
        var unit = await _context.Units.FirstOrDefaultAsync(u => u.CompanyId == companyId && u.Id == unitId, ct);
        if (unit == null) throw new NotFoundException("Unidade não encontrada");

        unit.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);
    }
    #endregion

    #region Warehouses
    public async Task<WarehouseResponse> CreateWarehouseAsync(Guid companyId, WarehouseCreate request, CancellationToken ct = default)
    {
        var wh = new Warehouse
        {
            CompanyId = companyId,
            Name = request.Name,
            Location = request.Location,
            Description = request.Description,
            IsDefault = request.IsDefault ?? false,
            IsActive = request.IsActive ?? true
        };
        _context.Warehouses.Add(wh);
        await _context.SaveChangesAsync(ct);
        return new WarehouseResponse(wh.Id, wh.CompanyId, wh.Name, wh.Location, wh.Description, wh.IsDefault, wh.IsActive, wh.CreatedAt);
    }

    public async Task<List<WarehouseResponse>> ListWarehousesAsync(Guid companyId, CancellationToken ct = default)
    {
        return await _context.Warehouses
            .Where(w => w.CompanyId == companyId)
            .OrderBy(w => w.Name)
            .Select(w => new WarehouseResponse(w.Id, w.CompanyId, w.Name, w.Location, w.Description, w.IsDefault, w.IsActive, w.CreatedAt))
            .ToListAsync(ct);
    }

    public async Task<WarehouseResponse> UpdateWarehouseAsync(Guid companyId, Guid warehouseId, WarehouseUpdate request, CancellationToken ct = default)
    {
        var wh = await _context.Warehouses.FirstOrDefaultAsync(w => w.CompanyId == companyId && w.Id == warehouseId, ct);
        if (wh == null) throw new NotFoundException("Depósito não encontrado");

        if (request.Name != null) wh.Name = request.Name;
        if (request.Location != null) wh.Location = request.Location;
        if (request.Description != null) wh.Description = request.Description;
        if (request.IsDefault.HasValue) wh.IsDefault = request.IsDefault.Value;
        if (request.IsActive.HasValue) wh.IsActive = request.IsActive.Value;

        await _context.SaveChangesAsync(ct);
        return new WarehouseResponse(wh.Id, wh.CompanyId, wh.Name, wh.Location, wh.Description, wh.IsDefault, wh.IsActive, wh.CreatedAt);
    }

    public async Task DeleteWarehouseAsync(Guid companyId, Guid warehouseId, CancellationToken ct = default)
    {
        var wh = await _context.Warehouses.FirstOrDefaultAsync(w => w.CompanyId == companyId && w.Id == warehouseId, ct);
        if (wh == null) throw new NotFoundException("Depósito não encontrado");

        wh.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);
    }
    #endregion

    #region Products
    public async Task<ProductResponse> CreateProductAsync(Guid companyId, ProductCreate request, CancellationToken ct = default)
    {
        var product = new Product
        {
            CompanyId = companyId,
            Sku = request.Sku,
            Barcode = request.Barcode,
            Name = request.Name,
            Description = request.Description,
            CategoryId = request.CategoryId,
            BrandId = request.BrandId,
            UnitId = request.UnitId,
            CostPrice = request.CostPrice,
            SalePrice = request.SalePrice,
            StockQuantity = request.InitialStock ?? 0,
            MinimumStock = request.MinimumStock ?? 0,
            MaximumStock = request.MaximumStock ?? 0,
            LocationInWarehouse = request.LocationInWarehouse,
            AllowNegativeStock = request.AllowNegativeStock ?? false,
            IsActive = request.IsActive ?? true
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync(ct);

        return await GetProductByIdAsync(companyId, product.Id, ct) ?? throw new AppException("Erro ao carregar produto criado");
    }

    public async Task<PaginatedResponse<ProductResponse>> ListProductsAsync(
        Guid companyId,
        int skip,
        int limit,
        string? search,
        Guid? categoryId,
        Guid? brandId,
        bool? lowStock,
        CancellationToken ct = default)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Unit)
            .Include(p => p.Images)
            .Where(p => p.CompanyId == companyId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(s) || p.Sku.ToLower().Contains(s) || (p.Barcode != null && p.Barcode.Contains(s)));
        }

        if (categoryId.HasValue) query = query.Where(p => p.CategoryId == categoryId.Value);
        if (brandId.HasValue) query = query.Where(p => p.BrandId == brandId.Value);
        if (lowStock == true) query = query.Where(p => p.StockQuantity <= p.MinimumStock);

        var total = await query.CountAsync(ct);
        var products = await query
            .OrderBy(p => p.Name)
            .Skip(skip)
            .Take(limit)
            .ToListAsync(ct);

        var items = products.Select(MapProductToResponse).ToList();
        return new PaginatedResponse<ProductResponse>(items, total, skip, limit);
    }

    public async Task<ProductResponse?> GetProductByIdAsync(Guid companyId, Guid productId, CancellationToken ct = default)
    {
        var p = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Unit)
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.CompanyId == companyId && p.Id == productId, ct);

        return p == null ? null : MapProductToResponse(p);
    }

    public async Task<ProductResponse> UpdateProductAsync(Guid companyId, Guid productId, ProductUpdate request, CancellationToken ct = default)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.CompanyId == companyId && p.Id == productId, ct);
        if (product == null) throw new NotFoundException("Produto não encontrado");

        if (request.Sku != null) product.Sku = request.Sku;
        if (request.Barcode != null) product.Barcode = request.Barcode;
        if (request.Name != null) product.Name = request.Name;
        if (request.Description != null) product.Description = request.Description;
        if (request.CategoryId.HasValue) product.CategoryId = request.CategoryId.Value;
        if (request.BrandId.HasValue) product.BrandId = request.BrandId.Value;
        if (request.UnitId.HasValue) product.UnitId = request.UnitId.Value;
        if (request.CostPrice.HasValue) product.CostPrice = request.CostPrice.Value;
        if (request.SalePrice.HasValue) product.SalePrice = request.SalePrice.Value;
        if (request.MinimumStock.HasValue) product.MinimumStock = request.MinimumStock.Value;
        if (request.MaximumStock.HasValue) product.MaximumStock = request.MaximumStock.Value;
        if (request.LocationInWarehouse != null) product.LocationInWarehouse = request.LocationInWarehouse;
        if (request.AllowNegativeStock.HasValue) product.AllowNegativeStock = request.AllowNegativeStock.Value;
        if (request.IsActive.HasValue) product.IsActive = request.IsActive.Value;

        await _context.SaveChangesAsync(ct);
        return await GetProductByIdAsync(companyId, productId, ct) ?? throw new AppException("Erro ao carregar produto atualizado");
    }

    public async Task DeleteProductAsync(Guid companyId, Guid productId, CancellationToken ct = default)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.CompanyId == companyId && p.Id == productId, ct);
        if (product == null) throw new NotFoundException("Produto não encontrado");

        product.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);
    }

    public async Task<ProductImageResponse> AddProductImageAsync(Guid companyId, Guid productId, ProductImageCreate request, CancellationToken ct = default)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.CompanyId == companyId && p.Id == productId, ct);
        if (product == null) throw new NotFoundException("Produto não encontrado");

        var img = new ProductImage
        {
            ProductId = productId,
            Url = request.Url,
            AltText = request.AltText,
            DisplayOrder = request.DisplayOrder ?? 0,
            IsPrimary = request.IsPrimary ?? false
        };
        _context.ProductImages.Add(img);
        await _context.SaveChangesAsync(ct);

        return new ProductImageResponse(img.Id, img.ProductId, img.Url, img.AltText, img.DisplayOrder, img.IsPrimary);
    }

    public async Task DeleteProductImageAsync(Guid companyId, Guid productId, Guid imageId, CancellationToken ct = default)
    {
        var img = await _context.ProductImages.FirstOrDefaultAsync(i => i.ProductId == productId && i.Id == imageId, ct);
        if (img == null) throw new NotFoundException("Imagem não encontrada");

        _context.ProductImages.Remove(img);
        await _context.SaveChangesAsync(ct);
    }

    private static ProductResponse MapProductToResponse(Product p) => new(
        p.Id,
        p.CompanyId,
        p.Sku,
        p.Barcode,
        p.Name,
        p.Description,
        p.CategoryId,
        p.Category == null ? null : new CategoryResponse(p.Category.Id, p.Category.CompanyId, p.Category.Name, p.Category.Description, p.Category.IsActive, p.Category.CreatedAt),
        p.BrandId,
        p.Brand == null ? null : new BrandResponse(p.Brand.Id, p.Brand.CompanyId, p.Brand.Name, p.Brand.Description, p.Brand.IsActive, p.Brand.CreatedAt),
        p.UnitId,
        p.Unit == null ? null : new UnitResponse(p.Unit.Id, p.Unit.CompanyId, p.Unit.Name, p.Unit.Abbreviation, p.Unit.Description, p.Unit.IsActive, p.Unit.CreatedAt),
        p.CostPrice,
        p.SalePrice,
        p.StockQuantity,
        p.MinimumStock,
        p.MaximumStock,
        p.LocationInWarehouse,
        p.AllowNegativeStock,
        p.IsActive,
        p.CreatedAt,
        p.UpdatedAt,
        p.Images?.Select(i => new ProductImageResponse(i.Id, i.ProductId, i.Url, i.AltText, i.DisplayOrder, i.IsPrimary)).ToList()
    );
    #endregion
}

public class StockService : IStockService
{
    private readonly AtlasDbContext _context;
    private readonly IDistributedLockService _lockService;
    private readonly ILogger<StockService> _logger;

    public StockService(AtlasDbContext context, IDistributedLockService lockService, ILogger<StockService> logger)
    {
        _context = context;
        _lockService = lockService;
        _logger = logger;
    }

    public async Task<StockMovementResponse> CreateMovementAsync(Guid companyId, Guid? userId, StockMovementCreate request, CancellationToken ct = default)
    {
        // Distributed Lock para concorrência segura por produto
        var lockKey = $"product:{request.ProductId}:stock";
        await using var lockHandle = await _lockService.AcquireLockAsync(lockKey, TimeSpan.FromSeconds(10), TimeSpan.FromSeconds(5), ct);
        if (lockHandle == null)
        {
            throw new ConflictException("Outra operação de estoque está em andamento para este produto. Tente novamente.");
        }

        var product = await _context.Products.FirstOrDefaultAsync(p => p.CompanyId == companyId && p.Id == request.ProductId, ct);
        if (product == null) throw new NotFoundException("Produto não encontrado");

        var prevStock = product.StockQuantity;
        decimal newStock;

        var movementType = request.MovementType.ToUpperInvariant();
        if (movementType == "IN" || movementType == "PURCHASE" || movementType == "RETURN")
        {
            newStock = prevStock + request.Quantity;
        }
        else if (movementType == "OUT" || movementType == "SALE" || movementType == "DAMAGE" || movementType == "LOSS")
        {
            if (!product.AllowNegativeStock && prevStock < request.Quantity)
            {
                throw new AppException($"Estoque insuficiente. Disponível: {prevStock}, Requisitado: {request.Quantity}", 400);
            }
            newStock = prevStock - request.Quantity;
        }
        else if (movementType == "ADJUSTMENT")
        {
            newStock = request.Quantity;
        }
        else
        {
            newStock = prevStock + request.Quantity;
        }

        product.StockQuantity = newStock;

        var unitCost = request.UnitCost ?? product.CostPrice;
        var totalCost = unitCost * request.Quantity;

        var movement = new StockMovement
        {
            CompanyId = companyId,
            ProductId = product.Id,
            WarehouseId = request.WarehouseId,
            UserId = userId,
            MovementType = movementType,
            Reason = request.Reason,
            Quantity = request.Quantity,
            UnitCost = unitCost,
            TotalCost = totalCost,
            PreviousStock = prevStock,
            NewStock = newStock,
            ReferenceType = request.ReferenceType,
            ReferenceId = request.ReferenceId,
            Notes = request.Notes
        };

        _context.StockMovements.Add(movement);
        await _context.SaveChangesAsync(ct);

        return new StockMovementResponse(
            movement.Id,
            movement.CompanyId,
            movement.ProductId,
            product.Name,
            product.Sku,
            movement.WarehouseId,
            null,
            movement.UserId,
            null,
            movement.MovementType,
            movement.Reason,
            movement.Quantity,
            movement.UnitCost,
            movement.TotalCost,
            movement.PreviousStock,
            movement.NewStock,
            movement.ReferenceType,
            movement.ReferenceId,
            movement.Notes,
            movement.CreatedAt
        );
    }

    public async Task<PaginatedResponse<StockMovementResponse>> ListMovementsAsync(Guid companyId, int skip, int limit, Guid? productId, string? movementType, CancellationToken ct = default)
    {
        var query = _context.StockMovements
            .Include(m => m.Product)
            .Include(m => m.Warehouse)
            .Include(m => m.User)
            .Where(m => m.CompanyId == companyId);

        if (productId.HasValue) query = query.Where(m => m.ProductId == productId.Value);
        if (!string.IsNullOrWhiteSpace(movementType)) query = query.Where(m => m.MovementType == movementType.ToUpperInvariant());

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(m => m.CreatedAt)
            .Skip(skip)
            .Take(limit)
            .Select(m => new StockMovementResponse(
                m.Id,
                m.CompanyId,
                m.ProductId,
                m.Product.Name,
                m.Product.Sku,
                m.WarehouseId,
                m.Warehouse != null ? m.Warehouse.Name : null,
                m.UserId,
                m.User != null ? m.User.FullName : null,
                m.MovementType,
                m.Reason,
                m.Quantity,
                m.UnitCost,
                m.TotalCost,
                m.PreviousStock,
                m.NewStock,
                m.ReferenceType,
                m.ReferenceId,
                m.Notes,
                m.CreatedAt
            ))
            .ToListAsync(ct);

        return new PaginatedResponse<StockMovementResponse>(items, total, skip, limit);
    }

    public async Task<StockSummary> GetStockSummaryAsync(Guid companyId, CancellationToken ct = default)
    {
        var products = await _context.Products.Where(p => p.CompanyId == companyId).ToListAsync(ct);
        var total = products.Count;
        var totalValue = products.Sum(p => p.StockQuantity * p.CostPrice);
        var lowStock = products.Count(p => p.StockQuantity <= p.MinimumStock && p.StockQuantity > 0);
        var outOfStock = products.Count(p => p.StockQuantity <= 0);

        return new StockSummary(total, totalValue, lowStock, outOfStock);
    }

    public async Task<InventoryAdjustmentResponse> CreateAdjustmentAsync(Guid companyId, Guid? userId, InventoryAdjustmentCreate request, CancellationToken ct = default)
    {
        var adjustment = new InventoryAdjustment
        {
            CompanyId = companyId,
            WarehouseId = request.WarehouseId,
            UserId = userId,
            Reason = request.Reason,
            Status = "DRAFT",
            Notes = request.Notes
        };

        foreach (var it in request.Items)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.CompanyId == companyId && p.Id == it.ProductId, ct);
            if (product != null)
            {
                adjustment.Items.Add(new InventoryAdjustmentItem
                {
                    ProductId = product.Id,
                    PreviousQuantity = product.StockQuantity,
                    NewQuantity = it.NewQuantity,
                    UnitCost = it.UnitCost ?? product.CostPrice,
                    Notes = it.Notes
                });
            }
        }

        _context.InventoryAdjustments.Add(adjustment);
        await _context.SaveChangesAsync(ct);

        return await GetAdjustmentByIdAsync(companyId, adjustment.Id, ct) ?? throw new AppException("Erro ao carregar ajuste criado");
    }

    public async Task<InventoryAdjustmentResponse> ApplyAdjustmentAsync(Guid companyId, Guid adjustmentId, CancellationToken ct = default)
    {
        var adjustment = await _context.InventoryAdjustments
            .Include(a => a.Items)
            .FirstOrDefaultAsync(a => a.CompanyId == companyId && a.Id == adjustmentId, ct);

        if (adjustment == null) throw new NotFoundException("Ajuste de inventário não encontrado");
        if (adjustment.Status != "DRAFT") throw new AppException("Apenas ajustes em status DRAFT podem ser aplicados");

        foreach (var item in adjustment.Items)
        {
            await CreateMovementAsync(companyId, adjustment.UserId, new StockMovementCreate(
                ProductId: item.ProductId,
                WarehouseId: adjustment.WarehouseId,
                MovementType: "ADJUSTMENT",
                Reason: $"Ajuste de Inventário: {adjustment.Reason}",
                Quantity: item.NewQuantity,
                UnitCost: item.UnitCost,
                ReferenceType: "INVENTORY_ADJUSTMENT",
                ReferenceId: adjustment.Id,
                Notes: item.Notes
            ), ct);
        }

        adjustment.Status = "APPLIED";
        adjustment.AppliedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);

        return await GetAdjustmentByIdAsync(companyId, adjustmentId, ct) ?? throw new AppException("Erro ao carregar ajuste aplicado");
    }

    public async Task<InventoryAdjustmentResponse?> GetAdjustmentByIdAsync(Guid companyId, Guid adjustmentId, CancellationToken ct = default)
    {
        var a = await _context.InventoryAdjustments
            .Include(a => a.Items)
            .ThenInclude(i => i.Product)
            .Include(a => a.Warehouse)
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.CompanyId == companyId && a.Id == adjustmentId, ct);

        if (a == null) return null;

        return new InventoryAdjustmentResponse(
            a.Id,
            a.CompanyId,
            a.WarehouseId,
            a.Warehouse?.Name,
            a.UserId,
            a.User?.FullName,
            a.Reason,
            a.Status,
            a.AppliedAt,
            a.Notes,
            a.CreatedAt,
            a.Items.Select(i => new InventoryAdjustmentItemResponse(
                i.Id,
                i.AdjustmentId,
                i.ProductId,
                i.Product.Name,
                i.Product.Sku,
                i.PreviousQuantity,
                i.NewQuantity,
                i.Difference,
                i.UnitCost,
                i.Notes
            )).ToList()
        );
    }

    public async Task<PaginatedResponse<InventoryAdjustmentResponse>> ListAdjustmentsAsync(Guid companyId, int skip, int limit, CancellationToken ct = default)
    {
        var query = _context.InventoryAdjustments
            .Include(a => a.Items)
            .ThenInclude(i => i.Product)
            .Include(a => a.Warehouse)
            .Include(a => a.User)
            .Where(a => a.CompanyId == companyId);

        var total = await query.CountAsync(ct);
        var list = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip(skip)
            .Take(limit)
            .ToListAsync(ct);

        var items = list.Select(a => new InventoryAdjustmentResponse(
            a.Id,
            a.CompanyId,
            a.WarehouseId,
            a.Warehouse?.Name,
            a.UserId,
            a.User?.FullName,
            a.Reason,
            a.Status,
            a.AppliedAt,
            a.Notes,
            a.CreatedAt,
            a.Items.Select(i => new InventoryAdjustmentItemResponse(
                i.Id,
                i.AdjustmentId,
                i.ProductId,
                i.Product.Name,
                i.Product.Sku,
                i.PreviousQuantity,
                i.NewQuantity,
                i.Difference,
                i.UnitCost,
                i.Notes
            )).ToList()
        )).ToList();

        return new PaginatedResponse<InventoryAdjustmentResponse>(items, total, skip, limit);
    }
}
