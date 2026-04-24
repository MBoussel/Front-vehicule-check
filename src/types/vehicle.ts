export type FuelType = "essence" | "diesel" | "hybrid" | "electric";

export type VehicleStatus = "available" | "rented" | "maintenance" | "inactive";

export interface Vehicle {
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
}