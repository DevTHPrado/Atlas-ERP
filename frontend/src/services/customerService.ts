import api from "@/lib/axios";
import {
  Customer,
  CustomerCreate,
  CustomerUpdate,
  PaginatedResponse,
} from "../types/customer";

export const customerService = {
  list: async (
    skip = 0,
    limit = 20,
    search?: string
  ): Promise<PaginatedResponse<Customer>> => {
    const response = await api.get("/customers", {
      params: { skip, limit, search },
    });
    return response.data;
  },

  get: async (id: string): Promise<Customer> => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  create: async (data: CustomerCreate): Promise<Customer> => {
    const response = await api.post("/customers", data);
    return response.data;
  },

  update: async (id: string, data: CustomerUpdate): Promise<Customer> => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },
};
