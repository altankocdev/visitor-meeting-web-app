import { AddRounded, CalendarMonthOutlined } from "@mui/icons-material";
import { Button } from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { hasPermission, permissions } from "../../domain/auth/permissions";
import { BookingCalendar } from "../components/BookingCalendar";
import { BookingDialog } from "../components/BookingDialog";
import { Sidebar } from "../components/Sidebar";
import { StatCards } from "../components/StatCards";
import { Topbar } from "../components/Topbar";
import { UpcomingMeetings } from "../components/UpcomingMeetings";
import styles from "./DashboardPage.module.css";
import { useAuth } from "../auth/AuthContext";
import { roomRepository } from "../../infrastructure/repositories/roomRepository";
import { reservationRepository } from "../../infrastructure/repositories/reservationRepository";
import { mapReservationFromApi, mapReservationFormToApi } from "../../infrastructure/mappers/reservationMapper";
import { getApiErrorMessage } from "../../infrastructure/api/apiError";

export function DashboardPage() {
  const { session } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = session.user;
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ")
    || `@${user.username}`;

  const referenceDate = useMemo(() => dayjs().toISOString(), []);

  useEffect(() => {
    if (!session?.user?.companyId) return;

    let active = true;

    // Odaları getir
    roomRepository.byActive(session.user.companyId, true, { size: 100 })
      .then((page) => {
        if (active) setRooms(page.content ?? []);
      })
      .catch((err) => {
        console.error("Odalar yüklenirken hata oluştu: ", err);
      });

    // Rezervasyonları getir
    const from = dayjs().subtract(1, "month").startOf("month").toISOString();
    const to = dayjs().add(2, "month").endOf("month").toISOString();

    reservationRepository.calendar(from, to, { size: 500 })
      .then((page) => {
        if (active) {
          const mapped = (page.content ?? []).map(mapReservationFromApi);
          setReservations(mapped);
        }
      })
      .catch((err) => {
        console.error("Rezervasyonlar yüklenirken hata oluştu: ", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [session?.user?.companyId]);

  const ownReservations = useMemo(
    () => reservations.filter((item) => item.organizer === "Siz" || item.organizer === user.username || item.organizerId === user.id),
    [reservations, user.username, user.id],
  );

  const upcomingReservations = useMemo(
    () => ownReservations.filter((item) => dayjs(item.end).isAfter(dayjs())),
    [ownReservations],
  );

  const calendarReservations = useMemo(
    () => reservations.map((item) => {
      const isOwn = item.organizer === "Siz" || item.organizer === user.username || item.organizerId === user.id;

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
    [reservations, user.username, user.id],
  );

  const canCreateReservation = hasPermission(
    session.permissions,
    permissions.RESERVATION_CREATE,
  );

  const createReservation = async (data) => {
    try {
      const apiData = mapReservationFormToApi(data);
      const created = await reservationRepository.create(apiData);
      
      const mapped = mapReservationFromApi(created);
      setReservations((current) => [...current, mapped]);
      setDialogOpen(false);
    } catch (err) {
      console.error("Rezervasyon oluşturulamadı: ", err);
      alert(getApiErrorMessage(err, "Rezervasyon oluşturulurken bir hata oluştu."));
    }
  };

  const formattedToday = useMemo(() => {
    return dayjs().locale("tr").format("DD MMMM YYYY, dddd");
  }, []);

  return (
    <div className={styles.shell}>
      <Sidebar />

      <div className={styles.main}>
        <Topbar user={user} />

        <main className={styles.content}>
          <div className={styles.welcome}>
            <div>
              <span className={styles.date}>
                <CalendarMonthOutlined />{formattedToday}
              </span>
              <h1>Günaydın, {displayName} <span>👋</span></h1>
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
