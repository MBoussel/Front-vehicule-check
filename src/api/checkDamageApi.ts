import { http } from "./http";
import type { DamagePoint } from "../types/checkDamage";

type ApiDamageSeverity = "minor" | "moderate" | "severe";
type ApiDamageType = "scratch" | "dent" | "crack" | "broken" | "other";

interface CreatePhotoDamagePayload {
  x_percent: number;
  y_percent: number;
  comment: string | null;
  severity: ApiDamageSeverity;
  damage_type: ApiDamageType;
}

function mapSeverityToApi(severity: DamagePoint["severity"]): ApiDamageSeverity {
  switch (severity) {
    case "light":
      return "minor";
    case "medium":
      return "moderate";
    case "heavy":
      return "severe";
    default:
      return "minor";
  }
}

function mapDamageTypeToApi(type: DamagePoint["type"]): ApiDamageType {
  switch (type) {
    case "scratch":
      return "scratch";
    case "dent":
      return "dent";
    case "crack":
      return "crack";
    case "broken":
      return "broken";
    case "other":
      return "other";
    default:
      return "other";
  }
}

export async function createPhotoDamage(photoId: number, damage: DamagePoint) {
  const payload: CreatePhotoDamagePayload = {
    x_percent: damage.xPercent,
    y_percent: damage.yPercent,
    comment: damage.comment.trim() || null,
    severity: mapSeverityToApi(damage.severity),
    damage_type: mapDamageTypeToApi(damage.type),
  };

  const response = await http.post(`/check-photos/${photoId}/damages`, payload);
  return response.data;
}