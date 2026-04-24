import type { Vehicle } from "./vehicle";

export type ContractStatus = "draft" | "signed" | "cancelled";
export type SignatureMode = "onsite" | "external";

export interface ContractCheckSummary {
  id: number;
  type_check: "departure" | "return";
  check_date: string;
  status: "draft" | "completed";
}

export interface RentalContract {
  id: number;
  contract_number: string;
  vehicle_id: number;

  customer_first_name: string;
  customer_last_name: string;
  customer_email?: string | null;
  customer_phone?: string | null;
  customer_address?: string | null;

  license_number: string;
  license_issue_date?: string | null;
  license_country?: string | null;
  license_front_photo_url?: string | null;
  license_back_photo_url?: string | null;

  secondary_driver_first_name?: string | null;
  secondary_driver_last_name?: string | null;
  secondary_driver_email?: string | null;
  secondary_driver_phone?: string | null;
  secondary_license_number?: string | null;
  secondary_license_issue_date?: string | null;
  secondary_license_country?: string | null;
  secondary_license_front_photo_url?: string | null;
  secondary_license_back_photo_url?: string | null;

  start_date: string;
  end_date: string;

  deposit_amount?: number | null;
  franchise_amount?: number | null;
  rental_price?: number | null;

  pickup_location?: string | null;
  return_location?: string | null;
  delivery_fee?: number | null;

  status: ContractStatus;
  signature_mode: SignatureMode;
  signed_pdf_url?: string | null;
  terms_and_conditions?: string | null;

  created_at: string;
  updated_at: string;

  vehicle?: Vehicle;
  checks?: ContractCheckSummary[];
}

export interface RentalContractCreatePayload {
  contract_number: string;
  vehicle_id: number;

  customer_first_name: string;
  customer_last_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;

  license_number: string;
  license_issue_date?: string;
  license_country?: string;
  license_front_photo_url?: string;
  license_back_photo_url?: string;

  secondary_driver_first_name?: string;
  secondary_driver_last_name?: string;
  secondary_driver_email?: string;
  secondary_driver_phone?: string;
  secondary_license_number?: string;
  secondary_license_issue_date?: string;
  secondary_license_country?: string;
  secondary_license_front_photo_url?: string;
  secondary_license_back_photo_url?: string;

  start_date: string;
  end_date: string;

  deposit_amount?: number;
  franchise_amount?: number;
  rental_price?: number;

  pickup_location?: string;
  return_location?: string;
  delivery_fee?: number;

  status: ContractStatus;
  signature_mode: SignatureMode;
  terms_and_conditions?: string;
}