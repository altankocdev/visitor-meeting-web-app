import { AddRounded, CancelOutlined, CheckCircleOutlineRounded, EventOutlined, GroupsOutlined, PendingActionsRounded, SearchRounded, VisibilityOutlined } from "@mui/icons-material";
import { Alert, Snackbar } from "@mui/material";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import { useCallback, useEffect, useMemo, useState } from "react";
import { hasPermission, permissions } from "../../domain/auth/permissions";
import { reservationStatusMeta } from "../../domain/models/adminReservations";
import { getApiErrorMessage } from "../../infrastructure/api/apiError";
import { mapReservationFormToApi } from "../../infrastructure/mappers/reservationMapper";
import { organizationRepository } from "../../infrastructure/repositories/organizationRepository";
import { reservationRepository } from "../../infrastructure/repositories/reservationRepository";
import { useAuth } from "../auth/AuthContext";
import { AdminReservationDetailsDialog, ReservationDecisionDialog } from "../components/AdminReservationDialogs";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { BookingDialog } from "../components/BookingDialog";
import styles from "./AdminReservationsPage.module.css";

const statusFilterOptions = [
  ["PENDING_APPROVAL", "Onay bekleyenler"],
  ["ACTIVE", "Onaylananlar"],
  ["REJECTED", "Reddedilenler"],
  ["EXPIRED", "Süresi geçmiş olanlar"],
  ["CANCELLED", "İptal edilenler"],
  ["COMPLETED", "Tamamlananlar"],
];

function newestFirst(a, b) {
  const aCreatedAt = dayjs(a.createdAt);
  const bCreatedAt = dayjs(b.createdAt);
  if (aCreatedAt.isValid() && bCreatedAt.isValid()) return bCreatedAt.valueOf() - aCreatedAt.valueOf();
  if (aCreatedAt.isValid()) return -1;
  if (bCreatedAt.isValid()) return 1;
  return Number(b.id) - Number(a.id);
}

