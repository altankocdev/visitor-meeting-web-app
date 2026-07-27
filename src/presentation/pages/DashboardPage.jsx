import { AddRounded, CalendarMonthOutlined } from "@mui/icons-material";
import { Button } from "@mui/material";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { employeeSession } from "../../domain/auth/employeeSession";
import { hasPermission, permissions } from "../../domain/auth/permissions";
import { reservations as seedReservations, rooms } from "../../domain/models/meeting";
import { BookingCalendar } from "../components/BookingCalendar";
import { BookingDialog } from "../components/BookingDialog";
import { Sidebar } from "../components/Sidebar";
import { StatCards } from "../components/StatCards";
import { Topbar } from "../components/Topbar";
import { UpcomingMeetings } from "../components/UpcomingMeetings";
import styles from "./DashboardPage.module.css";

const referenceDate = "2026-07-20T12:00:00";

export function DashboardPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reservations, setReservations] = useState(seedReservations);
  const user = employeeSession.user;

  const ownReservations = useMemo(
    () => reservations.filter((item) => item.organizer === "Siz" || item.organizer === user.username),
    [reservations, user.username],
  );

  const upcomingReservations = useMemo(
    () => ownReservations.filter((item) => dayjs(item.end).isAfter(referenceDate)),
    [ownReservations],
  );

  const calendarReservations = useMemo(
    () => reservations.map((item) => {
      const isOwn = item.organizer === "Siz" || item.organizer === user.username;

      return isOwn
        ? { ...item, isOwn: true }
        : {
            ...item,
            title: "Dolu",
            participants: null,
            status: "BUSY",
            organizer: null,
            isOwn: false,
          };
    }),
    [reservations, user.username],
  );

  const canCreateReservation = hasPermission(
    employeeSession.permissions,
    permissions.RESERVATION_CREATE,
  );

  const createReservation = (data) => {
    const room = rooms.find((item) => item.id === Number(data.roomId));

    setReservations((current) => [
      ...current,
      {
        id: Date.now(),
        title: data.title,
        start: `${data.date}T${data.startTime}:00`,
        end: `${data.date}T${data.endTime}:00`,
        roomId: room.id,
        room: room.name,
        participants: Number(data.participantCount),
        status: "PENDING_APPROVAL",
        organizer: user.username,
      },
    ]);
  };

  return (
    <div className={styles.shell}>
      <Sidebar session={employeeSession} />

      <div className={styles.main}>
        <Topbar user={user} />

        <main className={styles.content}>
          <div className={styles.welcome}>
            <div>
              <span className={styles.date}>
                <CalendarMonthOutlined />20 Temmuz 2026, Pazartesi
              </span>
              <h1>Günaydın, @{user.username} <span>👋</span></h1>
              <p>Kendi rezervasyonlarınızı yönetin ve uygun odaları kolayca bulun.</p>
            </div>

            {canCreateReservation && (
              <Button
                className={styles.action}
                variant="contained"
                startIcon={<AddRounded />}
                onClick={() => setDialogOpen(true)}
              >
                Yeni rezervasyon
              </Button>
            )}
          </div>

          <StatCards reservations={ownReservations} rooms={rooms} referenceDate={referenceDate} />

          <div className={styles.grid}>
            <BookingCalendar reservations={calendarReservations} />
            <UpcomingMeetings items={upcomingReservations} />
          </div>
        </main>
      </div>

      {canCreateReservation && (
        <BookingDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          rooms={rooms}
          onCreate={createReservation}
        />
      )}
    </div>
  );
}
