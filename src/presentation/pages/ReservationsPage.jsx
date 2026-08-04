import {
  AddRounded,
  CalendarMonthOutlined,
  CancelOutlined,
  CheckCircleOutlineRounded,
  Groups2Outlined,
  MoreHorizRounded,
  PendingActionsRounded,
  SearchRounded,
  VisibilityOutlined,
} from "@mui/icons-material";
import {
  Button,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
} from "@mui/material";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import { useEffect, useMemo, useState } from "react";
import { reservationStatuses } from "../../domain/models/meeting";
import { BookingDialog } from "../components/BookingDialog";
import { MeetingDetailsPanel } from "../components/MeetingDetailsPanel";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import styles from "./ReservationsPage.module.css";
import { getApiErrorMessage } from "../../infrastructure/api/apiError";
import { getAccessTokenClaims } from "../../infrastructure/auth/jwtClaims";
import { mapReservationFormToApi, mapReservationFromApi } from "../../infrastructure/mappers/reservationMapper";
import { reservationRepository } from "../../infrastructure/repositories/reservationRepository";
import { roomRepository } from "../../infrastructure/repositories/roomRepository";
import { useAuth } from "../auth/AuthContext";

const referenceDate = dayjs();

function getDisplayStatus(reservation) {
  if (reservation.status === "CANCELLED") return "CANCELLED";
  if (dayjs(reservation.end).isBefore(referenceDate)) return "COMPLETED";
  return reservation.status;
}

