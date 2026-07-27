import { Navigate, Route, Routes } from "react-router-dom";
import { ChangePasswordPage } from "./pages/ChangePasswordPage";
import { CompleteProfilePage } from "./pages/CompleteProfilePage";
import { DashboardPage } from "./pages/DashboardPage";
import { DepartmentsPage } from "./pages/DepartmentsPage";
import { LoginPage } from "./pages/LoginPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ReservationsPage } from "./pages/ReservationsPage";
import { RoomsPage } from "./pages/RoomsPage";
import { RolesPage } from "./pages/RolesPage";
import { SuperAdminLoginPage } from "./pages/SuperAdminLoginPage";
import { SuperAdminDashboardPage } from "./pages/SuperAdminDashboardPage";
import { UsersPage } from "./pages/UsersPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />
      <Route path="/complete-profile" element={<CompleteProfilePage />} />
      <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />
      <Route path="/super-admin/dashboard" element={<SuperAdminDashboardPage />} />
      <Route path="/management/users" element={<UsersPage />} />
      <Route path="/management/departments" element={<DepartmentsPage />} />
      <Route path="/management/roles" element={<RolesPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/reservations" element={<ReservationsPage />} />
      <Route path="/rooms" element={<RoomsPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
