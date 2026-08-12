import {
  AdminPanelSettingsRounded,
  LogoutRounded,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import {
  canAccessManagement,
  hasPermission,
} from "../../domain/auth/permissions";
import { useAuth } from "../auth/AuthContext";
import { employeeNavigation } from "../config/employeeNavigation";
import { useUnreadNotificationCount } from "../hooks/useUnreadNotificationCount";
import { Brand } from "./Brand";
import styles from "./Sidebar.module.css";

export function Sidebar({ session: providedSession }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { session: authenticatedSession, logout } = useAuth();
  const session = providedSession ?? authenticatedSession;
  const unreadNotificationCount = useUnreadNotificationCount(
    session?.user?.companyId,
  );
  if (!session) return null;
  const visibleItems = employeeNavigation.filter((item) =>
    hasPermission(session.permissions, item.permission),
  );
  const displayName =
    [session.user.firstName, session.user.lastName].filter(Boolean).join(" ") ||
    session.user.username ||
    session.user.email;
  const identityDetails = [
    session.user.roleLabel,
    session.user.companyName,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <aside className={styles.sidebar}>
      <Brand />

      <nav className={styles.nav} aria-label="Çalışan menüsü">
        <small>ÇALIŞMA ALANI</small>

        {visibleItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          const badge = path === "/notifications" ? unreadNotificationCount : 0;

          return (
            <button
              className={`${styles.button} ${active ? styles.active : ""}`}
              key={label}
              type="button"
              onClick={() => path && navigate(path)}
              title={label}
            >
              <Icon />
              <span className={styles.buttonLabel}>{label}</span>
              {badge > 0 ? (
                <b className={styles.notificationBadge} aria-label={`${badge} okunmamış bildirim`}>
                  {badge > 99 ? "99+" : badge}
                </b>
              ) : null}
              {active && <i className={styles.indicator} />}
            </button>
          );
        })}
      </nav>

      <div className={styles.bottom}>
        {canAccessManagement(session) ? (
          <button
            className={styles.button}
            type="button"
            onClick={() => navigate("/management/dashboard")}
          >
            <AdminPanelSettingsRounded />
            Şirket yönetimi
          </button>
        ) : null}
        <button
          className={styles.button}
          type="button"
          onClick={async () => {
            await logout();
            navigate("/login", { replace: true });
          }}
        >
          <LogoutRounded />
          Çıkış yap
        </button>

        <button
          className={styles.workspace}
          type="button"
          onClick={() => navigate("/profile")}
          aria-label="Profil sayfasını aç"
        >
          <span className={styles.avatar}>{session.user.initials}</span>
          <div>
            <b title={displayName}>{displayName}</b>
            <small title={identityDetails}>{identityDetails}</small>
          </div>
        </button>
      </div>
    </aside>
  );
}
