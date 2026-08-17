import { Navigate } from "react-router-dom";
import { hasPermission } from "../../domain/auth/permissions";
import { useAuth } from "../auth/AuthContext";

export function PermissionRoute({ children, requiredAny = [], platformAllowed = false }) {
  const { session } = useAuth();

  if (platformAllowed && session?.isPlatformAdmin) return children;

  const allowed = Boolean(session && !session.isPlatformAdmin) && (
    session.user.owner
    || requiredAny.length === 0
    || requiredAny.some((permission) => hasPermission(session.permissions, permission))
  );

  return allowed
    ? children
    : <Navigate to={session?.isPlatformAdmin ? "/super-admin/dashboard" : "/management/dashboard"} replace />;
}
