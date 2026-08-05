import { AssessmentOutlined, CancelOutlined, CheckCircleOutlineRounded, DownloadRounded, EventOutlined, MeetingRoomOutlined, TrendingUpRounded } from "@mui/icons-material";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { hasPermission, permissions } from "../../domain/auth/permissions";
import { getApiErrorMessage } from "../../infrastructure/api/apiError";
import { reportRepository } from "../../infrastructure/repositories/reportRepository";
import { useAuth } from "../auth/AuthContext";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import styles from "./ReportsPage.module.css";

const getRange = (days) => ({
  from: dayjs().subtract(Number(days) - 1, "day").format("YYYY-MM-DD"),
  to: dayjs().format("YYYY-MM-DD"),
});

export function ReportsPage() {
  const { session } = useAuth();
  const [range, setRange] = useState("7");
  const [roomUsage, setRoomUsage] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [cancellations, setCancellations] = useState({ totalCancelled: 0, byUser: [] });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const owner = session.user.owner;
  const canRooms = owner || hasPermission(session.permissions, permissions.REPORT_VIEW_ROOM_USAGE);
  const canStats = owner || hasPermission(session.permissions, permissions.REPORT_VIEW_RESERVATION_STATS);
  const canCancellations = owner || hasPermission(session.permissions, permissions.REPORT_VIEW_CANCELLATION_STATS);
  const canExport = owner || hasPermission(session.permissions, permissions.REPORT_EXPORT_EXCEL);
  const dates = useMemo(() => getRange(range), [range]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([
      canRooms ? reportRepository.roomUsage(dates.from, dates.to) : Promise.resolve([]),
      canStats ? reportRepository.userReservationStats(dates.from, dates.to) : Promise.resolve([]),
      canCancellations ? reportRepository.cancellations(dates.from, dates.to) : Promise.resolve({ totalCancelled: 0, byUser: [] }),
    ]).then(([rooms, users, cancelled]) => {
      if (!active) return;
      setRoomUsage(rooms ?? []);
      setUserStats(users ?? []);
      setCancellations(cancelled ?? { totalCancelled: 0, byUser: [] });
    }).catch((requestError) => {
      if (active) setError(getApiErrorMessage(requestError, "Rapor verileri yüklenemedi."));
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [canCancellations, canRooms, canStats, dates]);

  const reportSummary = useMemo(() => {
    const reservations = userStats.reduce((sum, row) => sum + row.totalCount, 0);
    const successful = userStats.reduce((sum, row) => sum + row.successfulCount, 0);
    const totalHours = roomUsage.reduce((sum, row) => sum + row.totalHoursBooked, 0);
    return { reservations, successful, approvalRate: reservations ? Math.round(successful / reservations * 100) : 0, totalHours: Math.round(totalHours * 10) / 10, cancellations: cancellations.totalCancelled ?? 0 };
  }, [cancellations.totalCancelled, roomUsage, userStats]);

  const chartData = useMemo(() => userStats.map((row) => ({ ...row, pending: Math.max(0, row.totalCount - row.successfulCount - row.unsuccessfulCount) })).sort((a, b) => b.totalCount - a.totalCount).slice(0, 7), [userStats]);
  const max = Math.max(1, ...chartData.map((row) => row.totalCount));
  const topUser = chartData[0];
  const topRoom = [...roomUsage].sort((a, b) => b.totalHoursBooked - a.totalHoursBooked)[0];
  const averageHours = reportSummary.successful ? reportSummary.totalHours / reportSummary.successful : 0;

  const exportRoomUsage = async () => {
    try {
      setExporting(true);
      const { blob, filename } = await reportRepository.exportRoomUsage(dates.from, dates.to);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (exportError) {
      setError(getApiErrorMessage(exportError, "Excel raporu indirilemedi."));
    } finally { setExporting(false); }
  };

  return <div className={styles.shell}><AdminSidebar /><div className={styles.main}><AdminTopbar /><main className={styles.content}>
    <header className={styles.pageHead}><div><small>ANALİZ VE RAPORLAMA</small><h1>Raporlar</h1><p>Rezervasyon performansını ve toplantı odası kullanımını analiz edin.</p></div><div className={styles.headActions}><select value={range} onChange={(event) => setRange(event.target.value)}><option value="7">Son 7 gün</option><option value="30">Son 30 gün</option><option value="90">Son 3 ay</option></select>{canExport && canRooms && <button type="button" disabled={exporting} onClick={exportRoomUsage}><DownloadRounded />{exporting ? "Hazırlanıyor..." : "Oda raporunu indir"}</button>}</div></header>
    {error && <p className={styles.error} role="alert">{error}</p>}
    <section className={styles.stats}><article><span className={styles.blue}><EventOutlined /></span><div><small>Toplam rezervasyon</small><strong>{loading ? "—" : reportSummary.reservations}</strong><p>Seçili tarih aralığı</p></div></article><article><span className={styles.green}><CheckCircleOutlineRounded /></span><div><small>Başarı oranı</small><strong>{loading ? "—" : `%${reportSummary.approvalRate}`}</strong><p>{reportSummary.successful} aktif / tamamlanan</p></div></article><article><span className={styles.orange}><MeetingRoomOutlined /></span><div><small>Rezerve oda süresi</small><strong>{loading ? "—" : `${reportSummary.totalHours} sa`}</strong><p>Aktif ve tamamlanan toplantılar</p></div></article><article><span className={styles.gray}><CancelOutlined /></span><div><small>İptal edilen</small><strong>{loading ? "—" : reportSummary.cancellations}</strong><p>Seçili tarih aralığı</p></div></article></section>
    <section className={styles.grid}>
      <article className={styles.chartPanel}><header><div><h2>Kullanıcı rezervasyon dağılımı</h2><p>En çok rezervasyon oluşturan kullanıcılar.</p></div><div className={styles.legend}><span><i className={styles.approvedDot} />Başarılı</span><span><i className={styles.pendingDot} />Bekleyen</span><span><i className={styles.cancelledDot} />Başarısız</span></div></header>{chartData.length ? <div className={styles.chart}>{chartData.map((row) => <div className={styles.day} key={row.userId}><div className={styles.barArea}><div className={styles.stack} style={{ height: `${row.totalCount / max * 100}%` }} title={`${row.totalCount} rezervasyon`}><i className={styles.approvedBar} style={{ flex: row.successfulCount }} /><i className={styles.pendingBar} style={{ flex: row.pending }} /><i className={styles.cancelledBar} style={{ flex: row.unsuccessfulCount }} /></div></div><b title={row.userName}>{row.userName?.split(" ")[0]}</b><small>{row.totalCount}</small></div>)}</div> : <p className={styles.empty}>Bu dönem için rezervasyon verisi bulunmuyor.</p>}</article>
      <aside className={styles.summaryPanel}><header><h2>Dönem özeti</h2><p>Operasyonel göstergeler</p></header><div className={styles.summaryList}><div><span><TrendingUpRounded /></span><p><small>En yoğun kullanıcı</small><b>{topUser?.userName ?? "—"}</b><em>{topUser ? `${topUser.totalCount} rezervasyon` : "Veri yok"}</em></p></div><div><span><MeetingRoomOutlined /></span><p><small>En çok kullanılan oda</small><b>{topRoom?.roomName ?? "—"}</b><em>{topRoom ? `${topRoom.totalHoursBooked} saat` : "Veri yok"}</em></p></div><div><span><AssessmentOutlined /></span><p><small>Ortalama toplantı süresi</small><b>{averageHours ? `${averageHours.toFixed(1)} saat` : "—"}</b><em>Başarılı rezervasyon başına</em></p></div></div></aside>
    </section>
    <section className={styles.tablePanel}><header><div><h2>Oda kullanım raporu</h2><p>Odaların rezervasyon ve süre performansı.</p></div></header><div className={styles.tableWrap}><table><thead><tr><th>ODA</th><th>REZERVASYON</th><th>TOPLAM SÜRE</th><th>GÖRELİ YOĞUNLUK</th></tr></thead><tbody>{roomUsage.map((room) => { const usage = topRoom?.totalHoursBooked ? Math.round(room.totalHoursBooked / topRoom.totalHoursBooked * 100) : 0; return <tr key={room.roomId}><td><b>{room.roomName}</b><small>#{room.roomId}</small></td><td>{room.reservationCount} toplantı</td><td>{room.totalHoursBooked} saat</td><td><div className={styles.progress}><span><i style={{ width: `${usage}%` }} /></span><b>%{usage}</b></div></td></tr>; })}</tbody></table>{!loading && !roomUsage.length && <p className={styles.empty}>Bu dönem için oda kullanım verisi bulunmuyor.</p>}</div></section>
  </main></div></div>;
}
