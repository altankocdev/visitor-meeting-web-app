import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import trLocale from "@fullcalendar/core/locales/tr";
import { ArrowBackIosNewRounded, ArrowForwardIosRounded, TuneRounded } from "@mui/icons-material";
import { useRef } from "react";
import styles from "./BookingCalendar.module.css";

export function BookingCalendar({ reservations }) {
  const calendarRef = useRef(null);
  const events = reservations.map((item) => ({ id: String(item.id), title: `${item.title} · ${item.room}`, start: item.start, end: item.end, className: item.status === "PENDING_APPROVAL" ? "event-pending" : "event-active" }));
  const move = (direction) => calendarRef.current?.getApi()[direction]();
  return <section className={styles.panel}>
    <div className={styles.head}><div><h3>Toplantı takvimi</h3><p>Ekibinizin haftalık rezervasyon planı</p></div><div className={styles.tools}><button onClick={() => move("prev")} aria-label="Önceki hafta"><ArrowBackIosNewRounded /></button><button className={styles.today} onClick={() => move("today")}>Bugün</button><button onClick={() => move("next")} aria-label="Sonraki hafta"><ArrowForwardIosRounded /></button><button className={styles.filter}><TuneRounded />Filtrele</button></div></div>
    <FullCalendar ref={calendarRef} plugins={[timeGridPlugin, interactionPlugin]} initialView="timeGridWeek" initialDate="2026-07-20" locale={trLocale} firstDay={1} headerToolbar={false} allDaySlot={false} slotMinTime="08:00:00" slotMaxTime="19:00:00" slotDuration="01:00:00" height="auto" nowIndicator events={events} dayHeaderFormat={{ weekday: "short", day: "numeric" }} slotLabelFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }} />
  </section>;
}
