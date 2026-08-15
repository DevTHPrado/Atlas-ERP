import api from "@/lib/axios";
import {
  Brand,
  BrandCreate,
  BrandUpdate,
  Category,
  CategoryCreate,
  CategoryUpdate,
  InventoryAdjustment,
  InventoryAdjustmentCreate,
  PaginatedResponse,
  Product,
  ProductCreate,
  ProductFilters,
  ProductImage,
  ProductListItem,
  ProductUpdate,
  StockSummary,
  Unit,
  UnitCreate,
  UnitUpdate,
  Warehouse,
  WarehouseCreate,
  WarehouseUpdate,
} from "@/types/product";

// ─── Categories ──────────────────────────────────────────────────────────

export const categoryService = {
  list: async (
    skip = 0,
    limit = 50,
    search?: string,
    is_active?: boolean
  ): Promise<PaginatedResponse<Category>> => {
    const res = await api.get("/categories", {
      params: { skip, limit, search, is_active },
    });
    return res.data;
  },

  create: async (data: CategoryCreate): Promise<Category> => {
    const res = await api.post("/categories", data);
    return res.data;
  },

  update: async (id: string, data: CategoryUpdate): Promise<Category> => {
    const res = await api.put(`/categories/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

// ─── Brands ───────────────────────────────────────────────────────────────

export const brandService = {
  list: async (
    skip = 0,
    limit = 50,
    search?: string,
    is_active?: boolean
  ): Promise<PaginatedResponse<Brand>> => {
    const res = await api.get("/brands", {
      params: { skip, limit, search, is_active },
    });
    return res.data;
  },

  create: async (data: BrandCreate): Promise<Brand> => {
    const res = await api.post("/brands", data);
    return res.data;
  },

  update: async (id: string, data: BrandUpdate): Promise<Brand> => {
    const res = await api.put(`/brands/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/brands/${id}`);
  },
};

// ─── Units ────────────────────────────────────────────────────────────────

export const unitService = {
  list: async (
    skip = 0,
    limit = 50,
    search?: string,
    is_active?: boolean
  ): Promise<PaginatedResponse<Unit>> => {
    const res = await api.get("/units", {
      params: { skip, limit, search, is_active },
    });
    return res.data;
  },

  create: async (data: UnitCreate): Promise<Unit> => {
    const res = await api.post("/units", data);
    return res.data;
  },

  update: async (id: string, data: UnitUpdate): Promise<Unit> => {
    const res = await api.put(`/units/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/units/${id}`);
  },
};

// ─── Warehouses ───────────────────────────────────────────────────────────

export const warehouseService = {
  list: async (
    skip = 0,
    limit = 50,
    search?: string,
    is_active?: boolean
  ): Promise<PaginatedResponse<Warehouse>> => {
    const res = await api.get("/warehouses", {
      params: { skip, limit, search, is_active },
    });
    return res.data;
  },

  create: async (data: WarehouseCreate): Promise<Warehouse> => {
    const res = await api.post("/warehouses", data);
    return res.data;
  },

  update: async (id: string, data: WarehouseUpdate): Promise<Warehouse> => {
    const res = await api.put(`/warehouses/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/warehouses/${id}`);
  },
};

// ─── Products ─────────────────────────────────────────────────────────────

export const productService = {
  list: async (
    skip = 0,
    limit = 20,
    filters?: ProductFilters
  ): Promise<PaginatedResponse<ProductListItem>> => {
    const res = await api.get("/products", {
      params: { skip, limit, ...filters },
    });
    return res.data;
  },

  get: async (id: string): Promise<Product> => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },

  create: async (data: ProductCreate): Promise<Product> => {
    const res = await api.post("/products", data);
    return res.data;
  },

  update: async (id: string, data: ProductUpdate): Promise<Product> => {
    const res = await api.put(`/products/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  addImage: async (
    productId: string,
    data: {
      url: string;
      alt_text?: string;
      sort_order?: number;
      is_main?: boolean;
    }
  ): Promise<ProductImage> => {
    const res = await api.post(`/products/${productId}/images`, data);
    return res.data;
  },

  deleteImage: async (
    productId: string,
    imageId: string
  ): Promise<void> => {
    await api.delete(`/products/${productId}/images/${imageId}`);
  },

  getSummary: async (): Promise<StockSummary> => {
    const res = await api.get("/stock/summary");
    return res.data;
  },
};

// ─── Inventory Adjustments ────────────────────────────────────────────────

export const inventoryService = {
  list: async (
    skip = 0,
    limit = 20,
    product_id?: string,
    status?: string
  ): Promise<PaginatedResponse<InventoryAdjustment>> => {
    const res = await api.get("/inventory/adjustments", {
      params: { skip, limit, product_id, status },
    });
    return res.data;
  },

  create: async (
    data: InventoryAdjustmentCreate
  ): Promise<InventoryAdjustment> => {
    const res = await api.post("/inventory/adjustments", data);
    return res.data;
  },

  approve: async (id: string): Promise<InventoryAdjustment> => {
    const res = await api.put(`/inventory/adjustments/${id}/approve`);
    return res.data;
  },

  cancel: async (id: string): Promise<InventoryAdjustment> => {
    const res = await api.put(`/inventory/adjustments/${id}/cancel`);
    return res.data;
  },
};
