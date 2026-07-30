import { useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { tokenStorage } from "../../infrastructure/auth/tokenStorage";
import { useAuth } from "../auth/AuthContext";

export function ProtectedRoute() {
  const navigate = useNavigate();
  const { loading, session } = useAuth();
  const authenticated = Boolean(tokenStorage.getAccessToken());

  useEffect(() => {
    const handleSessionExpired = () => navigate("/login", {
      replace: true,
      state: { reason: "session-expired" },
    });
    window.addEventListener("meetly:session-expired", handleSessionExpired);
    return () => window.removeEventListener("meetly:session-expired", handleSessionExpired);
  }, [navigate]);

  if (authenticated && loading) return null;
  return authenticated && session ? <Outlet /> : <Navigate to="/login" replace />;
}
