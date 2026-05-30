import { logout as apiLogout } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export function useAuth() {
  const { user, isLoading, isAuthenticated, setUser, initialize } =
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
    initialize,
    logout,
  };
}
