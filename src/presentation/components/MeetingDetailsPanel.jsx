import {
  AccessTimeRounded,
  CloseRounded,
  Groups2Outlined,
  LockOutlined,
  MeetingRoomOutlined,
  PersonOutlineRounded,
} from "@mui/icons-material";
import { Drawer, IconButton } from "@mui/material";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import styles from "./MeetingDetailsPanel.module.css";

const statusLabels = {
  ACTIVE: "Onaylandı",
  PENDING_APPROVAL: "Onay bekliyor",
  BUSY: "Oda dolu",
};

export function MeetingDetailsPanel({ open, meetings, onClose }) {
  const firstMeeting = meetings[0];
  const dateLabel = firstMeeting
    ? dayjs(firstMeeting.start).locale("tr").format("D MMMM YYYY, dddd")
    : "";

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ className: styles.drawer }}
    >
      <div className={styles.header}>
        <div>
          <small>TAKVİM DETAYI</small>
          <h2>
            {meetings.length > 1
              ? `${meetings.length} eş zamanlı toplantı`
              : "Toplantı detayı"}
          </h2>
          <p>{dateLabel}</p>
        </div>

        <IconButton aria-label="Detay panelini kapat" onClick={onClose}>
          <CloseRounded />
        </IconButton>
      </div>

      {meetings.length > 1 && (
        <div className={styles.summary}>
          <span>{meetings.length}</span>
          <div>
            <strong>oda aynı saatte kullanımda</strong>
            <small>Her odanın bilgisi aşağıda ayrı gösteriliyor.</small>
          </div>
        </div>
      )}

      <div className={styles.list}>
        {meetings.map((meeting) => {
          const isPrivate = !meeting.isOwn;

          return (
            <article
              className={`${styles.card} ${isPrivate ? styles.privateCard : ""}`}
              key={meeting.id}
            >
              <div className={styles.cardHead}>
                <span className={styles.roomIcon}><MeetingRoomOutlined /></span>
                <div>
                  <small>{meeting.room}</small>
                  <h3>{isPrivate ? "Rezerve edilmiş oda" : meeting.title}</h3>
                </div>
                <span className={`${styles.status} ${styles[meeting.status?.toLowerCase()]}`}>
                  {statusLabels[meeting.status] ?? "Planlandı"}
                </span>
              </div>

              <div className={styles.details}>
                <span>
                  <AccessTimeRounded />
                  {dayjs(meeting.start).format("HH:mm")} – {dayjs(meeting.end).format("HH:mm")}
                </span>

                {!isPrivate && meeting.participants && (
                  <span><Groups2Outlined />{meeting.participants} katılımcı</span>
                )}

                {!isPrivate && meeting.organizer && (
                  <span><PersonOutlineRounded />Organizatör: {meeting.organizer}</span>
                )}
              </div>

              {isPrivate && (
                <div className={styles.privacy}>
                  <LockOutlined />
                  <p>
                    Bu rezervasyon başka bir kullanıcıya ait. Çalışan yetkiniz
                    nedeniyle toplantı başlığı ve katılımcı bilgileri gizlidir.
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </Drawer>
  );
}
