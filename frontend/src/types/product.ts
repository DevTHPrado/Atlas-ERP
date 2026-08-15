// ─────────────────────────────────────────────
// Types — Products & Stock Module
// ─────────────────────────────────────────────

export type MovementType =
  | "ENTRY"
  | "EXIT"
  | "TRANSFER"
  | "ADJUSTMENT"
  | "INVENTORY";

export type AdjustmentStatus = "PENDING" | "APPROVED" | "CANCELLED";

// ─── Lightweight refs (used in nested objects) ────────────────────────────

export interface CategoryRef {
  id: string;
  name: string;
}

export interface BrandRef {
  id: string;
  name: string;
}

export interface UnitRef {
  id: string;
  name: string;
  abbreviation: string;
}

// ─── Category ─────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CategoryCreate = {
  name: string;
  description?: string | null;
  is_active?: boolean;
};

export type CategoryUpdate = Partial<CategoryCreate>;

// ─── Brand ────────────────────────────────────────────────────────────────

export interface Brand {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type BrandCreate = {
  name: string;
  description?: string | null;
  is_active?: boolean;
};

export type BrandUpdate = Partial<BrandCreate>;

// ─── Unit ─────────────────────────────────────────────────────────────────

export interface Unit {
  id: string;
  company_id: string;
  name: string;
  abbreviation: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type UnitCreate = {
  name: string;
  abbreviation: string;
  description?: string | null;
  is_active?: boolean;
};

export type UnitUpdate = Partial<UnitCreate>;

// ─── Warehouse ────────────────────────────────────────────────────────────

export interface Warehouse {
  id: string;
  company_id: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type WarehouseCreate = {
  name: string;
  code: string;
  description?: string | null;
  is_active?: boolean;
};

export type WarehouseUpdate = Partial<WarehouseCreate>;

// ─── ProductImage ─────────────────────────────────────────────────────────

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_main: boolean;
  created_at: string;
}

// ─── Product ──────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  company_id: string;
  // Identity
  internal_code: string | null;
  sku: string;
  barcode: string | null;
  // Basic info
  name: string;
  short_description: string | null;
  full_description: string | null;
  // Classification
  category_id: string | null;
  brand_id: string | null;
  unit_id: string | null;
  supplier_id: string | null;
  category: CategoryRef | null;
  brand: BrandRef | null;
  unit: UnitRef | null;
  // Pricing
  cost_price: string;
  average_price: string;
  sale_price: string;
  promotional_price: string | null;
  margin: string;
  // Fiscal
  ncm: string | null;
  cest: string | null;
  cfop: string | null;
  origin: string | null;
  // Dimensions
  weight: string | null;
  height: string | null;
  width: string | null;
  length: string | null;
  volume: string | null;
  // Image
  main_image_url: string | null;
  // Stock
  stock_quantity: string;
  reserved_quantity: string;
  available_quantity: string;
  minimum_stock: string;
  maximum_stock: string | null;
  physical_location: string | null;
  allow_negative_stock: boolean;
  is_low_stock: boolean;
  is_out_of_stock: boolean;
  // Meta
  notes: string | null;
  is_active: boolean;
  controls_stock: boolean;
  allows_sale: boolean;
  created_at: string;
  updated_at: string;
}

export type ProductCreate = {
  internal_code?: string | null;
  sku: string;
  barcode?: string | null;
  name: string;
  short_description?: string | null;
  full_description?: string | null;
  category_id?: string | null;
  brand_id?: string | null;
  unit_id?: string | null;
  supplier_id?: string | null;
  cost_price?: string | number;
  sale_price?: string | number;
  promotional_price?: string | number | null;
  ncm?: string | null;
  cest?: string | null;
  cfop?: string | null;
  origin?: string | null;
  weight?: string | number | null;
  height?: string | number | null;
  width?: string | number | null;
  length?: string | number | null;
  volume?: string | number | null;
  main_image_url?: string | null;
  minimum_stock?: string | number;
  maximum_stock?: string | number | null;
  physical_location?: string | null;
  allow_negative_stock?: boolean;
  controls_stock?: boolean;
  allows_sale?: boolean;
  notes?: string | null;
  is_active?: boolean;
};

export type ProductUpdate = Partial<ProductCreate>;

// ─── Product List (lightweight) ───────────────────────────────────────────

export interface ProductListItem {
  id: string;
  company_id: string;
  internal_code: string | null;
  sku: string;
  barcode: string | null;
  name: string;
  short_description: string | null;
  category: CategoryRef | null;
  brand: BrandRef | null;
  unit: UnitRef | null;
  cost_price: string;
  sale_price: string;
  average_price: string;
  margin: string;
  stock_quantity: string;
  reserved_quantity: string;
  minimum_stock: string;
  is_active: boolean;
  controls_stock: boolean;
  allows_sale: boolean;
  is_low_stock: boolean;
  is_out_of_stock: boolean;
  main_image_url: string | null;
  created_at: string;
  updated_at: string;
}

// ─── StockMovement ────────────────────────────────────────────────────────

export interface StockMovement {
  id: string;
  company_id: string;
  product_id: string;
  warehouse_id: string | null;
  movement_type: MovementType;
  quantity: string;
  unit_cost: string | null;
  balance_after: string;
  reference_type: string | null;
  reference_id: string | null;
  reason: string;
  notes: string | null;
  created_at: string;
  product: ProductListItem | null;
}

export type StockMovementCreate = {
  product_id: string;
  warehouse_id?: string | null;
  movement_type: MovementType;
  quantity: string | number;
  unit_cost?: string | number | null;
  reason: string;
  notes?: string | null;
  destination_warehouse_id?: string | null;
};

// ─── InventoryAdjustment ──────────────────────────────────────────────────

export interface InventoryAdjustment {
  id: string;
  company_id: string;
  product_id: string;
  warehouse_id: string | null;
  created_by: string | null;
  approved_by: string | null;
  expected_quantity: string;
  actual_quantity: string;
  difference: string;
  unit_cost: string | null;
  reason: string | null;
  status: AdjustmentStatus;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  product: ProductListItem | null;
}

export type InventoryAdjustmentCreate = {
  product_id: string;
  warehouse_id?: string | null;
  expected_quantity: string | number;
  actual_quantity: string | number;
  unit_cost?: string | number | null;
  reason?: string | null;
};

// ─── Stock Summary ────────────────────────────────────────────────────────

export interface StockSummary {
  total_products: number;
  active_products: number;
  inactive_products: number;
  out_of_stock: number;
  low_stock: number;
  total_stock_value: string;
  total_items_in_stock: string;
}

// ─── Product Filters ──────────────────────────────────────────────────────

export interface ProductFilters {
  search?: string;
  category_id?: string;
  brand_id?: string;
  supplier_id?: string;
  unit_id?: string;
  is_active?: boolean;
  low_stock_only?: boolean;
  out_of_stock_only?: boolean;
  min_price?: number;
  max_price?: number;
}

// ─── Shared ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  total: number;
  items: T[];
  skip: number;
  limit: number;
}
