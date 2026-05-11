export type DashboardKpis = {
  total_revenue: number;
  total_net_revenue: number;
  total_contracts: number;
  total_km: number;
};

export type DashboardChartItem = {
  name: string;
  value: number;
};

export type DashboardMonthItem = {
  month: string;
  value: number;
};

export type DashboardVehicleStats = {
  vehicle: string;
  contracts: number;
  revenue: number;
  net_revenue: number;
  km: number;
};

export type DashboardStatsResponse = {
  kpis: DashboardKpis;

  source_distribution: DashboardChartItem[];

  revenue_by_vehicle: DashboardChartItem[];
  km_by_vehicle: DashboardChartItem[];

  revenue_by_month: DashboardMonthItem[];
  contracts_by_month: DashboardMonthItem[];

  vehicles: DashboardVehicleStats[];
};