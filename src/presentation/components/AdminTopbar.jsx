import { NotificationsNoneRounded, SearchRounded, ShieldOutlined } from "@mui/icons-material";
import styles from "./AdminTopbar.module.css";
import { useAuth } from "../auth/AuthContext";

export function AdminTopbar() {
  const { session } = useAuth();
  if (!session) return null;
  const user = session.user;
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
  return (
    <header className={styles.topbar}>
      <label className={styles.search}><SearchRounded /><input placeholder="Çalışan, oda veya rezervasyon ara..." /></label>
      <div className={styles.actions}>
        <button className={styles.notification} type="button" aria-label="Bildirimleri aç"><NotificationsNoneRounded /><i /></button>
        <span className={styles.divider} />
        <div className={styles.profile}><span className={styles.avatar}><ShieldOutlined /></span><div><b>{displayName}</b><small>{user.roleLabel}{user.companyName ? ` · ${user.companyName}` : ""}</small></div></div>
      </div>
    </header>
  );
}
