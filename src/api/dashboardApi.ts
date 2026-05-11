import { http } from "./http";

import type { DashboardStatsResponse } from "../types/dashboard";

export async function getDashboardStats(): Promise<DashboardStatsResponse> {
  const response = await http.get<DashboardStatsResponse>("/dashboard/stats");
  return response.data;
}