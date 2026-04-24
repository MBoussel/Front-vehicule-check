export type UserRole = "admin" | "agent";

export interface LoginResponse {
  access_token: string;
  token_type: "bearer";
}

export interface CurrentUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
}