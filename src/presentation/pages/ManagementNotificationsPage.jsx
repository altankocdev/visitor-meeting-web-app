import { CheckCircleOutlineRounded, EventOutlined, MarkEmailReadOutlined, MeetingRoomOutlined, NotificationsNoneRounded, PersonOutlineRounded, SecurityOutlined, TuneRounded } from "@mui/icons-material";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import { useEffect, useMemo, useState } from "react";
import { managementSession } from "../../domain/auth/managementSession";
import { hasPermission, permissions } from "../../domain/auth/permissions";
import { notificationRepository } from "../../infrastructure/repositories/notificationRepository";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import styles from "./ManagementNotificationsPage.module.css";

const categoryMeta = {
  RESERVATION: { label: "Rezervasyon", icon: EventOutlined, tone: "blue" },
  USER: { label: "Kullanıcı", icon: PersonOutlineRounded, tone: "green" },
  ROOM: { label: "Oda", icon: MeetingRoomOutlined, tone: "orange" },
  SECURITY: { label: "Güvenlik", icon: SecurityOutlined, tone: "gray" },
};

const demoNotifications = [
  {
    id: "demo-1",
    recipientUserId: 1,
    title: "Yeni toplantı rezervasyonu",
    message: "Toplantı odası için yeni rezervasyon talebi oluşturuldu.",
    reservationId: 1,
    category: "RESERVATION",
    read: false,
    createdAt: new Date().toISOString(),
  },
];

const getCompanyId = (session) => session?.companyId || session?.company?.id || session?.user?.companyId || session?.user?.company?.id || 1;

const normalizeNotification = (item) => ({
  ...item,
  category: item.category || (item.reservationId ? "RESERVATION" : "SECURITY"),
});

const getPageItems = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.items)) return response.items;
  return [];
};

