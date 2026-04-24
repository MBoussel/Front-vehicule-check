export type CheckSignatureRole = "client" | "agent";

export interface SignatureUploadPayload {
  signature_base64: string;
}

export interface SignatureUploadResponse {
  check_id: number;
  signature_url: string;
}