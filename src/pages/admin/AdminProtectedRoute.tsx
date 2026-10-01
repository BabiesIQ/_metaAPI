import { useAdminAuthStore } from "@/store/adminAuth";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, authError, initialize } = useAdminAuthStore();
  const navigate = useNavigate();

  useEffect(() => { initialize(); }, [initialize]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !authError) {
      navigate({ to: "/admin/login" });
    }
  }, [isLoading, isAuthenticated, authError, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated && authError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md space-y-4 text-center" role="alert">
          <h1 className="text-lg font-semibold">Could not verify your admin session</h1>
          <p className="text-sm text-muted-foreground">{authError}</p>
          <button
            type="button"
            onClick={() => void initialize()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return null;
  return <>{children}</>;
}
