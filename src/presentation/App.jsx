import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { SuperAdminLoginPage } from "./pages/SuperAdminLoginPage";

export function App() {
  return <Routes><Route path="/login" element={<LoginPage />} /><Route path="/super-admin/login" element={<SuperAdminLoginPage />} /><Route path="/dashboard" element={<DashboardPage />} /><Route path="*" element={<Navigate to="/login" replace />} /></Routes>;
}
