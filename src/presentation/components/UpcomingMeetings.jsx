import dayjs from "dayjs";
import "dayjs/locale/tr";
import { MoreHorizRounded, PeopleAltOutlined } from "@mui/icons-material";
import { reservationStatuses } from "../../domain/models/meeting";
import styles from "./UpcomingMeetings.module.css";

export function UpcomingMeetings({ items = [], onSelect, onViewAll }) {
  return <section className={styles.panel}><div className={styles.head}><div><h3>Yaklaşan toplantılar</h3><p>Sıradaki rezervasyonlarınız</p></div><button type="button" className={styles.textButton} onClick={onViewAll}>Tümünü gör</button></div><div className={styles.list}>{items.slice(0,3).map((item) => { const status = reservationStatuses[item.status] ?? { label: item.status || "Bilinmiyor", color: "#70818B" }; return <article className={styles.item} key={item.id}><div className={styles.date}><b>{dayjs(item.start).locale("tr").format("DD")}</b><small>{dayjs(item.start).locale("tr").format("MMM").toUpperCase()}</small></div><div className={styles.info}><span className={styles.status} style={{color:status.color}}>{status.label}</span><h4>{item.title}</h4><p>{dayjs(item.start).format("HH:mm")} – {dayjs(item.end).format("HH:mm")} · {item.room}</p><small><PeopleAltOutlined />{item.participants} katılımcı</small></div><button type="button" className={styles.more} title="Toplantı detaylarını görüntüle" aria-label={`${item.title} toplantısının detaylarını görüntüle`} onClick={() => onSelect?.(item)}><MoreHorizRounded /></button></article>; })}</div></section>;
}
