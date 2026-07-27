import { AccessTimeRounded, CalendarMonthOutlined, MeetingRoomOutlined } from "@mui/icons-material";
import dayjs from "dayjs";
import styles from "./StatCards.module.css";

export function StatCards({ reservations, rooms, referenceDate }) {
  const todayCount = reservations.filter((item) => dayjs(item.start).isSame(referenceDate, "day")).length;
  const upcomingCount = reservations.filter((item) => dayjs(item.end).isAfter(referenceDate)).length;
  const availableRoomCount = rooms.filter((room) => room.available).length;

  const cards = [
    {
      label: "Bugünkü toplantılarım",
      value: todayCount,
      hint: todayCount ? "Takviminizde planlandı" : "Bugün toplantınız yok",
      Icon: AccessTimeRounded,
      tone: "blue",
    },
    {
      label: "Yaklaşan rezervasyonlarım",
      value: upcomingCount,
      hint: "Size ait rezervasyonlar",
      Icon: CalendarMonthOutlined,
      tone: "navy",
    },
    {
      label: "Müsait odalar",
      value: availableRoomCount,
      hint: `${rooms.length} oda içinden`,
      Icon: MeetingRoomOutlined,
      tone: "cyan",
    },
  ];

  return (
    <div className={styles.stats}>
      {cards.map(({ label, value, hint, Icon, tone }) => (
        <article className={styles.card} key={label}>
          <span className={`${styles.icon} ${styles[tone]}`}><Icon /></span>
          <div className={styles.copy}>
            <small>{label}</small>
            <strong>{value}</strong>
            <p>{hint}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
