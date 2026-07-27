import { NotificationsNoneRounded, SearchRounded, ShieldOutlined } from "@mui/icons-material";
import styles from "./AdminTopbar.module.css";

export function AdminTopbar() {
  return (
    <header className={styles.topbar}>
      <label className={styles.search}><SearchRounded /><input placeholder="Çalışan, oda veya rezervasyon ara..." /></label>
      <div className={styles.actions}>
        <button className={styles.notification} type="button" aria-label="Bildirimleri aç"><NotificationsNoneRounded /><i /></button>
        <span className={styles.divider} />
        <div className={styles.profile}><span className={styles.avatar}><ShieldOutlined /></span><div><b>Yaşar Bilgi Müdürü</b><small>Süper admin · Tüm yetkiler</small></div></div>
      </div>
    </header>
  );
}
