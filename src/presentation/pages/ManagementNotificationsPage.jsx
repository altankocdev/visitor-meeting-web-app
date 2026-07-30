import { CheckCircleOutlineRounded, EventOutlined, MarkEmailReadOutlined, MeetingRoomOutlined, NotificationsNoneRounded, PersonOutlineRounded, SecurityOutlined, TuneRounded } from "@mui/icons-material";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import { useMemo, useState } from "react";
import { managementSession } from "../../domain/auth/managementSession";
import { hasPermission, permissions } from "../../domain/auth/permissions";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import styles from "./ManagementNotificationsPage.module.css";

const categoryMeta = {
  RESERVATION: { label: "Rezervasyon", icon: EventOutlined, tone: "blue" },
  USER: { label: "Kullanıcı", icon: PersonOutlineRounded, tone: "green" },
  ROOM: { label: "Oda", icon: MeetingRoomOutlined, tone: "orange" },
  SECURITY: { label: "Güvenlik", icon: SecurityOutlined, tone: "gray" },
};

export function ManagementNotificationsPage({ session = managementSession }) {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [preferences, setPreferences] = useState({ reservation: true, user: true, room: true, security: true, email: true });
  const canManageSettings = hasPermission(session.permissions, permissions.NOTIFICATION_MANAGE_SETTINGS);
  const visible = useMemo(() => items.filter((item) => filter === "ALL" || filter === "UNREAD" ? (filter === "ALL" || !item.read) : item.category === filter), [filter, items]);
  const markAllRead = () => setItems((current) => current.map((item) => ({ ...item, read: true })));

  return <div className={styles.shell}><AdminSidebar session={session} /><div className={styles.main}><AdminTopbar /><main className={styles.content}>
    <header className={styles.pageHead}><div><small>HABERDARLIK MERKEZİ</small><h1>Bildirimler</h1><p>Şirket yönetimiyle ilgili önemli işlem ve durum değişikliklerini takip edin.</p></div><div><button type="button" onClick={markAllRead}><MarkEmailReadOutlined />Tümünü okundu işaretle</button>{canManageSettings && <button className={styles.primary} type="button" onClick={() => setSettingsOpen(true)}><TuneRounded />Bildirim ayarları</button>}</div></header>
    <section className={styles.summary}><article><span><NotificationsNoneRounded /></span><div><small>Okunmamış bildirim</small><strong>{items.filter((item) => !item.read).length}</strong></div></article><article><span><EventOutlined /></span><div><small>Rezervasyon bildirimi</small><strong>{items.filter((item) => item.category === "RESERVATION").length}</strong></div></article><article><span><SecurityOutlined /></span><div><small>Yönetim ve güvenlik</small><strong>{items.filter((item) => ["USER","SECURITY"].includes(item.category)).length}</strong></div></article></section>
    <section className={styles.panel}><div className={styles.filters}>{["ALL","UNREAD","RESERVATION","USER","ROOM","SECURITY"].map((value) => <button className={filter === value ? styles.selected : ""} type="button" key={value} onClick={() => setFilter(value)}>{value === "ALL" ? "Tümü" : value === "UNREAD" ? "Okunmamış" : categoryMeta[value].label}{value === "UNREAD" && <span>{items.filter((item) => !item.read).length}</span>}</button>)}</div><div className={styles.list}>{visible.map((item) => { const meta = categoryMeta[item.category]; const Icon = meta.icon; return <article className={!item.read ? styles.unread : ""} key={item.id} onClick={() => setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read: true } : entry))}><span className={`${styles.icon} ${styles[meta.tone]}`}><Icon /></span><div><header><b>{item.title}</b><small>{dayjs(item.createdAt).locale("tr").fromNow?.() || dayjs(item.createdAt).format("D MMMM · HH:mm")}</small></header><p>{item.message}</p><footer><span>{meta.label}</span>{item.reservationId && <em>Rezervasyon #{item.reservationId}</em>}</footer></div>{!item.read && <i className={styles.dot} />}</article>; })}</div></section>
  </main></div>
  {settingsOpen && <div className={styles.backdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSettingsOpen(false)}><section className={styles.dialog}><header><span><TuneRounded /></span><div><small>BİLDİRİM TERCİHLERİ</small><h2>Bildirim ayarları</h2><p>Hangi yönetim olaylarından haberdar olmak istediğinizi seçin.</p></div></header><div className={styles.preferenceList}>{[{ key:"reservation",label:"Rezervasyon işlemleri",text:"Onay talepleri, iptaller ve süre değişiklikleri"},{key:"user",label:"Kullanıcı işlemleri",text:"Yeni kullanıcı, rol ve aktiflik değişiklikleri"},{key:"room",label:"Oda işlemleri",text:"Oda durumu ve özellik değişiklikleri"},{key:"security",label:"Güvenlik olayları",text:"Kritik yetki ve hesap işlemleri"},{key:"email",label:"E-posta bildirimi",text:"Seçili olayları e-posta ile de gönder"}].map((option) => <label key={option.key}><span><b>{option.label}</b><small>{option.text}</small></span><input type="checkbox" checked={preferences[option.key]} onChange={() => setPreferences((value) => ({ ...value, [option.key]: !value[option.key] }))} /><i /></label>)}</div><footer><button type="button" onClick={() => setSettingsOpen(false)}>Vazgeç</button><button className={styles.save} type="button" onClick={() => setSettingsOpen(false)}><CheckCircleOutlineRounded />Ayarları kaydet</button></footer></section></div>}
  </div>;
}
