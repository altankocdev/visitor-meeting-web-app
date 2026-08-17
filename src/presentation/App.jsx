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
import { EmployeeNotificationsPage } from "./pages/EmployeeNotificationsPage";
import { ManagementNotificationsPage } from "./pages/ManagementNotificationsPage";
import { RoomsPage } from "./pages/RoomsPage";
import { RolesPage } from "./pages/RolesPage";
import { RoomManagementPage } from "./pages/RoomManagementPage";
import { SuperAdminLoginPage } from "./pages/SuperAdminLoginPage";
import { SuperAdminDashboardPage } from "./pages/SuperAdminDashboardPage";
import { UsersPage } from "./pages/UsersPage";
import { ProtectedRoute } from "./routing/ProtectedRoute";
import { PermissionRoute } from "./routing/PermissionRoute";
import { permissions } from "../domain/auth/permissions";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { useAuth } from "./auth/AuthContext";

export function App() {
  const { loggingOut } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/change-password" element={<ChangePasswordPage />} />

          <Route
            path="/super-admin/dashboard"
            element={<SuperAdminDashboardPage />}
          />

          <Route
            path="/management/dashboard"
            element={<CompanyOwnerDashboardPage />}
          />
          <Route path="/management/users" element={<PermissionRoute requiredAny={[permissions.USER_VIEW_ALL]}><UsersPage /></PermissionRoute>} />
          <Route path="/management/departments" element={<PermissionRoute requiredAny={[permissions.DEPARTMENT_VIEW]}><DepartmentsPage /></PermissionRoute>} />
          <Route path="/management/roles" element={<PermissionRoute requiredAny={[permissions.ROLE_VIEW]}><RolesPage /></PermissionRoute>} />
          <Route path="/management/job-titles" element={<PermissionRoute requiredAny={[permissions.JOB_TITLE_VIEW]}><JobTitlesPage /></PermissionRoute>} />
          <Route path="/management/rooms" element={<PermissionRoute requiredAny={[permissions.ROOM_VIEW]}><RoomManagementPage /></PermissionRoute>} />
          <Route
            path="/management/reservations"
            element={<PermissionRoute requiredAny={[permissions.RESERVATION_VIEW_ALL]}><AdminReservationsPage /></PermissionRoute>}
          />
          <Route path="/management/reports" element={<PermissionRoute requiredAny={[permissions.REPORT_VIEW_ROOM_USAGE, permissions.REPORT_VIEW_RESERVATION_STATS, permissions.REPORT_VIEW_CANCELLATION_STATS]}><ReportsPage /></PermissionRoute>} />
          <Route path="/management/audit-logs" element={<PermissionRoute requiredAny={[permissions.AUDIT_LOG_VIEW]} platformAllowed><AuditLogsPage /></PermissionRoute>} />
          <Route
            path="/management/notifications"
            element={<PermissionRoute requiredAny={[permissions.NOTIFICATION_VIEW]}><ManagementNotificationsPage /></PermissionRoute>}
          />
          <Route
            path="/management/company-settings"
            element={<PermissionRoute requiredAny={[permissions.COMPANY_VIEW]}><CompanySettingsPage /></PermissionRoute>}
          />

          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route
            path="/notifications"
            element={<EmployeeNotificationsPage />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      {loggingOut && <LoadingOverlay label="Çıkış yapılıyor..." />}
    </>
  );
}
