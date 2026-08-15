"use client";

import { useCallback, useEffect, useState } from "react";
import { stockService } from "@/services/stockService";
import { StockMovement } from "@/types/product";

interface UseStockMovementsOptions {
  productId?: string;
  warehouseId?: string;
  movementType?: string;
  pageSize?: number;
}

export function useStockMovements(options: UseStockMovementsOptions = {}) {
  const { productId, warehouseId, movementType, pageSize = 20 } = options;

  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (currentSkip: number) => {
      try {
        setLoading(true);
        setError(null);
        const data = await stockService.listMovements(currentSkip, pageSize, {
          product_id: productId,
          warehouse_id: warehouseId,
          movement_type: movementType,
        });
        setMovements(data.items);
        setTotal(data.total);
      } catch {
        setError("Não foi possível carregar as movimentações.");
      } finally {
        setLoading(false);
      }
    },
    [productId, warehouseId, movementType, pageSize]
  );

  useEffect(() => {
    load(0);
    setSkip(0);
  }, [load]);

  const reload = () => load(skip);

  const goToPage = (newSkip: number) => {
    setSkip(newSkip);
    load(newSkip);
  };

  const currentPage = Math.floor(skip / pageSize);
  const totalPages = Math.ceil(total / pageSize);

  return {
    movements,
    total,
    skip,
    loading,
    error,
    currentPage,
    totalPages,
    pageSize,
    reload,
    goToPage,
  };
}

// ─── useKardex ────────────────────────────────────────────────────────────

export function useKardex(productId: string | null, pageSize = 50) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (currentSkip: number) => {
      if (!productId) return;
      try {
        setLoading(true);
        setError(null);
        const data = await stockService.getKardex(productId, currentSkip, pageSize);
        setMovements(data.items);
        setTotal(data.total);
      } catch {
        setError("Não foi possível carregar o Kardex.");
      } finally {
        setLoading(false);
      }
    },
    [productId, pageSize]
  );

  useEffect(() => {
    if (productId) {
      load(0);
      setSkip(0);
    }
  }, [productId, load]);

  const reload = () => load(skip);

  const goToPage = (newSkip: number) => {
    setSkip(newSkip);
    load(newSkip);
  };

  return {
    movements,
    total,
    skip,
    loading,
    error,
    currentPage: Math.floor(skip / pageSize),
    totalPages: Math.ceil(total / pageSize),
    reload,
    goToPage,
  };
}
