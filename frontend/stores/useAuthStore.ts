import { create } from "zustand";
import api from "@/lib/api";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setUser: (user: User) => set({ user, isAuthenticated: true }),
  clearError: () => set({ error: null }),

  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      // Check stored token in localStorage as well
      const savedToken = typeof window !== "undefined" ? localStorage.getItem("cbit_token") : null;
      const res = await api.get<User>("/auth/me");
      if (res.data) {
        set({
          user: res.data,
          token: savedToken,
          isAuthenticated: true,
          isLoading: false,
        });
        if (typeof window !== "undefined") {
          localStorage.setItem("cbit_user", JSON.stringify(res.data));
        }
        return;
      }
    } catch {
      // Session not active
      if (typeof window !== "undefined") {
        localStorage.removeItem("cbit_token");
        localStorage.removeItem("cbit_user");
      }
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<{ access_token: string; user: User }>("/auth/login", {
        email,
        password,
      });

      const { access_token, user } = res.data;

      if (typeof window !== "undefined") {
        localStorage.setItem("cbit_token", access_token);
        localStorage.setItem("cbit_user", JSON.stringify(user));
      }

      set({
        user,
        token: access_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      const message =
        err.response?.data?.detail || "Invalid email or password. Please try again.";
      set({
        isLoading: false,
        error: message,
        isAuthenticated: false,
        user: null,
        token: null,
      });
      return false;
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore network errors on logout
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("cbit_token");
        localStorage.removeItem("cbit_user");
      }
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  },
}));

