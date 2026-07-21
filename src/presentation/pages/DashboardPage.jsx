import { AddRounded, CalendarMonthOutlined } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useState } from "react";
import { reservations as seedReservations, rooms } from "../../domain/models/meeting";
import { BookingCalendar } from "../components/BookingCalendar";
import { BookingDialog } from "../components/BookingDialog";
import { RoomAvailability } from "../components/RoomAvailability";
import { Sidebar } from "../components/Sidebar";
import { StatCards } from "../components/StatCards";
import { Topbar } from "../components/Topbar";
import { UpcomingMeetings } from "../components/UpcomingMeetings";
import styles from "./DashboardPage.module.css";

export function DashboardPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reservations, setReservations] = useState(seedReservations);
  const createReservation = (data) => { const room = rooms.find(item => item.id === Number(data.roomId)); setReservations(current => [...current, { id: Date.now(), title:data.title, start:`${data.date}T${data.startTime}:00`, end:`${data.date}T${data.endTime}:00`, roomId:room.id, room:room.name, participants:Number(data.participantCount), status:"PENDING_APPROVAL", organizer:"Siz" }]); };
  return <div className={styles.shell}><Sidebar /><div className={styles.main}><Topbar /><main className={styles.content}><div className={styles.welcome}><div><span className={styles.date}><CalendarMonthOutlined />20 Temmuz 2026, Pazartesi</span><h1>Günaydın, Ece <span>👋</span></h1><p>Bugün çalışma alanınızda neler olduğuna göz atın.</p></div><Button className={styles.action} variant="contained" startIcon={<AddRounded />} onClick={() => setDialogOpen(true)}>Yeni rezervasyon</Button></div><StatCards /><div className={styles.grid}><BookingCalendar reservations={reservations} /><UpcomingMeetings items={reservations} /><RoomAvailability rooms={rooms} /></div></main></div><BookingDialog open={dialogOpen} onClose={() => setDialogOpen(false)} rooms={rooms} onCreate={createReservation} /></div>;
}
