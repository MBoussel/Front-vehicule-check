import { http } from "./http";
import type { RentalContract, RentalContractCreatePayload } from "../types/contract";

export async function getContracts(): Promise<RentalContract[]> {
  const response = await http.get<RentalContract[]>("/contracts/");
  return response.data;
}

export async function getContractById(contractId: number): Promise<RentalContract> {
  const response = await http.get<RentalContract>(`/contracts/${contractId}`);
  return response.data;
}

export async function createContract(
  payload: RentalContractCreatePayload,
): Promise<RentalContract> {
  const response = await http.post<RentalContract>("/contracts/", payload);
  return response.data;
}

export async function updateContract(
  contractId: number,
  payload: Partial<RentalContractCreatePayload>,
): Promise<RentalContract> {
  const response = await http.put<RentalContract>(`/contracts/${contractId}`, payload);
  return response.data;
}