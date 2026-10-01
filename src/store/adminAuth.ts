import { getAdminMe } from "@/lib/admin-api";
import type { Admin } from "@/types/admin";
import { create } from "zustand";

interface AdminAuthState {
  admin: Admin | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authError: string | null;
  setAdmin: (a: Admin | null) => void;
  initialize: () => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  admin: null,
  isLoading: true,
  isAuthenticated: false,
  authError: null,

  setAdmin: (a) =>
    set({ admin: a, isAuthenticated: a !== null, isLoading: false, authError: null }),

  initialize: async () => {
    set({ isLoading: true, authError: null });
    try {
      const res = await getAdminMe();
      if (res.success && res.data) {
        set({ admin: res.data, isAuthenticated: true, isLoading: false, authError: null });
      } else if (res.error === "Unauthorized") {
        set({ admin: null, isAuthenticated: false, isLoading: false, authError: null });
      } else {
        set({
          isLoading: false,
          authError: res.error ?? "Could not verify your admin session. Please try again.",
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        authError: error instanceof Error ? error.message : "Could not reach the server. Please try again.",
      });
    }
  },
}));
