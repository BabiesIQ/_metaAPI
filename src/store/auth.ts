import { getMe } from "@/lib/api";
import { isTestMode } from "@/lib/config";
import type { MeResponse } from "@/types/index";
import { create } from "zustand";

const TEST_MOCK_USER: MeResponse = {
  user: {
    id: 1,
    uuid: "test-uuid",
    email: "demo@babiesiq.com",
    role: "pro",
    status: "active",
    avatar: null,
    first_name: "Demo",
    last_name: "User",
    country: "IN",
  },
  plan: {
    code: "pro",
    name: "Pro",
    price: 49,
    daily_limit: 2500,
  },
  usage: {
    today: 247,
    remaining: 2253,
    lifetime: 15420,
  },
};

interface AuthState {
  user: MeResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (u: MeResponse | null) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (u) =>
    set({ user: u, isAuthenticated: u !== null, isLoading: false }),

  initialize: async () => {
    // In test mode, inject mock user without hitting the API
    if (isTestMode()) {
      set({
        user: TEST_MOCK_USER,
        isAuthenticated: true,
        isLoading: false,
      });
      return;
    }

    set({ isLoading: true });
    try {
      const res = await getMe();
      if (res.success && res.data) {
        set({ user: res.data, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
