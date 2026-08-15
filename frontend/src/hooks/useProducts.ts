"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  productService,
  categoryService,
  brandService,
  unitService,
  warehouseService,
} from "@/services/productService";
import {
  ProductListItem,
  ProductFilters,
  Category,
  Brand,
  Unit,
  Warehouse,
  StockSummary,
} from "@/types/product";

// ─── useProducts ──────────────────────────────────────────────────────────

interface UseProductsOptions {
  initialFilters?: ProductFilters;
  pageSize?: number;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { initialFilters = {}, pageSize = 20 } = options;

  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const load = useCallback(
    async (currentSkip: number, currentFilters: ProductFilters) => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.list(currentSkip, pageSize, currentFilters);
        setProducts(data.items);
        setTotal(data.total);
      } catch {
        setError("Não foi possível carregar os produtos.");
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  // Debounce search changes
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      load(0, filters);
      setSkip(0);
    }, 400);
    return () => clearTimeout(debounceTimer.current);
  }, [filters, load]);

  const reload = () => load(skip, filters);

  const goToPage = (newSkip: number) => {
    setSkip(newSkip);
    load(newSkip, filters);
  };

  const updateFilter = <K extends keyof ProductFilters>(
    key: K,
    value: ProductFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const currentPage = Math.floor(skip / pageSize);
  const totalPages = Math.ceil(total / pageSize);

  return {
    products,
    total,
    skip,
    loading,
    error,
    filters,
    currentPage,
    totalPages,
    pageSize,
    reload,
    goToPage,
    updateFilter,
    clearFilters,
    setFilters,
  };
}

// ─── useStockSummary ─────────────────────────────────────────────────────

export function useStockSummary() {
  const [summary, setSummary] = useState<StockSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    productService
      .getSummary()
      .then(setSummary)
      .catch(() => setError("Erro ao carregar resumo."))
      .finally(() => setLoading(false));
  }, []);

  return { summary, loading, error };
}

// ─── useCategories ────────────────────────────────────────────────────────

export function useCategories(activeOnly = false) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryService
      .list(0, 200, undefined, activeOnly ? true : undefined)
      .then((d) => setCategories(d.items))
      .finally(() => setLoading(false));
  }, [activeOnly]);

  return { categories, loading };
}

// ─── useBrands ────────────────────────────────────────────────────────────

export function useBrands(activeOnly = false) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    brandService
      .list(0, 200, undefined, activeOnly ? true : undefined)
      .then((d) => setBrands(d.items))
      .finally(() => setLoading(false));
  }, [activeOnly]);

  return { brands, loading };
}

// ─── useUnits ─────────────────────────────────────────────────────────────

export function useUnits(activeOnly = false) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    unitService
      .list(0, 200, undefined, activeOnly ? true : undefined)
      .then((d) => setUnits(d.items))
      .finally(() => setLoading(false));
  }, [activeOnly]);

  return { units, loading };
}

// ─── useWarehouses ────────────────────────────────────────────────────────

export function useWarehouses(activeOnly = false) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    warehouseService
      .list(0, 200, undefined, activeOnly ? true : undefined)
      .then((d) => setWarehouses(d.items))
      .finally(() => setLoading(false));
  }, [activeOnly]);

  return { warehouses, loading };
}