export function ReservationsPage() {
  const { session } = useAuth();
  const user = session.user;
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    roomId: "",
    status: "",
    date: "",
  });

  useEffect(() => {
    if (!session?.user.companyId) return;
    let active = true;
    roomRepository.byActive(session.user.companyId, true, { size: 100 })
      .then((page) => {
        if (active) setRooms(page.content);
      })
      .catch(() => {
        if (active) setRooms([]);
      });
    return () => {
      active = false;
    };
  }, [session?.user.companyId]);

  useEffect(() => {
    let active = true;
    const claims = getAccessTokenClaims();
    const from = dayjs().subtract(1, "year").startOf("day").format("YYYY-MM-DDTHH:mm:ss");
    const to = dayjs().add(1, "year").endOf("day").format("YYYY-MM-DDTHH:mm:ss");

    reservationRepository.calendar(from, to, { size: 200 })
      .then((page) => {
        if (!active) return;
        const items = page.content
          .filter((item) => !claims?.sub || String(item.organizer?.id) === String(claims.sub))
          .map(mapReservationFromApi);
        setReservations(items);
      })
      .catch((error) => {
        if (active) {
          setNotice({ severity: "error", text: getApiErrorMessage(error, "Rezervasyonlar yüklenemedi.") });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const ownReservations = useMemo(
    () => reservations
      .map((item) => ({ ...item, status: getDisplayStatus(item), isOwn: true }))
      .sort((a, b) => dayjs(b.start).valueOf() - dayjs(a.start).valueOf()),
    [reservations],
  );

  const filteredReservations = useMemo(
    () => ownReservations.filter((item) => {
      const search = filters.search.trim().toLocaleLowerCase("tr-TR");
      const matchesSearch = !search
        || item.title.toLocaleLowerCase("tr-TR").includes(search)
        || item.room.toLocaleLowerCase("tr-TR").includes(search);
      const matchesRoom = !filters.roomId || item.roomId === Number(filters.roomId);
      const matchesStatus = !filters.status || item.status === filters.status;
      const matchesDate = !filters.date || dayjs(item.start).format("YYYY-MM-DD") === filters.date;
      return matchesSearch && matchesRoom && matchesStatus && matchesDate;
    }),
    [filters, ownReservations],
  );

  const counts = {
    upcoming: ownReservations.filter((item) => dayjs(item.end).isAfter(referenceDate) && item.status !== "CANCELLED").length,
    pending: ownReservations.filter((item) => item.status === "PENDING_APPROVAL").length,
    completed: ownReservations.filter((item) => item.status === "COMPLETED").length,
  };

  const createReservation = async (data) => {
    try {
      const created = await reservationRepository.create(mapReservationFormToApi(data));
      setReservations((current) => [...current, mapReservationFromApi(created)]);
      setNotice({ severity: "success", text: "Rezervasyon oluşturuldu." });
    } catch (error) {
      setNotice({ severity: "error", text: getApiErrorMessage(error, "Rezervasyon oluşturulamadı.") });
    }
  };

  const cancelReservation = async () => {
    try {
      await reservationRepository.cancel(cancelTarget.id, "Kullanıcı tarafından iptal edildi.");
      setReservations((current) => current.map((item) => (
        item.id === cancelTarget.id ? { ...item, status: "CANCELLED" } : item
      )));
      setCancelTarget(null);
      setNotice({ severity: "success", text: "Rezervasyon iptal edildi." });
    } catch (error) {
      setNotice({ severity: "error", text: getApiErrorMessage(error, "Rezervasyon iptal edilemedi.") });
    }
  };

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <Topbar user={user} />

        <main className={styles.content}>
          <div className={styles.pageHead}>
            <div>
              <small>ÇALIŞMA ALANI</small>
              <h1>Rezervasyonlarım</h1>
              <p>Kendi toplantılarınızı görüntüleyin, filtreleyin ve yönetin.</p>
            </div>
            <Button
              className={styles.createButton}
              variant="contained"
              startIcon={<AddRounded />}
              onClick={() => setDialogOpen(true)}
            >
              Yeni rezervasyon
            </Button>
          </div>

          <div className={styles.stats}>
            <article>
              <span className={styles.blueIcon}><CalendarMonthOutlined /></span>
              <div><small>Yaklaşan</small><strong>{counts.upcoming}</strong><p>Aktif rezervasyon</p></div>
            </article>
            <article>
              <span className={styles.orangeIcon}><PendingActionsRounded /></span>
              <div><small>Onay bekleyen</small><strong>{counts.pending}</strong><p>Değerlendirme sürecinde</p></div>
            </article>
            <article>
              <span className={styles.grayIcon}><CheckCircleOutlineRounded /></span>
              <div><small>Tamamlanan</small><strong>{counts.completed}</strong><p>Geçmiş toplantı</p></div>
            </article>
          </div>

          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <div>
                <h2>Rezervasyon listesi</h2>
                <p>{loading ? "Rezervasyonlar yükleniyor..." : `${filteredReservations.length} rezervasyon gösteriliyor`}</p>
              </div>
            </div>

            <div className={styles.filters}>
              <label className={styles.search}>
                <SearchRounded />
                <input
                  value={filters.search}
                  placeholder="Toplantı veya oda ara..."
                  onChange={(event) => updateFilter("search", event.target.value)}
                />
              </label>
              <select value={filters.roomId} onChange={(event) => updateFilter("roomId", event.target.value)}>
                <option value="">Tüm odalar</option>
                {rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
              </select>
              <select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
                <option value="">Tüm durumlar</option>
                {Object.entries(reservationStatuses).map(([value, status]) => (
                  <option key={value} value={value}>{status.label}</option>
                ))}
              </select>
              <input
                className={styles.dateFilter}
                type="date"
                value={filters.date}
                onChange={(event) => updateFilter("date", event.target.value)}
                aria-label="Tarihe göre filtrele"
              />
            </div>

            {filteredReservations.length ? (
              <div className={styles.tableWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>Toplantı</th>
                      <th>Tarih ve saat</th>
                      <th>Oda</th>
                      <th>Katılımcı</th>
                      <th>Durum</th>
                      <th><span className={styles.srOnly}>İşlemler</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReservations.map((reservation) => {
                      const status = reservationStatuses[reservation.status];
                      const canCancel = ["ACTIVE", "PENDING_APPROVAL"].includes(reservation.status)
                        && dayjs(reservation.start).isAfter(referenceDate);

                      return (
                        <tr key={reservation.id}>
                          <td>
                            <div className={styles.meeting}>
                              <span>{reservation.title.slice(0, 2).toLocaleUpperCase("tr-TR")}</span>
                              <div><strong>{reservation.title}</strong><small>#{reservation.id}</small></div>
                            </div>
                          </td>
                          <td>
                            <strong>{dayjs(reservation.start).locale("tr").format("D MMMM YYYY")}</strong>
                            <small>{dayjs(reservation.start).format("HH:mm")} – {dayjs(reservation.end).format("HH:mm")}</small>
                          </td>
                          <td><strong>{reservation.room}</strong><small>Toplantı odası</small></td>
                          <td><span className={styles.participants}><Groups2Outlined />{reservation.participants} kişi</span></td>
                          <td><span className={styles.status} style={{ color: status.color }}><i style={{ background: status.color }} />{status.label}</span></td>
                          <td>
                            <div className={styles.actions}>
                              <button type="button" title="Detayları görüntüle" onClick={() => setSelectedMeeting(reservation)}><VisibilityOutlined /></button>
                              {canCancel && (
                                <button className={styles.cancelAction} type="button" title="Rezervasyonu iptal et" onClick={() => setCancelTarget(reservation)}><CancelOutlined /></button>
                              )}
                              <button type="button" title="Diğer işlemler"><MoreHorizRounded /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.empty}>
                <CalendarMonthOutlined />
                <h3>Rezervasyon bulunamadı</h3>
                <p>Filtreleri temizleyin veya yeni bir rezervasyon oluşturun.</p>
                <button type="button" onClick={() => setFilters({ search: "", roomId: "", status: "", date: "" })}>Filtreleri temizle</button>
              </div>
            )}
          </section>
        </main>
      </div>

      <BookingDialog open={dialogOpen} onClose={() => setDialogOpen(false)} rooms={rooms} onCreate={createReservation} />
      <MeetingDetailsPanel open={Boolean(selectedMeeting)} meetings={selectedMeeting ? [selectedMeeting] : []} onClose={() => setSelectedMeeting(null)} />

      <Dialog open={Boolean(cancelTarget)} onClose={() => setCancelTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle>Rezervasyonu iptal et</DialogTitle>
        <DialogContent>
          <p className={styles.cancelText}>
            <strong>{cancelTarget?.title}</strong> rezervasyonunu iptal etmek istediğinize emin misiniz?
          </p>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setCancelTarget(null)}>Vazgeç</Button>
          <Button color="error" variant="contained" onClick={cancelReservation}>Rezervasyonu iptal et</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={Boolean(notice)} autoHideDuration={5000} onClose={() => setNotice(null)}>
        <Alert severity={notice?.severity ?? "info"} onClose={() => setNotice(null)}>{notice?.text}</Alert>
      </Snackbar>
    </div>
  );
}
