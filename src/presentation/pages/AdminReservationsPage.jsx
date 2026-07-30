import { CancelOutlined, CheckCircleOutlineRounded, EventOutlined, GroupsOutlined, PendingActionsRounded, SearchRounded, VisibilityOutlined } from "@mui/icons-material";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import { useMemo, useState } from "react";
import { managementSession } from "../../domain/auth/managementSession";
import { hasPermission, permissions } from "../../domain/auth/permissions";
import { reservationStatusMeta } from "../../domain/models/adminReservations";
import { AdminReservationDetailsDialog, ReservationDecisionDialog } from "../components/AdminReservationDialogs";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import styles from "./AdminReservationsPage.module.css";

export function AdminReservationsPage({ session = managementSession }) {
  const [reservations, setReservations] = useState([]);
  const managedRooms = [];
  const [filters, setFilters] = useState({ search: "", roomId: "", status: "", date: "" });
  const [detailsTarget, setDetailsTarget] = useState(null);
  const [decision, setDecision] = useState(null);
  const canApprove = hasPermission(session.permissions, permissions.RESERVATION_APPROVE);
  const canReject = hasPermission(session.permissions, permissions.RESERVATION_REJECT);
  const canCancel = hasPermission(session.permissions, permissions.RESERVATION_CANCEL_ALL);

  const filtered = useMemo(() => reservations.filter((item) => {
    const search = filters.search.toLocaleLowerCase("tr-TR");
    return (!search || `${item.title} ${item.organizer.fullName} ${item.room.name}`.toLocaleLowerCase("tr-TR").includes(search))
      && (!filters.roomId || item.room.id === Number(filters.roomId))
      && (!filters.status || item.status === filters.status)
      && (!filters.date || dayjs(item.startTime).format("YYYY-MM-DD") === filters.date);
  }), [filters, reservations]);

  const confirmDecision = (reason) => {
    const nextStatus = decision.action === "approve" ? "ACTIVE" : decision.action === "reject" ? "REJECTED" : "CANCELLED";
    setReservations((current) => current.map((item) => item.id === decision.reservation.id ? { ...item, status: nextStatus, rejectionReason: decision.action === "reject" ? reason : item.rejectionReason, cancelReason: decision.action === "cancel" ? reason : item.cancelReason } : item));
    setDecision(null);
    setDetailsTarget(null);
  };

  const openDecision = (action, reservation = detailsTarget) => {
    setDetailsTarget(null);
    setDecision({ action, reservation });
  };

  return <div className={styles.shell}><AdminSidebar session={session} /><div className={styles.main}><AdminTopbar /><main className={styles.content}>
    <header className={styles.pageHead}><div><small>TOPLANTI YÖNETİMİ</small><h1>Rezervasyonlar</h1><p>Şirket genelindeki toplantıları görüntüleyin, değerlendirin ve yönetin.</p></div></header>
    <section className={styles.stats}><article><span className={styles.blue}><EventOutlined /></span><div><small>Toplam rezervasyon</small><strong>{reservations.length}</strong><p>Görüntülenen dönem</p></div></article><article><span className={styles.orange}><PendingActionsRounded /></span><div><small>Onay bekleyen</small><strong>{reservations.filter((item) => item.status === "PENDING_APPROVAL").length}</strong><p>Karar bekleyen talep</p></div></article><article><span className={styles.green}><CheckCircleOutlineRounded /></span><div><small>Onaylanan</small><strong>{reservations.filter((item) => item.status === "ACTIVE").length}</strong><p>Aktif toplantı</p></div></article><article><span className={styles.gray}><CancelOutlined /></span><div><small>Red / iptal</small><strong>{reservations.filter((item) => ["REJECTED","CANCELLED"].includes(item.status)).length}</strong><p>İşlem görmüş kayıt</p></div></article></section>
    <section className={styles.panel}><header><div><h2>Rezervasyon listesi</h2><p>{filtered.length} kayıt gösteriliyor</p></div></header><div className={styles.filters}><label><SearchRounded /><input value={filters.search} placeholder="Toplantı, organizatör veya oda ara..." onChange={(event) => setFilters((value) => ({ ...value, search: event.target.value }))} /></label><select value={filters.roomId} onChange={(event) => setFilters((value) => ({ ...value, roomId: event.target.value }))}><option value="">Tüm odalar</option>{managedRooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}</select><select value={filters.status} onChange={(event) => setFilters((value) => ({ ...value, status: event.target.value }))}><option value="">Tüm durumlar</option>{Object.entries(reservationStatusMeta).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}</select><input type="date" value={filters.date} onChange={(event) => setFilters((value) => ({ ...value, date: event.target.value }))} /></div>
      <div className={styles.tableWrap}><table><thead><tr><th>TOPLANTI</th><th>TARİH VE SAAT</th><th>ODA</th><th>ORGANİZATÖR</th><th>KATILIMCI</th><th>DURUM</th><th>İŞLEMLER</th></tr></thead><tbody>{filtered.map((item) => { const status = reservationStatusMeta[item.status]; return <tr key={item.id}><td><div className={styles.meeting}><span>{item.title.slice(0,2).toLocaleUpperCase("tr-TR")}</span><div><b>{item.title}</b><small>#{item.id}</small></div></div></td><td><b>{dayjs(item.startTime).locale("tr").format("D MMMM YYYY")}</b><small>{dayjs(item.startTime).format("HH:mm")} – {dayjs(item.endTime).format("HH:mm")}</small></td><td><b>{item.room.name}</b><small>{item.room.location}</small></td><td><b>{item.organizer.fullName}</b><small>{item.organizer.email}</small></td><td><span className={styles.participants}><GroupsOutlined />{item.participants.length} kişi</span></td><td><span className={styles.status} style={{ color: status.color, background: status.background }}><i />{status.label}</span></td><td><div className={styles.actions}><button title="Detayları görüntüle" onClick={() => setDetailsTarget(item)}><VisibilityOutlined /></button>{item.status === "PENDING_APPROVAL" && canApprove && <button className={styles.approve} title="Onayla" onClick={() => openDecision("approve", item)}><CheckCircleOutlineRounded /></button>}{item.status === "PENDING_APPROVAL" && canReject && <button className={styles.reject} title="Reddet" onClick={() => openDecision("reject", item)}><CancelOutlined /></button>}</div></td></tr>; })}</tbody></table></div>
    </section>
  </main></div>
  <AdminReservationDetailsDialog reservation={detailsTarget} onClose={() => setDetailsTarget(null)} onApprove={canApprove ? () => openDecision("approve") : undefined} onReject={canReject ? () => openDecision("reject") : undefined} onCancel={canCancel ? () => openDecision("cancel") : undefined} />
  <ReservationDecisionDialog reservation={decision?.reservation} action={decision?.action} onClose={() => setDecision(null)} onConfirm={confirmDecision} />
  </div>;
}
