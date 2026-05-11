import api from "axios";

import type { DashboardStatsResponse } from "../types/dashboard";

export async function getDashboardStats(): Promise<DashboardStatsResponse> {
  const response = await api.get("/dashboard/stats");

  return response.data;
}