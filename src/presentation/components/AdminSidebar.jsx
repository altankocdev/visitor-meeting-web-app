import { HelpOutlineRounded, LogoutRounded } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { superAdminNavigation } from "../config/superAdminNavigation";
import { Brand } from "./Brand";
import styles from "./AdminSidebar.module.css";

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className={styles.sidebar}>
      <Brand />
      <div className={styles.platform}><span>SÜPER ADMIN</span><small>Yaşar Bilgi yönetimi</small></div>
      <nav className={styles.nav} aria-label="Süper admin menüsü">
        <small>ŞİRKET YÖNETİMİ</small>
        {superAdminNavigation.map(({ badge, icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <button className={`${styles.button} ${active ? styles.active : ""}`} key={label} type="button" onClick={() => path && navigate(path)} title={path ? label : `${label} sayfası sonraki adımda eklenecek`}>
              <Icon /><span>{label}</span>{badge ? <b className={styles.badge}>{badge}</b> : null}{active ? <i className={styles.indicator} /> : null}
            </button>
          );
        })}
      </nav>
      <div className={styles.bottom}>
        <button className={styles.button} type="button"><HelpOutlineRounded /><span>Yardım merkezi</span></button>
        <button className={styles.button} type="button" onClick={() => navigate("/super-admin/login")}><LogoutRounded /><span>Çıkış yap</span></button>
        <div className={styles.identity}><span className={styles.avatar}>YB</span><div><b>Yaşar Bilgi</b><small>Süper admin</small></div></div>
      </div>
    </aside>
  );
}
