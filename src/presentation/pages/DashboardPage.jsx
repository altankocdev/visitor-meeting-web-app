import { AddRounded, CalendarMonthOutlined } from "@mui/icons-material";
import { Button, Alert, Snackbar } from "@mui/material";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { hasPermission, permissions } from "../../domain/auth/permissions";
import { BookingCalendar } from "../components/BookingCalendar";
import { BookingDialog } from "../components/BookingDialog";
import { Sidebar } from "../components/Sidebar";
import { StatCards } from "../components/StatCards";
import { Topbar } from "../components/Topbar";
import { UpcomingMeetings } from "../components/UpcomingMeetings";
import { MeetingDetailsPanel } from "../components/MeetingDetailsPanel";
import styles from "./DashboardPage.module.css";
import { useAuth } from "../auth/AuthContext";
import { roomRepository } from "../../infrastructure/repositories/roomRepository";
import { reservationRepository } from "../../infrastructure/repositories/reservationRepository";
import { mapReservationFromApi, mapReservationFormToApi } from "../../infrastructure/mappers/reservationMapper";
import { getApiErrorMessage } from "../../infrastructure/api/apiError";

export function DashboardPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const user = session.user;
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ")
    || `@${user.username}`;

  const referenceDate = useMemo(() => dayjs().toISOString(), []);

  const fetchCalendarReservations = useCallback(() => {
    const from = dayjs().subtract(1, "month").startOf("month").toISOString();
    const to = dayjs().add(2, "month").endOf("month").toISOString();

    return reservationRepository.calendar(from, to, { size: 500 })
      .then((page) => {
        const mapped = (page.content ?? []).map(mapReservationFromApi);
        setReservations(mapped);
      })
      .catch((err) => {
        console.error("Rezervasyonlar yüklenirken hata oluştu: ", err);
      });
  }, []);

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
    fetchCalendarReservations().finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [session?.user?.companyId, fetchCalendarReservations]);

  const checkIsOwn = useCallback((item) => {
    if (!user) return false;
    if (item.isOwn) return true;
    if (item.organizer === "Siz") return true;
    if (item.organizerId != null && user.id != null && String(item.organizerId) === String(user.id)) return true;
    if (user.username && item.organizer === user.username) return true;
    if (user.email && item.organizer === user.email) return true;
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
    if (fullName && item.organizer === fullName) return true;
    return false;
  }, [user]);

  const ownReservations = useMemo(
    () => reservations.filter((item) => checkIsOwn(item)),
    [reservations, checkIsOwn],
  );

  const upcomingReservations = useMemo(
    () => ownReservations.filter(
      (item) => ["ACTIVE", "PENDING_APPROVAL"].includes(item.status)
        && dayjs(item.end).isAfter(dayjs()),
    ),
    [ownReservations],
  );

  const canViewReservationDetails = user.owner || hasPermission(
    session.permissions,
    permissions.RESERVATION_VIEW_DETAILS,
  );

  const calendarReservations = useMemo(
    () => reservations.map((item) => {
      const isOwn = checkIsOwn(item);
      return {
        ...item,
        isOwn,
        canViewDetails: isOwn || canViewReservationDetails,
        status: isOwn ? item.status : "BUSY",
      };
    }),
    [reservations, checkIsOwn, canViewReservationDetails],
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
      const matchedRoom = rooms.find((r) => String(r.id) === String(data.roomId));
      const enriched = {
        ...mapped,
        room: mapped.room || matchedRoom?.name || "",
        isOwn: true,
        organizer: mapped.organizer || [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username,
        organizerId: mapped.organizerId || user.id,
      };

      setReservations((current) => [...current, enriched]);
      setDialogOpen(false);
      setNotice({ severity: "success", text: "Rezervasyon başarıyla oluşturuldu." });

      fetchCalendarReservations();
    } catch (err) {
      console.error("Rezervasyon oluşturulamadı: ", err);
      setNotice({ severity: "error", text: getApiErrorMessage(err, "Rezervasyon oluşturulurken bir hata oluştu.") });
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
            <BookingCalendar
              reservations={calendarReservations}
              description="Kendi rezervasyonlarınızı ve departmanınızdaki toplantıları saat bazında görüntüleyin."
            />
            <UpcomingMeetings items={upcomingReservations} onSelect={setSelectedMeeting} onViewAll={() => navigate("/reservations")} />
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
      <MeetingDetailsPanel open={Boolean(selectedMeeting)} meetings={selectedMeeting ? [selectedMeeting] : []} onClose={() => setSelectedMeeting(null)} />
      <Snackbar open={Boolean(notice)} autoHideDuration={5000} onClose={() => setNotice(null)} anchorOrigin={{ vertical: "top", horizontal: "right" }} sx={{ mt: 2 }}>
        <Alert severity={notice?.severity ?? "info"} variant="filled" onClose={() => setNotice(null)}>
          {notice?.text}
        </Alert>
      </Snackbar>
    </div>
  );
}
