import {
  AdminPanelSettingsRounded,
  HelpOutlineRounded,
  LogoutRounded,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import {
  canAccessManagement,
  hasPermission,
} from "../../domain/auth/permissions";
import { useAuth } from "../auth/AuthContext";
import { employeeNavigation } from "../config/employeeNavigation";
import { Brand } from "./Brand";
import styles from "./Sidebar.module.css";

export function Sidebar({ session: providedSession }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { session: authenticatedSession, logout } = useAuth();
  const session = providedSession ?? authenticatedSession;
  if (!session) return null;
  const visibleItems = employeeNavigation.filter((item) =>
    hasPermission(session.permissions, item.permission),
  );

  return (
    <aside className={styles.sidebar}>
      <Brand />

      <nav className={styles.nav} aria-label="Çalışan menüsü">
        <small>ÇALIŞMA ALANI</small>

        {visibleItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;

          return (
            <button
              className={`${styles.button} ${active ? styles.active : ""}`}
              key={label}
              type="button"
              onClick={() => path && navigate(path)}
              title={path ? label : `${label} sayfası yakında`}
            >
              <Icon />
              {label}
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
        <button className={styles.button} type="button">
          <HelpOutlineRounded />
          Yardım merkezi
        </button>

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

        <div className={styles.workspace}>
          <span className={styles.avatar}>{session.user.initials}</span>
          <div>
            <b>{session.user.companyName}</b>
            <small>{session.user.roleLabel}</small>
          </div>
          <strong>⌄</strong>
        </div>
      </div>
    </aside>
  );
}
