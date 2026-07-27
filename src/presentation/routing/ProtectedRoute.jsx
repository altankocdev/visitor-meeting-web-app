import { useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { tokenStorage } from "../../infrastructure/auth/tokenStorage";

export function ProtectedRoute() {
  const navigate = useNavigate();
  const authenticated = Boolean(tokenStorage.getAccessToken());

  useEffect(() => {
    const handleSessionExpired = () => navigate("/login", {
      replace: true,
      state: { reason: "session-expired" },
    });
    window.addEventListener("meetly:session-expired", handleSessionExpired);
    return () => window.removeEventListener("meetly:session-expired", handleSessionExpired);
  }, [navigate]);

  return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

