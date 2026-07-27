import { CancelOutlined, CheckRounded, CloseRounded, EventOutlined, GroupsOutlined, LocationOnOutlined, PersonOutlineRounded, ScheduleRounded } from "@mui/icons-material";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import { useState } from "react";
import { reservationStatusMeta } from "../../domain/models/adminReservations";
import styles from "./AdminReservationDialogs.module.css";

function Shell({ children, onClose, subtitle, title }) {
  return <div className={styles.backdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className={styles.dialog} role="dialog" aria-modal="true"><header><span><EventOutlined /></span><div><small>REZERVASYON YÖNETİMİ</small><h2>{title}</h2><p>{subtitle}</p></div><button type="button" onClick={onClose}><CloseRounded /></button></header>{children}</section></div>;
}

export function AdminReservationDetailsDialog({ onApprove, onCancel, onClose, onReject, reservation }) {
  if (!reservation) return null;
  const status = reservationStatusMeta[reservation.status];
  return <Shell onClose={onClose} title={reservation.title} subtitle={`Rezervasyon #${reservation.id}`}><div className={styles.details}><div className={styles.status} style={{ color: status.color, background: status.background }}>{status.label}</div><p className={styles.description}>{reservation.description || "Açıklama bulunmuyor."}</p><div className={styles.info}><div><ScheduleRounded /><span><small>Tarih ve saat</small><b>{dayjs(reservation.startTime).locale("tr").format("D MMMM YYYY, dddd")}</b><p>{dayjs(reservation.startTime).format("HH:mm")} – {dayjs(reservation.endTime).format("HH:mm")}</p></span></div><div><LocationOnOutlined /><span><small>Toplantı odası</small><b>{reservation.room.name}</b><p>{reservation.room.location} · {reservation.room.capacity} kişi</p></span></div><div><PersonOutlineRounded /><span><small>Organizatör</small><b>{reservation.organizer.fullName}</b><p>{reservation.organizer.email}</p></span></div><div><GroupsOutlined /><span><small>Katılımcılar</small><b>{reservation.participants.length} kişi</b><p>{reservation.participants.map((item) => item.fullName).join(", ") || "Katılımcı eklenmemiş"}</p></span></div></div>{reservation.rejectionReason && <div className={styles.reason}><b>Red nedeni</b><p>{reservation.rejectionReason}</p></div>}</div><footer>{reservation.status === "PENDING_APPROVAL" && <><button className={styles.reject} type="button" onClick={onReject}><CancelOutlined />Reddet</button><button className={styles.approve} type="button" onClick={onApprove}><CheckRounded />Onayla</button></>}{reservation.status === "ACTIVE" && <button className={styles.reject} type="button" onClick={onCancel}>Rezervasyonu iptal et</button>}<button type="button" onClick={onClose}>Kapat</button></footer></Shell>;
}

export function ReservationDecisionDialog({ action, onClose, onConfirm, reservation }) {
  const [reason, setReason] = useState("");
  if (!reservation || !action) return null;
  const approve = action === "approve";
  const cancel = action === "cancel";
  const title = approve ? "Rezervasyonu onayla" : cancel ? "Rezervasyonu iptal et" : "Rezervasyonu reddet";
  return <Shell onClose={onClose} title={title} subtitle={`${reservation.title} için kararınızı kaydedin.`}><div className={styles.decision}>{approve ? <div className={styles.approveBox}><CheckRounded /><p>Rezervasyon onaylandığında oda belirtilen tarih ve saat için kesin olarak ayrılacak.</p></div> : <label>{cancel ? "İptal nedeni" : "Red nedeni"}<textarea autoFocus rows={4} maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Karar nedenini açıklayın..." /><small>{reason.length}/500</small></label>}</div><footer><button type="button" onClick={onClose}>Vazgeç</button><button className={approve ? styles.approve : styles.reject} disabled={!approve && !reason.trim()} type="button" onClick={() => onConfirm(reason.trim())}>{approve ? "Onayla" : cancel ? "İptal et" : "Reddet"}</button></footer></Shell>;
}
