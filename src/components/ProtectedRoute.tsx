import { useAuth } from "@/hooks/useAuth";
import { isTestMode } from "@/lib/config";
import type { MeResponse } from "@/types/index";
import { Navigate } from "@tanstack/react-router";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const MOCK_USER: MeResponse = {
  user: {
    id: 1,
    uuid: "test-uuid",
    email: "demo@babyapi.pro",
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

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, setUser } = useAuth();

  // In test mode: skip auth entirely, inject mock user if needed
  if (isTestMode()) {
    if (!isAuthenticated) {
      setUser(MOCK_USER);
    }
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-background"
        data-ocid="protected.loading_state"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-body">
            Checking session…
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
