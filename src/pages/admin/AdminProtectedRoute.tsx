import { useAdminAuthStore } from "@/store/adminAuth";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, initialize } = useAdminAuthStore();
  const navigate = useNavigate();

  useEffect(() => { initialize(); }, [initialize]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/admin/login" });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return null;
  return <>{children}</>;
}
