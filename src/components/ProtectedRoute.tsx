import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

/**
 * ProtectedRoute — wraps routes that require authentication.
 * Reads the JWT token from localStorage. If missing, redirects to /login.
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

