export type CheckType = "departure" | "return";

export type FuelLevel =
  | "one_eighth"
  | "two_eighths"
  | "three_eighths"
  | "half"
  | "five_eighths"
  | "six_eighths"
  | "seven_eighths"
  | "full";

export type CleanlinessLevel =
  | "very_clean"
  | "clean"
  | "medium"
  | "dirty";

export type CheckStatus = "draft" | "completed";

export type PhotoType =
  | "front"
  | "rear"
  | "front_left_angle"
  | "front_right_angle"
  | "rear_left_angle"
  | "rear_right_angle"
  | "wheel_front_left"
  | "wheel_front_right"
  | "wheel_rear_left"
  | "wheel_rear_right"
  | "windshield"
  | "front_seat"
  | "rear_seat"
  | "trunk"
  | "dashboard"
  | "other";

export type ApiDamageSeverity = "minor" | "moderate" | "severe";

export type DamageType = "scratch" | "dent" | "crack" | "broken" | "other";

export interface CheckPhotoDamage {
  id: number;
  check_photo_id: number;
  x_percent: number;
  y_percent: number;
  comment: string | null;
  severity: ApiDamageSeverity;
  damage_type: DamageType | null;
  created_at?: string;
}

export interface CheckPhoto {
  id: number;
  check_id: number;
  photo_type: PhotoType;
  file_url: string;
  file_name: string;
  display_order: number;
  has_damage: boolean;
  damage_comment: string | null;
  created_at?: string;
  damages?: CheckPhotoDamage[];
}

export interface Check {
  id: number;
  vehicle_id: number;
  contract_id: number | null;
  user_id?: number;
  type_check: CheckType;
  mileage: number;
  fuel_level: FuelLevel;
  cleanliness: CleanlinessLevel;
  notes?: string | null;
  status: CheckStatus;
  check_date?: string;
  created_at?: string;
  updated_at?: string;
  signature_url?: string | null;
  agent_signature_url?: string | null;
  photos?: CheckPhoto[];
}


export type CreateCheckPayload = {
  vehicle_id: number;
  contract_id?: number | null;
  type_check: CheckType;
  mileage: number;
  fuel_level: FuelLevel;
  cleanliness: CleanlinessLevel;
  notes?: string;
  booking_reference?: string;
  client_name?: string;
  status?: CheckStatus;
};