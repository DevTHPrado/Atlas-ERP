import api from "@/lib/axios";
import {
  PaginatedResponse,
  StockMovement,
  StockMovementCreate,
} from "@/types/product";

export const stockService = {
  listMovements: async (
    skip = 0,
    limit = 20,
    params?: {
      product_id?: string;
      warehouse_id?: string;
      movement_type?: string;
    }
  ): Promise<PaginatedResponse<StockMovement>> => {
    const res = await api.get("/stock/movements", {
      params: { skip, limit, ...params },
    });
    return res.data;
  },

  registerMovement: async (
    data: StockMovementCreate
  ): Promise<StockMovement> => {
    const res = await api.post("/stock/movements", data);
    return res.data;
  },

  getKardex: async (
    productId: string,
    skip = 0,
    limit = 50
  ): Promise<PaginatedResponse<StockMovement>> => {
    const res = await api.get(`/stock/kardex/${productId}`, {
      params: { skip, limit },
    });
    return res.data;
  },
};