export function ManagementNotificationsPage({ session = managementSession }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [preferences, setPreferences] = useState({ reservation: true, user: true, room: true, security: true, email: true });
  const canManageSettings = hasPermission(session.permissions, permissions.NOTIFICATION_MANAGE_SETTINGS);
  const companyId = getCompanyId(session);

  const visible = useMemo(() => items.filter((item) => {
    if (filter === "ALL") return true;
    if (filter === "UNREAD") return !item.read;
    return item.category === filter;
  }), [filter, items]);

  useEffect(() => {
    let active = true;

    async function loadNotifications() {
      if (!companyId) {
        setItems([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const response = await notificationRepository.getNotifications(companyId);
        const notifications = getPageItems(response).map(normalizeNotification);
        if (active) setItems(notifications.length > 0 ? notifications : demoNotifications);
      } catch {
        if (active) {
          setItems(demoNotifications);
          setError("");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadNotifications();

    return () => {
      active = false;
    };
  }, [companyId]);

  const markAsRead = async (item) => {
    if (item.read || !companyId) return;

    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read: true } : entry));

    if (String(item.id).startsWith("demo-")) return;

    try {
      await notificationRepository.markAsRead(companyId, item.id);
    } catch {
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read: false } : entry));
    }
  };

  const markAllRead = async () => {
    const unreadItems = items.filter((item) => !item.read);

    setItems((current) => current.map((item) => ({ ...item, read: true })));

    await Promise.allSettled(
      unreadItems
        .filter((item) => !String(item.id).startsWith("demo-"))
        .map((item) => notificationRepository.markAsRead(companyId, item.id))
    );
  };

  const summary = {
    unread: items.filter((item) => !item.read).length,
    reservation: items.filter((item) => item.category === "RESERVATION").length,
    security: items.filter((item) => ["USER", "SECURITY"].includes(item.category)).length,
  };

  return (
    <div className={styles.shell}>
      <AdminSidebar session={session} active="notifications" />
      <main className={styles.main}>
        <AdminTopbar session={session} />
        <section className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>Haberdarlık merkezi</span>
            <h1>Bildirimler</h1>
            <p>Şirket yönetimiyle ilgili önemli işlem ve durum değişikliklerini takip edin.</p>
          </div>
          <div className={styles.actions}>
            <button className={styles.secondary} type="button" onClick={markAllRead}>
              <MarkEmailReadOutlined />
              Tümünü okundu işaretle
            </button>
            {canManageSettings && (
              <button className={styles.primary} type="button" onClick={() => setSettingsOpen(true)}>
                <TuneRounded />
                Bildirim ayarları
              </button>
            )}
          </div>
        </section>

        <section className={styles.summary}>
          <article>
            <span><NotificationsNoneRounded /></span>
            <div>Okunmamış bildirim</div>
            <strong>{summary.unread}</strong>
          </article>
          <article>
            <span><EventOutlined /></span>
            <div>Rezervasyon bildirimi</div>
            <strong>{summary.reservation}</strong>
          </article>
          <article>
            <span><SecurityOutlined /></span>
            <div>Yönetim ve güvenlik</div>
            <strong>{summary.security}</strong>
          </article>
        </section>

        <section className={styles.panel}>
          <div className={styles.filters}>
            {["ALL", "UNREAD", "RESERVATION", "USER", "ROOM", "SECURITY"].map((value) => (
              <button className={filter === value ? styles.selected : ""} type="button" key={value} onClick={() => setFilter(value)}>
                {value === "ALL" ? "Tümü" : value === "UNREAD" ? "Okunmamış" : categoryMeta[value].label}
                {value === "UNREAD" && <span>{summary.unread}</span>}
              </button>
            ))}
          </div>

          {loading && <div className={styles.empty}>Bildirimler yükleniyor.</div>}
          {error && !loading && <div className={styles.empty}>{error}</div>}
          {!loading && !error && visible.length === 0 && <div className={styles.empty}>Gösterilecek bildirim bulunmuyor.</div>}

          {!loading && !error && visible.length > 0 && (
            <div className={styles.list}>
              {visible.map((item) => {
                const meta = categoryMeta[item.category] || categoryMeta.SECURITY;
                const Icon = meta.icon;

                return (
                  <article className={`${styles.item} ${!item.read ? styles.unread : ""}`} key={item.id} onClick={() => markAsRead(item)}>
                    <span className={`${styles.icon} ${styles[meta.tone]}`}>
                      <Icon />
                    </span>
                    <div>
                      <header>
                        <strong>{item.title}</strong>
                        <small>{dayjs(item.createdAt).locale("tr").fromNow?.() || dayjs(item.createdAt).format("D MMMM · HH:mm")}</small>
                      </header>
                      <p>{item.message}</p>
                      <footer>
                        <span>{meta.label}</span>
                        {item.reservationId && <em>Rezervasyon #{item.reservationId}</em>}
                      </footer>
                    </div>
                    {!item.read && <i className={styles.dot} />}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {settingsOpen && (
        <div className={styles.backdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSettingsOpen(false)}>
          <section className={styles.settings}>
            <header>
              <h2>Bildirim ayarları</h2>
              <p>Hangi yönetim olaylarında bildirim almak istediğinizi seçin.</p>
            </header>
            <div className={styles.options}>
              {[
                { key: "reservation", label: "Rezervasyon bildirimi", text: "Yeni toplantı ve rezervasyon değişiklikleri" },
                { key: "user", label: "Kullanıcı işlemleri", text: "Yeni kullanıcı, rol ve aktiflik değişiklikleri" },
                { key: "room", label: "Oda işlemleri", text: "Oda durumu ve özellik değişiklikleri" },
                { key: "security", label: "Güvenlik olayları", text: "Kritik yetki ve hesap işlemleri" },
                { key: "email", label: "E-posta bildirimi", text: "Seçili olayları e-posta ile de gönder" },
              ].map((option) => (
                <label key={option.key}>
                  <span>
                    <b>{option.label}</b>
                    <small>{option.text}</small>
                  </span>
                  <input type="checkbox" checked={preferences[option.key]} onChange={(event) => setPreferences((value) => ({ ...value, [option.key]: event.target.checked }))} />
                </label>
              ))}
            </div>
            <footer>
              <button type="button" onClick={() => setSettingsOpen(false)}>
                Vazgeç
              </button>
              <button className={styles.save} type="button" onClick={() => setSettingsOpen(false)}>
                <CheckCircleOutlineRounded />
                Ayarları kaydet
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}