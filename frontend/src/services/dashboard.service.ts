import apiClient from "@/services/api-client";
import { dashboardSchema, type Dashboard } from "@/types/dashboard.types";

/**
 * Fetch executive dashboard data (KPIs, charts).
 */
export async function getDashboard(): Promise<Dashboard> {
  const { data } = await apiClient.get("/dashboard");
  return dashboardSchema.parse(data);
}
