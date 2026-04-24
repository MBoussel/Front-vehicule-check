export type DamageSeverity = "light" | "medium" | "heavy";

export type DamageType =
  | "scratch"
  | "dent"
  | "crack"
  | "broken"
  | "other";

export interface DamagePoint {
  id: string;
  xPercent: number;
  yPercent: number;
  label: string;
  type: DamageType;
  severity: DamageSeverity;
  comment: string;
  photoUrl?: string;
  createdAt: string;
}

export interface CreateDamagePayload {
  xPercent: number;
  yPercent: number;
  label: string;
  type: DamageType;
  severity: DamageSeverity;
  comment: string;
}