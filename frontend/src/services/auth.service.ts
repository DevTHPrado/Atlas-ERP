import apiClient from "@/services/api-client";
import { loginResponseSchema, type LoginResponse } from "@/types/auth.types";

/**
 * Authenticate a user with email and password.
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post("/auth/login", { email, password });
  return loginResponseSchema.parse(data);
}

/**
 * Invalidate the current session.
 */
export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}
