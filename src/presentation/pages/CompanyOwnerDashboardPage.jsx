import { ApartmentRounded, BadgeOutlined, DashboardRounded, GroupRounded, MeetingRoomOutlined } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { organizationRepository } from "../../infrastructure/repositories/organizationRepository";
import { reservationRepository } from "../../infrastructure/repositories/reservationRepository";
import { userRepository } from "../../infrastructure/repositories/userRepository";
import { useAuth } from "../auth/AuthContext";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import styles from "./CompanyOwnerDashboardPage.module.css";

export function CompanyOwnerDashboardPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const companyId = session.user.companyId;
  const [data, setData] = useState({ users: [], departments: [], roles: [], reservations: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    Promise.all([
      userRepository.list(companyId, { size: 5 }),
      organizationRepository.departments(companyId, { size: 100 }),
      organizationRepository.roles(companyId, { size: 100 }),
      reservationRepository.list({ size: 100 }),
    ]).then(([users, departments, roles, reservations]) => {
      if (mounted) setData({
        users: users.content ?? [], departments: departments.content ?? [],
        roles: roles.content ?? [], reservations: reservations.content ?? [],
      });
    }).catch((requestError) => {
      if (mounted) setError(requestError.response?.data?.message || "Şirket özeti yüklenemedi.");
    }).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [companyId]);

  const stats = [
    { label: "Kullanıcı", value: data.users.length, note: "Şirket kullanıcıları", icon: GroupRounded, tone: "blue" },
    { label: "Departman", value: data.departments.length, note: "Organizasyon birimleri", icon: ApartmentRounded, tone: "green" },
    { label: "Rol", value: data.roles.length, note: "Default ve özel roller", icon: BadgeOutlined, tone: "orange" },
    { label: "Rezervasyon", value: data.reservations.length, note: "Toplantı kayıtları", icon: MeetingRoomOutlined, tone: "gray" },
  ];

  return <div className={styles.shell}><AdminSidebar /><div className={styles.main}><AdminTopbar /><main className={styles.content}>
    <header className={styles.heading}><div><span className={styles.eyebrow}>{session.user.companyName?.toLocaleUpperCase("tr-TR")} · ŞİRKET YÖNETİMİ</span><h1>Hoş geldiniz, {session.user.firstName}</h1><p>Kendi şirketinizdeki kullanıcıları, rolleri ve toplantı operasyonlarını yönetin.</p></div><button className={styles.primaryAction} type="button" onClick={() => navigate("/dashboard")}><DashboardRounded />Çalışma alanına git</button></header>
    {error ? <p className={styles.error} role="alert">{error}</p> : null}
    <section className={styles.stats}>{stats.map(({ icon: Icon, label, note, tone, value }) => <article className={styles.stat} key={label}><span className={`${styles.statIcon} ${styles[tone]}`}><Icon /></span><div><small>{label}</small><strong>{loading ? "—" : value}</strong><p>{note}</p></div></article>)}</section>
    <section className={styles.panel}><header className={styles.panelHeader}><div><h2>Son kullanıcılar</h2><p>Veritabanındaki şirket kullanıcıları.</p></div></header><div className={styles.tableWrap}><table><thead><tr><th>KULLANICI</th><th>E-POSTA</th><th>ROLLER</th><th>DURUM</th></tr></thead><tbody>
      {!loading && data.users.length === 0 ? <tr><td colSpan="4">Henüz kullanıcı bulunmuyor.</td></tr> : data.users.map((user) => <tr key={user.id}><td><b>{user.firstName} {user.lastName}</b><br /><small>@{user.username}</small></td><td>{user.email}</td><td>{user.roles?.map((role) => role.name).join(", ") || "Şirket sahibi"}</td><td><span className={user.active ? styles.activeStatus : styles.pending}>{user.active ? "Aktif" : "Pasif"}</span></td></tr>)}
    </tbody></table></div></section>
  </main></div></div>;
}
