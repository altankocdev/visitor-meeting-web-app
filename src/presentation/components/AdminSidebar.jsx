import {
  DashboardRounded,
  HelpOutlineRounded,
  LogoutRounded,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { superAdminNavigation } from "../config/superAdminNavigation";
import { Brand } from "./Brand";
import styles from "./AdminSidebar.module.css";
import { useAuth } from "../auth/AuthContext";

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, session } = useAuth();
  if (!session) return null;

  return (
    <aside className={styles.sidebar}>
      <Brand />
      <div className={styles.platform}>
        <span>
          {session?.user.roleLabel?.toLocaleUpperCase("tr-TR") || "SÜPER ADMIN"}
        </span>
        <small>{session?.user.companyName || "Yaşar Bilgi"} yönetimi</small>
      </div>
      {!session.isPlatformAdmin ? (
        <button
          className={styles.workspaceButton}
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          <DashboardRounded />
          <span>Çalışma alanına geç</span>
        </button>
      ) : null}
      <nav className={styles.nav} aria-label="Süper admin menüsü">
        <small>ŞİRKET YÖNETİMİ</small>
        {superAdminNavigation.map(
          ({ badge, icon: Icon, label, path }, index) => {
            const resolvedPath =
              index === 0 && !session.isPlatformAdmin
                ? "/management/dashboard"
                : path;
            const active = location.pathname === resolvedPath;
            return (
              <button
                className={`${styles.button} ${active ? styles.active : ""}`}
                key={label}
                type="button"
                onClick={() => resolvedPath && navigate(resolvedPath)}
                title={label}
              >
                <Icon />
                <span>{label}</span>
                {badge ? <b className={styles.badge}>{badge}</b> : null}
                {active ? <i className={styles.indicator} /> : null}
              </button>
            );
          },
        )}
      </nav>
      <div className={styles.bottom}>
        <button className={styles.button} type="button">
          <HelpOutlineRounded />
          <span>Yardım merkezi</span>
        </button>
        <button
          className={styles.button}
          type="button"
          onClick={async () => {
            await logout();
            navigate(
              session.isPlatformAdmin ? "/super-admin/login" : "/login",
              { replace: true },
            );
          }}
        >
          <LogoutRounded />
          <span>Çıkış yap</span>
        </button>
        <div className={styles.identity}>
          <span className={styles.avatar}>
            {session?.user.initials || "YB"}
          </span>
          <div>
            <b>{session?.user.companyName || "Yaşar Bilgi"}</b>
            <small>{session?.user.roleLabel || "Süper admin"}</small>
          </div>
        </div>
      </div>
    </aside>
  );
}
