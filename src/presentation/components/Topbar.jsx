import { NotificationsNoneRounded, SearchRounded } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import styles from "./Topbar.module.css";

export function Topbar() {
  return <header className={styles.topbar}><label className={styles.search}><SearchRounded /><input placeholder="Toplantı, oda veya kişi ara..." /></label><div className={styles.actions}><IconButton><NotificationsNoneRounded /></IconButton><span className={styles.divider}/><div className={styles.profile}><span className={styles.avatar}>EY</span><div><b>Ece Yılmaz</b><small>Şirket yöneticisi</small></div><strong>⌄</strong></div></div></header>;
}
