import { http } from "./http";
import type {
  SignatureUploadPayload,
  SignatureUploadResponse,
} from "../types/signature";

export async function uploadClientSignature(
  checkId: number,
  payload: SignatureUploadPayload,
): Promise<SignatureUploadResponse> {
  const response = await http.post<SignatureUploadResponse>(
    `/checks/${checkId}/signature`,
    payload,
  );

  return response.data;
}

export async function uploadAgentSignature(
  checkId: number,
  payload: SignatureUploadPayload,
): Promise<SignatureUploadResponse> {
  const response = await http.post<SignatureUploadResponse>(
    `/checks/${checkId}/agent-signature`,
    payload,
  );

  return response.data;
}