import { getAdminMe } from "@/lib/admin-api";
import type { Admin } from "@/types/admin";
import { create } from "zustand";

interface AdminAuthState {
  admin: Admin | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setAdmin: (a: Admin | null) => void;
  initialize: () => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  admin: null,
  isLoading: true,
  isAuthenticated: false,

  setAdmin: (a) =>
    set({ admin: a, isAuthenticated: a !== null, isLoading: false }),

  initialize: async () => {
    set({ isLoading: true });
    try {
      const res = await getAdminMe();
      if (res.success && res.data) {
        set({ admin: res.data, isAuthenticated: true, isLoading: false });
      } else {
        set({ admin: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ admin: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
