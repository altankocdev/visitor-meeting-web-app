import { NotificationsNoneRounded, SearchRounded } from "@mui/icons-material";
import { IconButton } from "@mui/material";

export function Topbar() {
  return <header className="topbar"><label className="search"><SearchRounded /><input placeholder="Toplantı, oda veya kişi ara..." /></label><div className="topbar__actions"><IconButton><NotificationsNoneRounded /></IconButton><span className="divider"/><div className="profile"><span>EY</span><div><b>Ece Yılmaz</b><small>Şirket yöneticisi</small></div><strong>⌄</strong></div></div></header>;
}
