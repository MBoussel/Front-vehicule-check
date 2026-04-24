import axios from "axios";

import type { CurrentUser, LoginResponse } from "../types/auth";

const API_URL = import.meta.env.VITE_API_URL;

export async function login(email: string, password: string): Promise<LoginResponse> {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return response.data;
}

export async function getCurrentUser(token: string): Promise<CurrentUser> {
  const response = await axios.get<CurrentUser>(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}