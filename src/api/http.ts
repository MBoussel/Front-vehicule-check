import axios from "axios";

import { getToken } from "../utils/storage";

const baseURL = import.meta.env.VITE_API_URL;

export const http = axios.create({
  baseURL,
});

http.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});