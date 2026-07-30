import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function TenantRoute() {
  const { session } = useAuth();
  return session && !session.isPlatformAdmin
    ? <Outlet />
    : <Navigate to="/super-admin/dashboard" replace />;
}
