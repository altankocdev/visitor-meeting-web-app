import {
  CalendarMonthRounded,
  DashboardRounded,
  HelpOutlineRounded,
  LogoutRounded,
  MeetingRoomRounded,
  PeopleAltRounded,
  SettingsRounded,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { Brand } from "./Brand";
import styles from "./Sidebar.module.css";

const nav = [
  { icon: DashboardRounded, label: "Genel bakış", path: "/dashboard" },
  { icon: CalendarMonthRounded, label: "Takvim", path: "/dashboard" },
  { icon: MeetingRoomRounded, label: "Toplantı odaları", path: "/rooms" },
  { icon: PeopleAltRounded, label: "Ekip", path: "/dashboard" },
  { icon: SettingsRounded, label: "Ayarlar", path: "/dashboard" },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <aside className={styles.sidebar}>
      <Brand />

      <nav className={styles.nav}>
        <small>ÇALIŞMA ALANI</small>

        {nav.map(({ icon: Icon, label, path }) => {
          const active = pathname === path && label !== "Takvim";

          return (
            <button className={`${styles.button} ${active ? styles.active : ""}`} key={label} onClick={() => navigate(path)}>
              <Icon />
              {label}
              {active && <i className={styles.indicator} />}
            </button>
          );
        })}
      </nav>

      <div className={styles.bottom}>
        <button className={styles.button}>
          <HelpOutlineRounded />
          Yardım merkezi
        </button>

        <button className={styles.button} onClick={() => navigate("/login")}>
          <LogoutRounded />
          Çıkış yap
        </button>

        <div className={styles.workspace}>
          <span className={styles.avatar}>AT</span>
          <div>
            <b>Atlas Teknoloji</b>
            <small>Kurumsal plan</small>
          </div>
          <strong>⌄</strong>
        </div>
      </div>
    </aside>
  );
}