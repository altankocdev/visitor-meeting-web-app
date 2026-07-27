import trLocale from "@fullcalendar/core/locales/tr";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { ArrowBackIosNewRounded, ArrowForwardIosRounded, TuneRounded } from "@mui/icons-material";
import { useMemo, useRef, useState } from "react";
import { MeetingDetailsPanel } from "./MeetingDetailsPanel";
import styles from "./BookingCalendar.module.css";

const statusLabels = {
  ACTIVE: "Onaylandı",
  PENDING_APPROVAL: "Onay bekliyor",
  BUSY: "Dolu",
  GROUP: "Oda doluluğu",
};

export function BookingCalendar({
  reservations,
  initialDate = "2026-07-20",
  mode = "employee",
  title = "Toplantı ve oda takvimi",
  description = "Oda doluluklarını ve kendi rezervasyonlarınızı saat bazında görüntüleyin.",
}) {
  const calendarRef = useRef(null);
  const [view, setView] = useState("timeGridWeek");
  const [selectedMeetings, setSelectedMeetings] = useState([]);

  const events = useMemo(() => {
    const toEvent = (item) => ({
      id: String(item.id),
      title: item.title,
      start: item.start,
      end: item.end,
      classNames: [item.status === "PENDING_APPROVAL" ? "event-pending" : item.status === "BUSY" ? "event-busy" : "event-active"],
      extendedProps: { room: item.room, status: item.status, participants: item.participants, isOwn: item.isOwn, meeting: item },
    });

    if (view === "timeGridDay") return reservations.map(toEvent);
    const grouped = reservations.reduce((groups, item) => {
      const key = `${item.start}|${item.end}`;
      groups.set(key, [...(groups.get(key) ?? []), item]);
      return groups;
    }, new Map());

    return [...grouped.values()].map((items) => items.length === 1 ? toEvent(items[0]) : ({
      id: `group-${items.map((item) => item.id).join("-")}`,
      title: `${items.length} eş zamanlı toplantı`,
      start: items[0].start,
      end: items[0].end,
      classNames: ["event-group"],
      extendedProps: { room: items.map((item) => item.room).join(" · "), status: "GROUP", roomCount: items.length, meetings: items },
    }));
  }, [reservations, view]);

  const move = (direction) => calendarRef.current?.getApi()[direction]();
  const changeView = (nextView) => {
    calendarRef.current?.getApi().changeView(nextView);
    setView(nextView);
  };
  const renderEvent = ({ event, timeText }) => <div className={styles.eventCard}><div className={styles.eventTopline}><span>{timeText}</span><span className={styles.eventStatus}>{event.extendedProps.status === "GROUP" ? `${event.extendedProps.roomCount} oda dolu` : statusLabels[event.extendedProps.status]}</span></div><strong>{event.title}</strong><span className={styles.eventMeta}>{event.extendedProps.room}{event.extendedProps.participants ? ` · ${event.extendedProps.participants} kişi` : ""}</span></div>;

  return <section className={styles.panel}>
    <div className={styles.head}><div><h3>{title}</h3><p>{description}</p></div><div className={styles.tools}><div className={styles.viewSwitch} aria-label="Takvim görünümü"><button className={view === "timeGridDay" ? styles.selected : ""} type="button" onClick={() => changeView("timeGridDay")}>Gün</button><button className={view === "timeGridWeek" ? styles.selected : ""} type="button" onClick={() => changeView("timeGridWeek")}>Hafta</button></div><button type="button" onClick={() => move("prev")} aria-label="Önceki dönem"><ArrowBackIosNewRounded /></button><button className={styles.today} type="button" onClick={() => move("today")}>Bugün</button><button type="button" onClick={() => move("next")} aria-label="Sonraki dönem"><ArrowForwardIosRounded /></button><button className={styles.filter} type="button"><TuneRounded />Filtrele</button></div></div>
    <div className={styles.legend}><span><i className={styles.activeDot} />{mode === "admin" ? "Onaylanmış toplantı" : "Kendi rezervasyonum"}</span><span><i className={styles.pendingDot} />Onay bekliyor</span><span><i className={styles.busyDot} />{mode === "admin" ? "Eş zamanlı oda kullanımı" : "Diğer oda rezervasyonu"}</span></div>
    <FullCalendar ref={calendarRef} plugins={[timeGridPlugin, interactionPlugin]} initialView="timeGridWeek" initialDate={initialDate} locale={trLocale} firstDay={1} headerToolbar={false} allDaySlot={false} slotMinTime="08:00:00" slotMaxTime="19:00:00" slotDuration="00:30:00" slotLabelInterval="01:00:00" height="auto" nowIndicator slotEventOverlap={false} eventMinHeight={54} eventShortHeight={44} events={events} eventContent={renderEvent} eventClick={({ event }) => setSelectedMeetings((event.extendedProps.meetings ?? [event.extendedProps.meeting]).filter(Boolean))} dayHeaderFormat={{ weekday: "long", day: "numeric", month: "long" }} slotLabelFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }} />
    <MeetingDetailsPanel open={selectedMeetings.length > 0} meetings={selectedMeetings} onClose={() => setSelectedMeetings([])} />
  </section>;
}
