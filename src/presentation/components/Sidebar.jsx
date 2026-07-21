import { CalendarMonthRounded, DashboardRounded, MeetingRoomRounded, PeopleAltRounded, SettingsRounded, HelpOutlineRounded, LogoutRounded } from "@mui/icons-material";
import { Brand } from "./Brand";
import { useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";

const nav = [
  [DashboardRounded, "Genel bakış", true], [CalendarMonthRounded, "Takvim"], [MeetingRoomRounded, "Toplantı odaları"], [PeopleAltRounded, "Ekip"], [SettingsRounded, "Ayarlar"],
];

export function Sidebar() {
  const navigate = useNavigate();
  return <aside className={styles.sidebar}><Brand /><nav className={styles.nav}><small>ÇALIŞMA ALANI</small>{nav.map(([Icon,label,active]) => <button className={`${styles.button} ${active ? styles.active : ""}`} key={label}><Icon />{label}{active && <i className={styles.indicator} />}</button>)}</nav><div className={styles.bottom}><button className={styles.button}><HelpOutlineRounded />Yardım merkezi</button><button className={styles.button} onClick={() => navigate("/login")}><LogoutRounded />Çıkış yap</button><div className={styles.workspace}><span className={styles.avatar}>AT</span><div><b>Atlas Teknoloji</b><small>Kurumsal plan</small></div><strong>⌄</strong></div></div></aside>;
}
