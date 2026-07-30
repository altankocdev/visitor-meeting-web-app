import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function PlatformRoute() {
  const { session } = useAuth();
  return session?.isPlatformAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
