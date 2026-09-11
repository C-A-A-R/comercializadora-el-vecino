import axios from "axios";

/**
 * Cliente HTTP centralizado para conectar con el backend del proyecto.
 * Usa la URL configurada en VITE_API_URL y añade el token de acceso si existe.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
