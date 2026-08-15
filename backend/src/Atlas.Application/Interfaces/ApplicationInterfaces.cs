using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Atlas.Application.Common;
using Atlas.Application.DTOs;

namespace Atlas.Application.Interfaces;

public interface ICacheService
{
    Task<T?> GetAsync<T>(string key, CancellationToken ct = default);
    Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken ct = default);
    Task RemoveAsync(string key, CancellationToken ct = default);
    Task RemoveByPrefixAsync(string prefix, CancellationToken ct = default);
}

public interface IDistributedLockService
{
    Task<IAsyncDisposable?> AcquireLockAsync(string key, TimeSpan expiry, TimeSpan timeout, CancellationToken ct = default);
}

public interface IAuthService
{
    Task<TokenResponse> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<TokenResponse> RefreshAsync(RefreshTokenRequest request, CancellationToken ct = default);
    Task RecoverPasswordAsync(PasswordRecoveryRequest request, CancellationToken ct = default);
    Task ResetPasswordAsync(PasswordResetRequest request, CancellationToken ct = default);
}

public interface IUserService
{
    Task<List<UserListItem>> ListUsersAsync(Guid companyId, CancellationToken ct = default);
    Task<UserListItem> UpdateProfileAsync(Guid userId, UserProfileUpdate request, CancellationToken ct = default);
    Task ChangePasswordAsync(Guid userId, UserChangePassword request, CancellationToken ct = default);
}

public interface IDashboardService
{
    Task<DashboardResponse> GetDashboardDataAsync(Guid companyId, CancellationToken ct = default);
}

public interface ICustomerService
{
    Task<CustomerResponse> CreateAsync(Guid companyId, CustomerCreate request, CancellationToken ct = default);
    Task<PaginatedResponse<CustomerResponse>> ListAsync(Guid companyId, int skip, int limit, string? search, CancellationToken ct = default);
    Task<CustomerResponse?> GetByIdAsync(Guid companyId, Guid customerId, CancellationToken ct = default);
    Task<CustomerResponse> UpdateAsync(Guid companyId, Guid customerId, CustomerUpdate request, CancellationToken ct = default);
    Task DeleteAsync(Guid companyId, Guid customerId, CancellationToken ct = default);
}

public interface IProductService
{
    // Product Catalog
    Task<ProductResponse> CreateProductAsync(Guid companyId, ProductCreate request, CancellationToken ct = default);
    Task<PaginatedResponse<ProductResponse>> ListProductsAsync(Guid companyId, int skip, int limit, string? search, Guid? categoryId, Guid? brandId, bool? lowStock, CancellationToken ct = default);
    Task<ProductResponse?> GetProductByIdAsync(Guid companyId, Guid productId, CancellationToken ct = default);
    Task<ProductResponse> UpdateProductAsync(Guid companyId, Guid productId, ProductUpdate request, CancellationToken ct = default);
    Task DeleteProductAsync(Guid companyId, Guid productId, CancellationToken ct = default);

    // Product Images
    Task<ProductImageResponse> AddProductImageAsync(Guid companyId, Guid productId, ProductImageCreate request, CancellationToken ct = default);
    Task DeleteProductImageAsync(Guid companyId, Guid productId, Guid imageId, CancellationToken ct = default);

    // Categories
    Task<CategoryResponse> CreateCategoryAsync(Guid companyId, CategoryCreate request, CancellationToken ct = default);
    Task<List<CategoryResponse>> ListCategoriesAsync(Guid companyId, CancellationToken ct = default);
    Task<CategoryResponse> UpdateCategoryAsync(Guid companyId, Guid categoryId, CategoryUpdate request, CancellationToken ct = default);
    Task DeleteCategoryAsync(Guid companyId, Guid categoryId, CancellationToken ct = default);

    // Brands
    Task<BrandResponse> CreateBrandAsync(Guid companyId, BrandCreate request, CancellationToken ct = default);
    Task<List<BrandResponse>> ListBrandsAsync(Guid companyId, CancellationToken ct = default);
    Task<BrandResponse> UpdateBrandAsync(Guid companyId, Guid brandId, BrandUpdate request, CancellationToken ct = default);
    Task DeleteBrandAsync(Guid companyId, Guid brandId, CancellationToken ct = default);

    // Units
    Task<UnitResponse> CreateUnitAsync(Guid companyId, UnitCreate request, CancellationToken ct = default);
    Task<List<UnitResponse>> ListUnitsAsync(Guid companyId, CancellationToken ct = default);
    Task<UnitResponse> UpdateUnitAsync(Guid companyId, Guid unitId, UnitUpdate request, CancellationToken ct = default);
    Task DeleteUnitAsync(Guid companyId, Guid unitId, CancellationToken ct = default);

    // Warehouses
    Task<WarehouseResponse> CreateWarehouseAsync(Guid companyId, WarehouseCreate request, CancellationToken ct = default);
    Task<List<WarehouseResponse>> ListWarehousesAsync(Guid companyId, CancellationToken ct = default);
    Task<WarehouseResponse> UpdateWarehouseAsync(Guid companyId, Guid warehouseId, WarehouseUpdate request, CancellationToken ct = default);
    Task DeleteWarehouseAsync(Guid companyId, Guid warehouseId, CancellationToken ct = default);
}

public interface IStockService
{
    Task<StockMovementResponse> CreateMovementAsync(Guid companyId, Guid? userId, StockMovementCreate request, CancellationToken ct = default);
    Task<PaginatedResponse<StockMovementResponse>> ListMovementsAsync(Guid companyId, int skip, int limit, Guid? productId, string? movementType, CancellationToken ct = default);
    Task<StockSummary> GetStockSummaryAsync(Guid companyId, CancellationToken ct = default);

    // Adjustments
    Task<InventoryAdjustmentResponse> CreateAdjustmentAsync(Guid companyId, Guid? userId, InventoryAdjustmentCreate request, CancellationToken ct = default);
    Task<InventoryAdjustmentResponse> ApplyAdjustmentAsync(Guid companyId, Guid adjustmentId, CancellationToken ct = default);
    Task<InventoryAdjustmentResponse?> GetAdjustmentByIdAsync(Guid companyId, Guid adjustmentId, CancellationToken ct = default);
    Task<PaginatedResponse<InventoryAdjustmentResponse>> ListAdjustmentsAsync(Guid companyId, int skip, int limit, CancellationToken ct = default);
}
