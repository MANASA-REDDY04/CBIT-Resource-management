import axios from "axios";

const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  withCredentials: true, // Crucial for HTTP-only cookie transmission
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach Bearer token if present in localStorage as backup
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("cbit_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // If unauthorized and not already on the login page, clear local token and redirect
      if (!window.location.pathname.startsWith("/login")) {
        localStorage.removeItem("cbit_token");
        localStorage.removeItem("cbit_user");
        window.location.href = "/login?session_expired=1";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

