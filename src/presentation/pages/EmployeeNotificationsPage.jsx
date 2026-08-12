import {
  CalendarMonthOutlined,
  CheckCircleOutlineRounded,
  EventOutlined,
  MarkEmailReadOutlined,
  MeetingRoomOutlined,
  NotificationsNoneRounded,
  PersonOutlineRounded,
  SecurityOutlined,
} from "@mui/icons-material";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import { useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "../../infrastructure/api/apiError";
import { notificationRepository } from "../../infrastructure/repositories/notificationRepository";
import { useAuth } from "../auth/AuthContext";
import { AppNotice } from "../components/AppNotice";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { NOTIFICATIONS_UPDATED_EVENT } from "../hooks/useUnreadNotificationCount";
import styles from "./EmployeeNotificationsPage.module.css";

const categoryMeta = {
  RESERVATION: { label: "Rezervasyon", icon: EventOutlined, tone: "blue" },
  ROOM: { label: "Oda", icon: MeetingRoomOutlined, tone: "orange" },
  USER: { label: "Kullanıcı", icon: PersonOutlineRounded, tone: "green" },
  SECURITY: { label: "Güvenlik", icon: SecurityOutlined, tone: "gray" },
};

const getCompanyId = (session) =>
  session?.companyId ||
  session?.company?.id ||
  session?.user?.companyId ||
  session?.user?.company?.id;

const getPageItems = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.items)) return response.items;
  return [];
};

const normalizeNotification = (item) => ({
  ...item,
  category: item.category || (item.reservationId ? "RESERVATION" : "SECURITY"),
});

export function EmployeeNotificationsPage() {
  const { session } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  const companyId = getCompanyId(session);

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
        const response = await notificationRepository.getNotifications(companyId, { size: 50 });
        const notifications = getPageItems(response).map(normalizeNotification);
        if (active) setItems(notifications);
      } catch (requestError) {
        if (active) {
          setItems([]);
          setError(getApiErrorMessage(requestError, "Bildirimler yüklenemedi."));
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

  const visibleItems = useMemo(
    () =>
      items.filter((item) => {
        if (filter === "ALL") return true;
        if (filter === "UNREAD") return !item.read;
        return item.category === filter;
      }),
    [filter, items],
  );

  const unreadCount = items.filter((item) => !item.read).length;
  const reservationCount = items.filter((item) => item.category === "RESERVATION").length;
  const todayCount = items.filter((item) => dayjs(item.createdAt).isSame(dayjs(), "day")).length;

  const markAsRead = async (item) => {
    if (item.read || !companyId) return;

    setItems((current) =>
      current.map((entry) =>
        entry.id === item.id ? { ...entry, read: true } : entry,
      ),
    );

    try {
      await notificationRepository.markAsRead(companyId, item.id);
      window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
    } catch {
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id ? { ...entry, read: false } : entry,
        ),
      );
    }
  };

  const markAllRead = async () => {
    const unreadItems = items.filter((item) => !item.read);
    setItems((current) => current.map((item) => ({ ...item, read: true })));

    await Promise.allSettled(
      unreadItems.map((item) => notificationRepository.markAsRead(companyId, item.id)),
    );
    window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
  };

  return (
    <div className={styles.shell}>
      <Sidebar />

      <main className={styles.main}>
        <Topbar />

        <div className={styles.content}>
          <section className={styles.pageHead}>
            <div>
              <small>ÇALIŞMA ALANI</small>
              <h1>Bildirimlerim</h1>
              <p>Rezervasyonlarınız ve toplantılarınızla ilgili güncel bildirimleri takip edin.</p>
            </div>

            <button type="button" onClick={markAllRead} disabled={!unreadCount}>
              <MarkEmailReadOutlined />
              Tümünü okundu işaretle
            </button>
          </section>

          <section className={styles.summary}>
            <article>
              <span>
                <NotificationsNoneRounded />
              </span>
              <div>
                <small>Okunmamış</small>
                <strong>{unreadCount}</strong>
              </div>
            </article>

            <article>
              <span>
                <CalendarMonthOutlined />
              </span>
              <div>
                <small>Rezervasyon</small>
                <strong>{reservationCount}</strong>
              </div>
            </article>

            <article>
              <span>
                <CheckCircleOutlineRounded />
              </span>
              <div>
                <small>Bugün gelen</small>
                <strong>{todayCount}</strong>
              </div>
            </article>
          </section>

          <section className={styles.panel}>
            <div className={styles.filters}>
              {["ALL", "UNREAD", "RESERVATION", "ROOM", "USER", "SECURITY"].map((value) => (
                <button
                  className={filter === value ? styles.selected : ""}
                  type="button"
                  key={value}
                  onClick={() => setFilter(value)}
                >
                  {value === "ALL"
                    ? "Tümü"
                    : value === "UNREAD"
                      ? "Okunmamış"
                      : categoryMeta[value].label}
                  {value === "UNREAD" && unreadCount > 0 ? <span>{unreadCount}</span> : null}
                </button>
              ))}
            </div>

            {loading ? <div className={styles.empty}>Bildirimler yükleniyor.</div> : null}
            <AppNotice notice={!loading ? error : ""} onClose={() => setError("")} />
            {!loading && !error && visibleItems.length === 0 ? (
              <div className={styles.empty}>Gösterilecek bildirim bulunmuyor.</div>
            ) : null}

            {!loading && !error && visibleItems.length > 0 ? (
              <div className={styles.list}>
                {visibleItems.map((item) => {
                  const meta = categoryMeta[item.category] || categoryMeta.SECURITY;
                  const Icon = meta.icon;

                  return (
                    <article
                      className={`${styles.item} ${!item.read ? styles.unread : ""}`}
                      key={item.id}
                      onClick={() => markAsRead(item)}
                    >
                      <span className={`${styles.icon} ${styles[meta.tone]}`}>
                        <Icon />
                      </span>

                      <div>
                        <header>
                          <strong>{item.title}</strong>
                          <small>{dayjs(item.createdAt).locale("tr").format("D MMMM YYYY · HH:mm")}</small>
                        </header>

                        <p>{item.message}</p>

                        <footer>
                          <span>{meta.label}</span>
                          {item.reservationId ? <em>Rezervasyon #{item.reservationId}</em> : null}
                        </footer>
                      </div>

                      {!item.read ? <i className={styles.dot} /> : null}
                    </article>
                  );
                })}
              </div>
            ) : null}
          </section>
        </div>
      </main>
    </div>
  );
}
