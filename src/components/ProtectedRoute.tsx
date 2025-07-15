
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log("🛡️ ProtectedRoute - Loading:", loading, "User:", user?.email || "No user");

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to home
  if (!user) {
    console.log("🔀 No user, redirecting to home from:", location.pathname);
    return <Navigate to="/" replace />;
  }

  // User is authenticated, render the protected content
  console.log("✅ User authenticated, rendering protected content");
  return <>{children}</>;
};
