export type DashboardKpis = {
  total_revenue: number;
  total_net_revenue: number;
  total_contracts: number;
  total_km: number;
  total_damage_fees: number;
};

export type DashboardChartItem = {
  name: string;
  value: number;
};

export type DashboardMonthItem = {
  month: string;
  value: number;
};

export type DashboardDamageFeeContract = {
  id: number;
  contract_number: string;
  customer_name: string;
  start_date: string;
  end_date: string;
  damage_fee: number;
  notes: string | null;
};

export type DashboardVehicleStats = {
  vehicle_id: number;
  vehicle: string;
  contracts: number;
  revenue: number;
  net_revenue: number;
  damage_fees: number;
  damage_fee_contracts: DashboardDamageFeeContract[];
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