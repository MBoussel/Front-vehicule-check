export type FuelType = "essence" | "diesel" | "hybrid" | "electric";

export type VehicleStatus = "available" | "rented" | "maintenance" | "inactive";

export interface Vehicle {
  key_loss_fee: string | number | null | undefined;
  immobilization_fee_per_day: string | number | null | undefined;
  extra_km_price: string | number | null | undefined;
  included_km: string | number | null | undefined;
  id: number;
  brand: string;
  model: string;
  plate_number: string;
  fuel_type: string;
  current_mileage: number;
  status: string;

  deposit_amount?: number | null;
  franchise_amount?: number | null;
}

export interface VehicleCreatePayload {
  brand: string;
  model: string;
  plate_number: string;
  fuel_type: FuelType;
  current_mileage: number;
  status: VehicleStatus;
}

export interface VehicleUpdatePayload {
  brand?: string;
  model?: string;
  plate_number?: string;
  fuel_type?: FuelType;
  current_mileage?: number;
  status?: VehicleStatus;
  deposit_amount?: number;
franchise_amount?: number;
included_km?: number;
extra_km_price?: number;
immobilization_fee_per_day?: number;
key_loss_fee?: number;
}