export function AdminReservationsPage() {
  const { session } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [managedRooms, setManagedRooms] = useState([]);
  const [filters, setFilters] = useState({ search: "", roomId: "", status: "PENDING_APPROVAL", date: "" });
  const [detailsTarget, setDetailsTarget] = useState(null);
  const [decision, setDecision] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notice, setNotice] = useState(null);

  const canApprove = hasPermission(session.permissions, permissions.RESERVATION_APPROVE);
  const canReject = hasPermission(session.permissions, permissions.RESERVATION_REJECT);
  const canCancel = hasPermission(session.permissions, permissions.RESERVATION_CANCEL_ALL);
  const canCreate = session.user.owner || hasPermission(session.permissions, permissions.RESERVATION_CREATE);

  const loadData = useCallback(async () => {
    const [reservationResult, roomResult] = await Promise.allSettled([
      reservationRepository.list({ size: 200 }),
      organizationRepository.rooms(session.user.companyId, { size: 200 }),
    ]);
    if (reservationResult.status === "fulfilled") setReservations(reservationResult.value.content ?? []);
    if (roomResult.status === "fulfilled") setManagedRooms((roomResult.value.content ?? []).filter((room) => room.active));
    if (reservationResult.status === "rejected") {
      setNotice({
        severity: "error",
        text: `Rezervasyon listesi: ${getApiErrorMessage(reservationResult.reason, "Yüklenemedi.")}`,
      });
    } else if (roomResult.status === "rejected") {
      setNotice({
        severity: "error",
        text: `Toplantı odaları: ${getApiErrorMessage(roomResult.reason, "Yüklenemedi.")}`,
      });
    }
  }, [session.user.companyId]);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = useMemo(() => reservations.filter((item) => {
    const search = filters.search.toLocaleLowerCase("tr-TR");
    return (!search || `${item.title} ${item.organizer.fullName} ${item.room.name}`.toLocaleLowerCase("tr-TR").includes(search))
      && (!filters.roomId || item.room.id === Number(filters.roomId))
      && (!filters.status || item.status === filters.status)
      && (!filters.date || dayjs(item.startTime).format("YYYY-MM-DD") === filters.date);
  }).sort(newestFirst), [filters, reservations]);

  const createReservation = async (form) => {
    try {
      await reservationRepository.create(mapReservationFormToApi(form));
      setNotice({ severity: "success", text: "Rezervasyon başarıyla oluşturuldu." });
      await loadData();
    } catch (error) {
      setNotice({ severity: "error", text: getApiErrorMessage(error, "Rezervasyon oluşturulamadı.") });
    }
  };

  const confirmDecision = async (reason) => {
    const id = decision.reservation.id;
    try {
      if (decision.action === "approve") {
        await reservationRepository.approve(id);
      } else if (decision.action === "reject") {
        await reservationRepository.reject(id, reason);
      } else if (decision.action === "cancel") {
        await reservationRepository.cancel(id, reason);
      }

      const nextStatus = decision.action === "approve" ? "ACTIVE" : decision.action === "reject" ? "REJECTED" : "CANCELLED";
      setReservations((current) => current.map((item) => item.id === id ? { ...item, status: nextStatus, rejectionReason: decision.action === "reject" ? reason : item.rejectionReason, cancelReason: decision.action === "cancel" ? reason : item.cancelReason } : item));
      setNotice({
        severity: "success",
        text: `Rezervasyon başarıyla ${decision.action === "approve" ? "onaylandı" : decision.action === "reject" ? "reddedildi" : "iptal edildi"}.`
      });
    } catch (error) {
      setNotice({
        severity: "error",
        text: getApiErrorMessage(error, `Rezervasyon ${decision.action === "approve" ? "onaylanamadı" : decision.action === "reject" ? "reddedilemedi" : "iptal edilemedi"}.`)
      });
    } finally {
      setDecision(null);
      setDetailsTarget(null);
    }
  };
  const openDecision = (action, reservation = detailsTarget) => { setDetailsTarget(null); setDecision({ action, reservation }); };

  return <div className={styles.shell}><AdminSidebar /><div className={styles.main}><AdminTopbar /><main className={styles.content}>
    <header className={styles.pageHead}><div><small>TOPLANTI YÖNETİMİ</small><h1>Rezervasyonlar</h1><p>Şirket genelindeki toplantıları görüntüleyin, değerlendirin ve yönetin.</p></div>{canCreate && <button className={styles.createButton} type="button" onClick={() => setDialogOpen(true)}><AddRounded />Yeni rezervasyon</button>}</header>
    <section className={styles.stats}><article><span className={styles.blue}><EventOutlined /></span><div><small>Toplam rezervasyon</small><strong>{reservations.length}</strong><p>Görüntülenen dönem</p></div></article><article><span className={styles.orange}><PendingActionsRounded /></span><div><small>Onay bekleyen</small><strong>{reservations.filter((item) => item.status === "PENDING_APPROVAL").length}</strong><p>Karar bekleyen talep</p></div></article><article><span className={styles.green}><CheckCircleOutlineRounded /></span><div><small>Onaylanan</small><strong>{reservations.filter((item) => item.status === "ACTIVE").length}</strong><p>Aktif toplantı</p></div></article><article><span className={styles.gray}><CancelOutlined /></span><div><small>Red / iptal</small><strong>{reservations.filter((item) => ["REJECTED", "CANCELLED"].includes(item.status)).length}</strong><p>İşlem görmüş kayıt</p></div></article></section>
    <section className={styles.panel}><header><div><h2>Rezervasyon listesi</h2><p>{filtered.length} kayıt gösteriliyor · En yeni talepler üstte</p></div></header><div className={styles.filters}><label><SearchRounded /><input value={filters.search} placeholder="Toplantı, organizatör veya oda ara..." onChange={(event) => setFilters((value) => ({ ...value, search: event.target.value }))} /></label><select value={filters.roomId} onChange={(event) => setFilters((value) => ({ ...value, roomId: event.target.value }))}><option value="">Tüm odalar</option>{managedRooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}</select><select value={filters.status} onChange={(event) => setFilters((value) => ({ ...value, status: event.target.value }))}><option value="">Tüm durumlar</option>{statusFilterOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><input type="date" value={filters.date} onChange={(event) => setFilters((value) => ({ ...value, date: event.target.value }))} /></div>
      <div className={styles.tableWrap}><table><thead><tr><th>TOPLANTI</th><th>TARİH VE SAAT</th><th>ODA</th><th>ORGANİZATÖR</th><th>KATILIMCI</th><th>DURUM</th><th>İŞLEMLER</th></tr></thead><tbody>{filtered.map((item) => { const status = reservationStatusMeta[item.status] ?? reservationStatusMeta.PENDING_APPROVAL; return <tr key={item.id}><td><div className={styles.meeting}><span>{item.title.slice(0, 2).toLocaleUpperCase("tr-TR")}</span><div><b>{item.title}</b><small>#{item.id}</small></div></div></td><td><b>{dayjs(item.startTime).locale("tr").format("D MMMM YYYY")}</b><small>{dayjs(item.startTime).format("HH:mm")} – {dayjs(item.endTime).format("HH:mm")}</small></td><td><b>{item.room.name}</b><small>{item.room.location}</small></td><td><b>{item.organizer.fullName}</b><small>{item.organizer.email}</small></td><td><span className={styles.participants}><GroupsOutlined />{item.participants?.length ?? 0} kişi</span></td><td><span className={styles.status} style={{ color: status.color, background: status.background }}><i />{status.label}</span></td><td><div className={styles.actions}><button title="Detayları görüntüle" onClick={() => setDetailsTarget(item)}><VisibilityOutlined /></button>{item.status === "PENDING_APPROVAL" && canApprove && <button className={styles.approve} title="Onayla" onClick={() => openDecision("approve", item)}><CheckCircleOutlineRounded /></button>}{item.status === "PENDING_APPROVAL" && canReject && <button className={styles.reject} title="Reddet" onClick={() => openDecision("reject", item)}><CancelOutlined /></button>}</div></td></tr>; })}</tbody></table></div>
    </section>
  </main></div>
  <AdminReservationDetailsDialog reservation={detailsTarget} onClose={() => setDetailsTarget(null)} onApprove={canApprove ? () => openDecision("approve") : undefined} onReject={canReject ? () => openDecision("reject") : undefined} onCancel={canCancel ? () => openDecision("cancel") : undefined} />
  <ReservationDecisionDialog reservation={decision?.reservation} action={decision?.action} onClose={() => setDecision(null)} onConfirm={confirmDecision} />
  <BookingDialog open={dialogOpen} onClose={() => setDialogOpen(false)} rooms={managedRooms} onCreate={createReservation} />
  <Snackbar open={Boolean(notice)} autoHideDuration={5000} onClose={() => setNotice(null)} anchorOrigin={{ vertical: "top", horizontal: "right" }} sx={{ mt: 2 }}><Alert severity={notice?.severity ?? "info"} variant="filled" onClose={() => setNotice(null)}>{notice?.text}</Alert></Snackbar>
  </div>;
}
