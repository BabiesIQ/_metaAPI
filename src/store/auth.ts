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

export interface BannedUserInfo {
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar?: string | null;
}

interface AuthState {
  user: MeResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  bannedUser: BannedUserInfo | null;
  setUser: (u: MeResponse | null) => void;
  setBannedUser: (u: BannedUserInfo | null) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  bannedUser: null,

  setUser: (u) =>
    set({ user: u, isAuthenticated: u !== null, isLoading: false }),

  setBannedUser: (u) => set({ bannedUser: u }),

  initialize: async () => {
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
        // If account is banned, redirect to banned page instead of dashboard
        if (res.data.user?.status === "banned") {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            bannedUser: {
              first_name: res.data.user.first_name,
              last_name: res.data.user.last_name,
              email: res.data.user.email,
              avatar: res.data.user.avatar,
            },
          });
          if (!window.location.pathname.startsWith("/banned")) {
            window.location.href = "/banned";
          }
          return;
        }
        set({ user: res.data, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
