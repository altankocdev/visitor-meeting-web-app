import {
  AddRounded,
  EventSeatOutlined,
  Groups2Outlined,
  LocationOnOutlined,
  TableRestaurantOutlined,
  TvOutlined,
  VideocamOutlined,
  WestRounded,
} from "@mui/icons-material";
import { Button } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { reservations as seedReservations, rooms } from "../../domain/models/meeting";
import { BookingDialog } from "../components/BookingDialog";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import styles from "./RoomsPage.module.css";
import { useAuth } from "../auth/AuthContext";

const roomDetails = {
  Orion: {
    description: "Orta ölçekli ekip toplantıları, sunumlar ve video görüşmeleri için uygundur.",
    chairs: 8,
    tables: 1,
  },
  Luna: {
    description: "Küçük ekip görüşmeleri, birebir toplantılar ve hızlı planlamalar için sakin bir odadır.",
    chairs: 4,
    tables: 1,
  },
  Atlas: {
    description: "Kalabalık ekip toplantıları, müşteri sunumları ve uzun oturumlar için geniş toplantı odasıdır.",
    chairs: 12,
    tables: 2,
  },
};

export function RoomsPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [, setReservations] = useState(seedReservations);

  const createReservation = (data) => {
    const room = rooms.find((item) => item.id === Number(data.roomId));

    setReservations((current) => [
      ...current,
      {
        id: Date.now(),
        title: data.title,
        start: `${data.date}T${data.startTime}:00`,
        end: `${data.date}T${data.endTime}:00`,
        roomId: room.id,
        room: room.name,
        participants: Number(data.participantCount),
        participantUsernames: data.participantUsernames,
        status: "PENDING_APPROVAL",
        organizer: session.user.username,
      },
    ]);
  };

  return (
    <div className={styles.shell}>
      <Sidebar />

      <div className={styles.main}>
        <Topbar />

        <main className={styles.content}>
          <div className={styles.head}>
            <div>
              <button className={styles.backButton} onClick={() => navigate("/dashboard")}>
                <WestRounded />
                Genel bakışa dön
              </button>

              <h1>Toplantı odaları</h1>
              <p>Oda kapasitesi, sandalye sayısı ve donanımları inceleyerek rezervasyon oluşturun.</p>
            </div>

            <Button className={styles.action} variant="contained" startIcon={<AddRounded />} onClick={() => setDialogOpen(true)}>
              Yeni rezervasyon
            </Button>
          </div>

          <section className={styles.directory}>
            {rooms.map((room) => {
              const detail = roomDetails[room.name] || {
                description: "Toplantı ve çalışma ihtiyaçları için kullanılabilir oda.",
                chairs: room.capacity,
                tables: 1,
              };

              return (
                <article className={`${styles.card} ${room.available ? "" : styles.busyCard}`} key={room.id}>
                  <span className={styles.symbol}>{room.name.slice(0, 2).toUpperCase()}</span>

                  <div className={styles.cardContent}>
                    <div className={styles.titleRow}>
                      <h2>{room.name}</h2>
                      <span className={room.available ? styles.available : styles.busy}>
                        <i />
                        {room.available ? "Müsait" : "Dolu"}
                      </span>
                    </div>

                    <div className={styles.meta}>
                      <span>
                        <LocationOnOutlined />
                        {room.location}
                      </span>
                      <span>
                        <Groups2Outlined />
                        {room.capacity} kişi kapasite
                      </span>
                    </div>

                    <div className={styles.stats}>
                      <span>
                        <EventSeatOutlined />
                        {detail.chairs} sandalye
                      </span>
                      <span>
                        <TableRestaurantOutlined />
                        {detail.tables} masa
                      </span>
                    </div>

                    <div className={styles.features}>
                      {room.features.map((feature) => (
                        <span key={feature}>
                          {feature.includes("Video") ? <VideocamOutlined /> : <TvOutlined />}
                          {feature}
                        </span>
                      ))}
                    </div>

                    <p className={styles.description}>{detail.description}</p>
                  </div>

                  <button className={styles.reserveButton} disabled={!room.available} onClick={() => setDialogOpen(true)}>
                    {room.available ? "Rezerve et" : "Dolu"}
                  </button>
                </article>
              );
            })}
          </section>
        </main>
      </div>

      <BookingDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        rooms={rooms}
        onCreate={createReservation}
      />
    </div>
  );
}
