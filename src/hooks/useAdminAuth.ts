import { adminLogout as apiLogout } from "@/lib/admin-api";
import { useAdminAuthStore } from "@/store/adminAuth";

export function useAdminAuth() {
  const { admin, isLoading, isAuthenticated, setAdmin, initialize } =
    useAdminAuthStore();

  const logout = async () => {
    try { await apiLogout(); } catch { /* best effort */ }
    setAdmin(null);
    window.location.href = "/admin/login";
  };

  return { admin, isLoading, isAuthenticated, setAdmin, initialize, logout };
}
