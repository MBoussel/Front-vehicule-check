import { http } from "./http";
import type { Vehicle, VehicleCreatePayload, VehicleUpdatePayload } from "../types/vehicle";

export async function getVehicles(): Promise<Vehicle[]> {
  const response = await http.get<Vehicle[]>("/vehicles/");
  return response.data;
}

export async function getVehicleById(vehicleId: number): Promise<Vehicle> {
  const response = await http.get<Vehicle>(`/vehicles/${vehicleId}`);
  return response.data;
}

export async function createVehicle(payload: VehicleCreatePayload): Promise<Vehicle> {
  const response = await http.post<Vehicle>("/vehicles/", payload);
  return response.data;
}

export async function updateVehicle(
  vehicleId: number,
  payload: VehicleUpdatePayload,
): Promise<Vehicle> {
  const response = await http.put<Vehicle>(`/vehicles/${vehicleId}`, payload);
  return response.data;
}

export async function deleteVehicle(vehicleId: number): Promise<{ message: string }> {
  const response = await http.delete<{ message: string }>(`/vehicles/${vehicleId}`);
  return response.data;
}