import { http } from "./http";
import type { Check, CreateCheckPayload, PhotoType } from "../types/check";
import {
  extractFileNameFromContentDisposition,
  triggerBrowserDownload,
} from "../utils/download";

export async function createCheck(payload: CreateCheckPayload): Promise<Check> {
  const response = await http.post<Check>("/checks/", payload);
  return response.data;
}

export async function getChecks(): Promise<Check[]> {
  const response = await http.get<Check[]>("/checks/");
  return response.data;
}

export async function getCheckById(checkId: number): Promise<Check> {
  const response = await http.get<Check>(`/checks/${checkId}`);
  return response.data;
}

export async function completeCheck(checkId: number): Promise<Check> {
  const response = await http.put<Check>(`/checks/${checkId}/complete`);
  return response.data;
}

export async function downloadCheckPdf(checkId: number): Promise<void> {
  const response = await http.get<Blob>(`/checks/${checkId}/pdf`, {
    responseType: "blob",
  });

  const fileName =
    extractFileNameFromContentDisposition(response.headers["content-disposition"]) ??
    `check-${checkId}.pdf`;

  triggerBrowserDownload(response.data, fileName);
}

export async function uploadCheckPhoto(
  checkId: number,
  file: File,
  photoType: PhotoType,
  displayOrder: number,
  hasDamage = false,
  damageComment?: string,
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("photo_type", photoType);
  formData.append("display_order", String(displayOrder));
  formData.append("has_damage", String(hasDamage));

  if (damageComment?.trim()) {
    formData.append("damage_comment", damageComment.trim());
  }

  const response = await http.post(`/checks/${checkId}/photos`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}