import { Navigate, Route, Routes } from "react-router-dom";
import { ChangePasswordPage } from "./pages/ChangePasswordPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DepartmentsPage } from "./pages/DepartmentsPage";
import { LoginPage } from "./pages/LoginPage";
import { JobTitlesPage } from "./pages/JobTitlesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ReservationsPage } from "./pages/ReservationsPage";
import { AdminReservationsPage } from "./pages/AdminReservationsPage";
import { AuditLogsPage } from "./pages/AuditLogsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { CompanySettingsPage } from "./pages/CompanySettingsPage";
import { CompanyOwnerDashboardPage } from "./pages/CompanyOwnerDashboardPage";
import { ManagementNotificationsPage } from "./pages/ManagementNotificationsPage";
import { RoomsPage } from "./pages/RoomsPage";
import { RolesPage } from "./pages/RolesPage";
import { RoomManagementPage } from "./pages/RoomManagementPage";
import { SuperAdminLoginPage } from "./pages/SuperAdminLoginPage";
import { SuperAdminDashboardPage } from "./pages/SuperAdminDashboardPage";
import { UsersPage } from "./pages/UsersPage";
import { ProtectedRoute } from "./routing/ProtectedRoute";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/change-password" element={<ChangePasswordPage />} />

        <Route path="/super-admin/dashboard" element={<SuperAdminDashboardPage />} />

        <Route path="/management/dashboard" element={<CompanyOwnerDashboardPage />} />
        <Route path="/management/users" element={<UsersPage />} />
        <Route path="/management/departments" element={<DepartmentsPage />} />
        <Route path="/management/roles" element={<RolesPage />} />
        <Route path="/management/job-titles" element={<JobTitlesPage />} />
        <Route path="/management/rooms" element={<RoomManagementPage />} />
        <Route path="/management/reservations" element={<AdminReservationsPage />} />
        <Route path="/management/reports" element={<ReportsPage />} />
        <Route path="/management/audit-logs" element={<AuditLogsPage />} />
        <Route path="/management/notifications" element={<ManagementNotificationsPage />} />
        <Route path="/management/company-settings" element={<CompanySettingsPage />} />

        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/notifications" element={<ManagementNotificationsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}