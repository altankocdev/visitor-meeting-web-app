import { CalendarMonthRounded, DashboardRounded, MeetingRoomRounded, PeopleAltRounded, SettingsRounded, HelpOutlineRounded, LogoutRounded } from "@mui/icons-material";
import { Brand } from "./Brand";
import { useNavigate } from "react-router-dom";

const nav = [
  [DashboardRounded, "Genel bakış", true], [CalendarMonthRounded, "Takvim"], [MeetingRoomRounded, "Toplantı odaları"], [PeopleAltRounded, "Ekip"], [SettingsRounded, "Ayarlar"],
];

export function Sidebar() {
  const navigate = useNavigate();
  return <aside className="sidebar"><Brand /><nav><small>ÇALIŞMA ALANI</small>{nav.map(([Icon,label,active]) => <button className={active ? "active" : ""} key={label}><Icon />{label}{active && <i />}</button>)}</nav><div className="sidebar__bottom"><button><HelpOutlineRounded />Yardım merkezi</button><button onClick={() => navigate("/login")}><LogoutRounded />Çıkış yap</button><div className="workspace"><span>AT</span><div><b>Atlas Teknoloji</b><small>Kurumsal plan</small></div><strong>⌄</strong></div></div></aside>;
}
