import { AddRounded, ApartmentRounded, ArrowForwardRounded, BadgeOutlined, CalendarMonthRounded, GroupRounded, MeetingRoomOutlined, MoreHorizRounded, PersonAddAltRounded, ScheduleRounded, TrendingUpRounded, VerifiedUserOutlined } from "@mui/icons-material";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { managementSession } from "../../domain/auth/managementSession";
import styles from "./SuperAdminDashboardPage.module.css";

const stats = [
  { label: "Toplam çalışan", value: "146", note: "139 aktif kullanıcı", icon: GroupRounded, tone: "blue" },
  { label: "Departman", value: "8", note: "12 ekip lideri", icon: ApartmentRounded, tone: "green" },
  { label: "Toplantı odası", value: "12", note: "10 oda şu an aktif", icon: MeetingRoomOutlined, tone: "orange" },
  { label: "Bugünkü toplantı", value: "24", note: "3 onay bekliyor", icon: CalendarMonthRounded, tone: "gray" },
];

const team = [
  { name: "Ayşe Kaya", username: "@ayse.kaya", department: "İnsan Kaynakları", role: "İK", status: "Aktif", initials: "AK" },
  { name: "Mert Demir", username: "@mert.demir", department: "Bilgi Teknolojileri", role: "Takım Lideri", status: "Aktif", initials: "MD" },
  { name: "Selin Aksoy", username: "@selin.aksoy", department: "Yönetim", role: "Departman Asistanı", status: "Aktif", initials: "SA" },
  { name: "Emre Yıldız", username: "@emre.yildiz", department: "Operasyon", role: "Çalışan", status: "İlk giriş bekleniyor", initials: "EY" },
];

const quickActions = [
  { icon: PersonAddAltRounded, title: "Kullanıcı oluştur", detail: "İK, çalışan veya ekip lideri ekleyin.", tone: "blue" },
  { icon: VerifiedUserOutlined, title: "Rol ve yetki ata", detail: "Kullanıcının erişim kapsamını yönetin.", tone: "green" },
  { icon: BadgeOutlined, title: "Departman ve unvan", detail: "Şirket organizasyonunu düzenleyin.", tone: "orange" },
];

export function SuperAdminDashboardPage() {
  return (
    <div className={styles.shell}>
      <AdminSidebar session={managementSession} />
      <div className={styles.main}>
        <AdminTopbar />
        <main className={styles.content}>
          <header className={styles.heading}>
            <div><span className={styles.eyebrow}>YAŞAR BİLGİ · ŞİRKET YÖNETİMİ</span><h1>Günaydın, Yönetici</h1><p>Şirketinizdeki kullanıcıları, rolleri ve toplantı operasyonlarını yönetin.</p></div>
            <button className={styles.primaryAction} type="button"><AddRounded /> Yeni kullanıcı oluştur</button>
          </header>

          <section className={styles.stats} aria-label="Şirket özeti">
            {stats.map(({ icon: Icon, label, note, tone, value }) => (
              <article className={styles.stat} key={label}><span className={`${styles.statIcon} ${styles[tone]}`}><Icon /></span><div><small>{label}</small><strong>{value}</strong><p>{note}</p></div></article>
            ))}
          </section>

          <section className={styles.grid}>
            <article className={styles.panel}>
              <header className={styles.panelHeader}><div><h2>Son eklenen kullanıcılar</h2><p>Şirket hesabına en son tanımlanan çalışanlar.</p></div><button type="button">Tüm kullanıcılar <ArrowForwardRounded /></button></header>
              <div className={styles.tableWrap}>
                <table>
                  <thead><tr><th>KULLANICI</th><th>DEPARTMAN</th><th>ROL</th><th>DURUM</th><th /></tr></thead>
                  <tbody>{team.map((user) => (
                    <tr key={user.username}>
                      <td><div className={styles.company}><span>{user.initials}</span><div><b>{user.name}</b><small>{user.username}</small></div></div></td>
                      <td>{user.department}</td><td>{user.role}</td>
                      <td><span className={user.status === "Aktif" ? styles.activeStatus : styles.pending}>{user.status}</span></td>
                      <td><button className={styles.more} type="button" aria-label={`${user.name} işlemleri`}><MoreHorizRounded /></button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </article>

            <aside className={styles.activity}>
              <header className={styles.panelHeader}><div><h2>Hızlı işlemler</h2><p>Sık kullanılan yönetim araçları.</p></div></header>
              <div className={styles.activityList}>{quickActions.map(({ detail, icon: Icon, title, tone }) => (
                <button className={styles.quickItem} type="button" key={title}><span className={`${styles.activityIcon} ${styles[tone]}`}><Icon /></span><div><b>{title}</b><p>{detail}</p></div><ArrowForwardRounded /></button>
              ))}</div>
              <div className={styles.today}><span><ScheduleRounded /></span><div><b>Bugünün özeti</b><p>24 toplantı · 38 ziyaretçi · 3 onay</p></div></div>
              <button className={styles.auditButton} type="button"><TrendingUpRounded /> Yönetim raporlarını incele</button>
            </aside>
          </section>
        </main>
      </div>
    </div>
  );
}
