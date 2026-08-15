using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Atlas.Api.Security;
using Atlas.Application.Common;
using Atlas.Application.DTOs;
using Atlas.Application.Exceptions;
using Atlas.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Atlas.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/customers")]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _customerService;
    private readonly ICurrentUserService _currentUser;

    public CustomersController(ICustomerService customerService, ICurrentUserService currentUser)
    {
        _customerService = customerService;
        _currentUser = currentUser;
    }

    [HttpPost]
    public async Task<ActionResult<CustomerResponse>> Create([FromBody] CustomerCreate request, CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        var customer = await _customerService.CreateAsync(_currentUser.CompanyId.Value, request, ct);
        return StatusCode(201, customer);
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResponse<CustomerResponse>>> List(
        [FromQuery] int skip = 0,
        [FromQuery] int limit = 20,
        [FromQuery] string? search = null,
        CancellationToken ct = default)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        var result = await _customerService.ListAsync(_currentUser.CompanyId.Value, skip, limit, search, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CustomerResponse>> GetById(Guid id, CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        var customer = await _customerService.GetByIdAsync(_currentUser.CompanyId.Value, id, ct);
        if (customer == null) throw new NotFoundException("Cliente não encontrado");
        return Ok(customer);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CustomerResponse>> Update(Guid id, [FromBody] CustomerUpdate request, CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        var customer = await _customerService.UpdateAsync(_currentUser.CompanyId.Value, id, request, ct);
        return Ok(customer);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        await _customerService.DeleteAsync(_currentUser.CompanyId.Value, id, ct);
        return NoContent();
    }
}

[ApiController]
[Authorize]
[Route("api/v1/products")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IStockService _stockService;
    private readonly ICurrentUserService _currentUser;

    public ProductsController(IProductService productService, IStockService stockService, ICurrentUserService currentUser)
    {
        _productService = productService;
        _stockService = stockService;
        _currentUser = currentUser;
    }

    #region Product Catalog
    [HttpPost]
    public async Task<ActionResult<ProductResponse>> CreateProduct([FromBody] ProductCreate request, CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        var product = await _productService.CreateProductAsync(_currentUser.CompanyId.Value, request, ct);
        return StatusCode(201, product);
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResponse<ProductResponse>>> ListProducts(
        [FromQuery] int skip = 0,
        [FromQuery] int limit = 20,
        [FromQuery] string? search = null,
        [FromQuery] Guid? categoryId = null,
        [FromQuery] Guid? brandId = null,
        [FromQuery] bool? lowStock = null,
        CancellationToken ct = default)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        var result = await _productService.ListProductsAsync(_currentUser.CompanyId.Value, skip, limit, search, categoryId, brandId, lowStock, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProductResponse>> GetProductById(Guid id, CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        var product = await _productService.GetProductByIdAsync(_currentUser.CompanyId.Value, id, ct);
        if (product == null) throw new NotFoundException("Produto não encontrado");
        return Ok(product);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ProductResponse>> UpdateProduct(Guid id, [FromBody] ProductUpdate request, CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        var product = await _productService.UpdateProductAsync(_currentUser.CompanyId.Value, id, request, ct);
        return Ok(product);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteProduct(Guid id, CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        await _productService.DeleteProductAsync(_currentUser.CompanyId.Value, id, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/images")]
    public async Task<ActionResult<ProductImageResponse>> AddProductImage(Guid id, [FromBody] ProductImageCreate request, CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        var image = await _productService.AddProductImageAsync(_currentUser.CompanyId.Value, id, request, ct);
        return StatusCode(201, image);
    }

    [HttpDelete("{id:guid}/images/{imageId:guid}")]
    public async Task<IActionResult> DeleteProductImage(Guid id, Guid imageId, CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        await _productService.DeleteProductImageAsync(_currentUser.CompanyId.Value, id, imageId, ct);
        return NoContent();
    }
    #endregion

    #region Categories
    [HttpPost("categories")]
    public async Task<ActionResult<CategoryResponse>> CreateCategory([FromBody] CategoryCreate request, CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        var cat = await _productService.CreateCategoryAsync(_currentUser.CompanyId.Value, request, ct);
        return StatusCode(201, cat);
    }

    [HttpGet("categories")]
    public async Task<ActionResult<List<CategoryResponse>>> ListCategories(CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        var list = await _productService.ListCategoriesAsync(_currentUser.CompanyId.Value, ct);
        return Ok(list);
    }

    [HttpPut("categories/{id:guid}")]
    public async Task<ActionResult<CategoryResponse>> UpdateCategory(Guid id, [FromBody] CategoryUpdate request, CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        var cat = await _productService.UpdateCategoryAsync(_currentUser.CompanyId.Value, id, request, ct);
        return Ok(cat);
    }

    [HttpDelete("categories/{id:guid}")]
    public async Task<IActionResult> DeleteCategory(Guid id, CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        await _productService.DeleteCategoryAsync(_currentUser.CompanyId.Value, id, ct);
        return NoContent();
    }
    #endregion

    #region Brands
    [HttpPost("brands")]
    public async Task<ActionResult<BrandResponse>> CreateBrand([FromBody] BrandCreate request, CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        var brand = await _productService.CreateBrandAsync(_currentUser.CompanyId.Value, request, ct);
        return StatusCode(201, brand);
    }

    [HttpGet("brands")]
    public async Task<ActionResult<List<BrandResponse>>> ListBrands(CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        var list = await _productService.ListBrandsAsync(_currentUser.CompanyId.Value, ct);
        return Ok(list);
    }

    [HttpPut("brands/{id:guid}")]
    public async Task<ActionResult<BrandResponse>> UpdateBrand(Guid id, [FromBody] BrandUpdate request, CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        var brand = await _productService.UpdateBrandAsync(_currentUser.CompanyId.Value, id, request, ct);
        return Ok(brand);
    }

    [HttpDelete("brands/{id:guid}")]
    public async Task<IActionResult> DeleteBrand(Guid id, CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        await _productService.DeleteBrandAsync(_currentUser.CompanyId.Value, id, ct);
        return NoContent();
    }
    #endregion

    #region Units
    [HttpPost("units")]
    public async Task<ActionResult<UnitResponse>> CreateUnit([FromBody] UnitCreate request, CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        var unit = await _productService.CreateUnitAsync(_currentUser.CompanyId.Value, request, ct);
        return StatusCode(201, unit);
    }

    [HttpGet("units")]
    public async Task<ActionResult<List<UnitResponse>>> ListUnits(CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        var list = await _productService.ListUnitsAsync(_currentUser.CompanyId.Value, ct);
        return Ok(list);
    }

    [HttpPut("units/{id:guid}")]
    public async Task<ActionResult<UnitResponse>> UpdateUnit(Guid id, [FromBody] UnitUpdate request, CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        var unit = await _productService.UpdateUnitAsync(_currentUser.CompanyId.Value, id, request, ct);
        return Ok(unit);
    }

    [HttpDelete("units/{id:guid}")]
    public async Task<IActionResult> DeleteUnit(Guid id, CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        await _productService.DeleteUnitAsync(_currentUser.CompanyId.Value, id, ct);
        return NoContent();
    }
    #endregion

    #region Warehouses
    [HttpPost("warehouses")]
    public async Task<ActionResult<WarehouseResponse>> CreateWarehouse([FromBody] WarehouseCreate request, CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        var wh = await _productService.CreateWarehouseAsync(_currentUser.CompanyId.Value, request, ct);
        return StatusCode(201, wh);
    }

    [HttpGet("warehouses")]
    public async Task<ActionResult<List<WarehouseResponse>>> ListWarehouses(CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        var list = await _productService.ListWarehousesAsync(_currentUser.CompanyId.Value, ct);
        return Ok(list);
    }

    [HttpPut("warehouses/{id:guid}")]
    public async Task<ActionResult<WarehouseResponse>> UpdateWarehouse(Guid id, [FromBody] WarehouseUpdate request, CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        var wh = await _productService.UpdateWarehouseAsync(_currentUser.CompanyId.Value, id, request, ct);
        return Ok(wh);
    }

    [HttpDelete("warehouses/{id:guid}")]
    public async Task<IActionResult> DeleteWarehouse(Guid id, CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        await _productService.DeleteWarehouseAsync(_currentUser.CompanyId.Value, id, ct);
        return NoContent();
    }
    #endregion

    #region Stock & Adjustments
    [HttpPost("stock-movements")]
    public async Task<ActionResult<StockMovementResponse>> CreateStockMovement([FromBody] StockMovementCreate request, CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        var movement = await _stockService.CreateMovementAsync(_currentUser.CompanyId.Value, _currentUser.UserId, request, ct);
        return StatusCode(201, movement);
    }

    [HttpGet("stock-movements")]
    public async Task<ActionResult<PaginatedResponse<StockMovementResponse>>> ListStockMovements(
        [FromQuery] int skip = 0,
        [FromQuery] int limit = 20,
        [FromQuery] Guid? productId = null,
        [FromQuery] string? movementType = null,
        CancellationToken ct = default)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        var result = await _stockService.ListMovementsAsync(_currentUser.CompanyId.Value, skip, limit, productId, movementType, ct);
        return Ok(result);
    }

    [HttpGet("stock-summary")]
    public async Task<ActionResult<StockSummary>> GetStockSummary(CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        var summary = await _stockService.GetStockSummaryAsync(_currentUser.CompanyId.Value, ct);
        return Ok(summary);
    }

    [HttpPost("inventory-adjustments")]
    public async Task<ActionResult<InventoryAdjustmentResponse>> CreateInventoryAdjustment([FromBody] InventoryAdjustmentCreate request, CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        var adj = await _stockService.CreateAdjustmentAsync(_currentUser.CompanyId.Value, _currentUser.UserId, request, ct);
        return StatusCode(201, adj);
    }

    [HttpPost("inventory-adjustments/{id:guid}/apply")]
    public async Task<ActionResult<InventoryAdjustmentResponse>> ApplyInventoryAdjustment(Guid id, CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        var adj = await _stockService.ApplyAdjustmentAsync(_currentUser.CompanyId.Value, id, ct);
        return Ok(adj);
    }

    [HttpGet("inventory-adjustments/{id:guid}")]
    public async Task<ActionResult<InventoryAdjustmentResponse>> GetInventoryAdjustment(Guid id, CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        var adj = await _stockService.GetAdjustmentByIdAsync(_currentUser.CompanyId.Value, id, ct);
        if (adj == null) throw new NotFoundException("Ajuste não encontrado");
        return Ok(adj);
    }

    [HttpGet("inventory-adjustments")]
    public async Task<ActionResult<PaginatedResponse<InventoryAdjustmentResponse>>> ListInventoryAdjustments(
        [FromQuery] int skip = 0,
        [FromQuery] int limit = 20,
        CancellationToken ct = default)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        var result = await _stockService.ListAdjustmentsAsync(_currentUser.CompanyId.Value, skip, limit, ct);
        return Ok(result);
    }
    #endregion
}
