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
import { Button, Alert, Snackbar } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { BookingDialog } from "../components/BookingDialog";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import styles from "./RoomsPage.module.css";
import { useAuth } from "../auth/AuthContext";
import { roomRepository } from "../../infrastructure/repositories/roomRepository";
import { reservationRepository } from "../../infrastructure/repositories/reservationRepository";
import { mapReservationFromApi, mapReservationFormToApi } from "../../infrastructure/mappers/reservationMapper";
import { getApiErrorMessage } from "../../infrastructure/api/apiError";

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
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!session?.user?.companyId) return;

    let active = true;
    const from = dayjs().startOf("day").toISOString();
    const to = dayjs().endOf("day").toISOString();

    Promise.allSettled([
      roomRepository.byActive(session.user.companyId, true, { size: 100 }),
      reservationRepository.calendar(from, to, { size: 500 })
    ]).then(([roomsResult, reservationsResult]) => {
      if (!active) return;

      if (roomsResult.status === "fulfilled") {
        setRooms(roomsResult.value.content ?? []);
      }
      if (reservationsResult.status === "fulfilled") {
        setReservations((reservationsResult.value.content ?? []).map(mapReservationFromApi));
      }
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [session?.user?.companyId]);

  const processedRooms = useMemo(() => {
    const now = dayjs();
    return rooms.map((room) => {
      const isBusy = reservations.some((res) => {
        if (res.roomId !== room.id || res.status === "CANCELLED") return false;
        const start = dayjs(res.start);
        const end = dayjs(res.end);
        return now.isAfter(start) && now.isBefore(end);
      });

      return {
        ...room,
        available: !isBusy,
        features: (room.features ?? []).map((f) => typeof f === "string" ? f : f.name)
      };
    });
  }, [rooms, reservations]);

  const createReservation = async (data) => {
    try {
      const apiData = mapReservationFormToApi(data);
      const created = await reservationRepository.create(apiData);
      
      const mapped = mapReservationFromApi(created);
      setReservations((current) => [...current, mapped]);
      setDialogOpen(false);
      setNotice({ severity: "success", text: "Rezervasyon başarıyla oluşturuldu." });
    } catch (err) {
      console.error("Rezervasyon oluşturulamadı: ", err);
      setNotice({ severity: "error", text: getApiErrorMessage(err, "Rezervasyon oluşturulurken bir hata oluştu.") });
    }
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
            {processedRooms.map((room) => {
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
      <Snackbar open={Boolean(notice)} autoHideDuration={5000} onClose={() => setNotice(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={notice?.severity ?? "info"} variant="filled" onClose={() => setNotice(null)}>
          {notice?.text}
        </Alert>
      </Snackbar>
    </div>
  );
}
