import {
  AccessTimeRounded,
  AlternateEmailRounded,
  BorderColorOutlined,
  CloseRounded,
  Groups2Outlined,
  LockOutlined,
  LocationOnOutlined,
  MeetingRoomOutlined,
  PersonOutlineRounded,
  TvOutlined,
  VideocamOutlined,
} from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
} from "@mui/material";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import { rooms } from "../../domain/models/meeting";
import styles from "./MeetingDetailsPanel.module.css";

const statusLabels = {
  ACTIVE: "Onaylandı",
  PENDING_APPROVAL: "Onay bekliyor",
  BUSY: "Oda dolu",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal edildi",
};

export function MeetingDetailsPanel({ open, meetings, onClose }) {
  const firstMeeting = meetings[0];
  const multiple = meetings.length > 1;
  const dateLabel = firstMeeting
    ? dayjs(firstMeeting.start).locale("tr").format("D MMMM YYYY, dddd")
    : "";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={multiple ? "md" : "sm"}
      PaperProps={{ className: `${styles.dialog} ${multiple ? styles.wideDialog : ""}` }}
    >
      <header className={styles.header}>
        <span className={styles.headerIcon}><MeetingRoomOutlined /></span>
        <div>
          <small>REZERVASYON DETAYI</small>
          <h2>{multiple ? `${meetings.length} eş zamanlı toplantı` : "Toplantı detayı"}</h2>
          <p>{dateLabel}</p>
        </div>
        <IconButton className={styles.close} aria-label="Detay penceresini kapat" onClick={onClose}>
          <CloseRounded />
        </IconButton>
      </header>

      <DialogContent className={styles.content}>
        {multiple && (
          <div className={styles.summary}>
            <span>{meetings.length}</span>
            <div>
              <strong>oda aynı zaman aralığında kullanımda</strong>
              <small>Her rezervasyonun görüntüleyebildiğiniz bilgileri aşağıda ayrı gösteriliyor.</small>
            </div>
          </div>
        )}

        <div className={`${styles.list} ${multiple ? styles.multipleList : ""}`}>
          {meetings.map((meeting) => {
            const isPrivate = !meeting.isOwn;
            const statusClass = styles[meeting.status?.toLowerCase()] ?? "";
            const room = rooms.find((item) =>
              item.id === Number(meeting.roomId) || item.name === meeting.room
            );

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
                  <span className={`${styles.status} ${statusClass}`}>
                    {statusLabels[meeting.status] ?? "Planlandı"}
                  </span>
                </div>

                <div className={styles.details}>
                  <div>
                    <AccessTimeRounded />
                    <span><small>Saat</small><strong>{dayjs(meeting.start).format("HH:mm")} – {dayjs(meeting.end).format("HH:mm")}</strong></span>
                  </div>

                  {!isPrivate && meeting.participants && (
                    <div>
                      <Groups2Outlined />
                      <span><small>Katılımcı</small><strong>{meeting.participants} kişi</strong></span>
                    </div>
                  )}

                  {!isPrivate && meeting.organizer && (
                    <div>
                      <PersonOutlineRounded />
                      <span>
                        <small>Organizatör</small>
                        <strong>
                          {meeting.organizer === "Siz"
                            ? "Siz"
                            : `@${meeting.organizer.replace(/^@/, "")}`}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>

                {room && (
                  <div className={styles.roomDetails}>
                    <div className={styles.roomTitle}>
                      <span><MeetingRoomOutlined /></span>
                      <div>
                        <small>ODA BİLGİLERİ</small>
                        <strong>{room.name}</strong>
                      </div>
                    </div>

                    <div className={styles.roomMeta}>
                      <span><LocationOnOutlined />{room.location}</span>
                      <span><Groups2Outlined />{room.capacity} kişi kapasite</span>
                    </div>

                    {room.features?.length > 0 && (
                      <div className={styles.features}>
                        {room.features.map((feature) => (
                          <span key={feature}>
                            {feature.toLocaleLowerCase("tr-TR").includes("video")
                              ? <VideocamOutlined />
                              : feature.toLocaleLowerCase("tr-TR").includes("ekran")
                                ? <TvOutlined />
                                : <BorderColorOutlined />}
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!isPrivate && meeting.participantUsernames?.length > 0 && (
                  <div className={styles.usernames}>
                    <small><AlternateEmailRounded />Eklenen kullanıcılar</small>
                    <div>
                      {meeting.participantUsernames.map((username) => (
                        <span key={username}>@{username.replace(/^@/, "")}</span>
                      ))}
                    </div>
                  </div>
                )}

                {isPrivate && (
                  <div className={styles.privacy}>
                    <LockOutlined />
                    <p>
                      Bu rezervasyon başka bir kullanıcıya ait. Çalışan yetkiniz
                      nedeniyle başlık ve katılımcı bilgileri gizlidir.
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </DialogContent>

      <DialogActions className={styles.footer}>
        <Button color="inherit" variant="outlined" onClick={onClose}>Kapat</Button>
      </DialogActions>
    </Dialog>
  );
}
