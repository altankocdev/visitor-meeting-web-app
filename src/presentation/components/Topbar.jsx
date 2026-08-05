import { NotificationsNoneRounded, SearchRounded } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import styles from "./Topbar.module.css";

export function Topbar({ user: providedUser }) {
  const navigate = useNavigate();
  const { session } = useAuth();
  const user = providedUser ?? session?.user;
  if (!user) return null;
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ")
    || `@${user.username}`;

  return (
    <header className={styles.topbar}>
      <label className={styles.search}>
        <SearchRounded />
        <input placeholder="Rezervasyon veya oda ara..." />
      </label>

      <div className={styles.actions}>
       <IconButton aria-label="Bildirimleri aç" onClick={() => navigate("/notifications")}>
  <NotificationsNoneRounded />
</IconButton>
        <span className={styles.divider} />
        <button
          className={styles.profile}
          type="button"
          aria-label="Profil sayfasını aç"
          onClick={() => navigate("/profile")}
        >
          <span className={styles.avatar}>{user.initials}</span>
          <div>
            <b>{displayName}</b>
            <small>@{user.username}{user.email ? ` · ${user.email}` : ""}</small>
          </div>
          <strong>⌄</strong>
        </button>
      </div>
    </header>
  );
}
