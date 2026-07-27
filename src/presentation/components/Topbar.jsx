import { NotificationsNoneRounded, SearchRounded } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { employeeSession } from "../../domain/auth/employeeSession";
import styles from "./Topbar.module.css";

export function Topbar({ user = employeeSession.user }) {
  return (
    <header className={styles.topbar}>
      <label className={styles.search}>
        <SearchRounded />
        <input placeholder="Rezervasyon veya oda ara..." />
      </label>

      <div className={styles.actions}>
        <IconButton aria-label="Bildirimleri aç">
          <NotificationsNoneRounded />
        </IconButton>
        <span className={styles.divider} />
        <div className={styles.profile}>
          <span className={styles.avatar}>{user.initials}</span>
          <div>
            <b>{user.firstName} {user.lastName}</b>
            <small>{user.roleLabel}</small>
          </div>
          <strong>⌄</strong>
        </div>
      </div>
    </header>
  );
}
