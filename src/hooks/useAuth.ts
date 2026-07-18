import { logout as apiLogout } from "@/lib/api";
import type { BannedUserInfo } from "@/store/auth";
import { useAuthStore } from "@/store/auth";

export function useAuth() {
  const { user, isLoading, isAuthenticated, setUser, initialize, setBannedUser } =
    useAuthStore();

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      // best effort
    }
    setUser(null);
    window.location.href = "/login";
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    setUser,
    setBannedUser,
    initialize,
    logout,
  };
}
