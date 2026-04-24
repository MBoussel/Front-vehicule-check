import { http } from "./http";

export interface UploadResponse {
  file_url: string;
  file_path?: string;
  message?: string;
}

export async function uploadLicensePhoto(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await http.post<UploadResponse>("/uploads/license-photo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}