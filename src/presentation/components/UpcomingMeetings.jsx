import dayjs from "dayjs";
import "dayjs/locale/tr";
import { MoreHorizRounded, PeopleAltOutlined } from "@mui/icons-material";
import { reservationStatuses } from "../../domain/models/meeting";

export function UpcomingMeetings({ items }) {
  return <section className="panel upcoming"><div className="panel-head"><div><h3>Yaklaşan toplantılar</h3><p>Sıradaki rezervasyonlarınız</p></div><button className="text-button">Tümünü gör</button></div><div className="meeting-list">{items.slice(0,3).map((item) => { const status = reservationStatuses[item.status]; return <article key={item.id}><div className="meeting-date"><b>{dayjs(item.start).locale("tr").format("DD")}</b><small>{dayjs(item.start).locale("tr").format("MMM").toUpperCase()}</small></div><div className="meeting-info"><span className="status-dot" style={{color:status.color}}>{status.label}</span><h4>{item.title}</h4><p>{dayjs(item.start).format("HH:mm")} – {dayjs(item.end).format("HH:mm")} · {item.room}</p><small><PeopleAltOutlined />{item.participants} katılımcı</small></div><button className="more"><MoreHorizRounded /></button></article>; })}</div></section>;
}
