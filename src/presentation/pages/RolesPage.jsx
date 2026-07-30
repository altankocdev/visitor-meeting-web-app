import { AddRounded, EditOutlined, GroupsOutlined, LockOutlined, MoreHorizRounded, SearchRounded, ShieldOutlined, VerifiedUserOutlined } from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "../../infrastructure/api/apiError";
import { organizationRepository } from "../../infrastructure/repositories/organizationRepository";
import { useAuth } from "../auth/AuthContext";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { RoleDetailsDialog, RoleDialog } from "../components/RoleDialog";
import styles from "./RolesPage.module.css";

const DEFAULT_ROLE_NAMES = new Set([
  "Sistem Yöneticisi",
  "İnsan Kaynakları",
  "Tesis Yöneticisi",
  "Takım Lideri",
  "Departman Asistanı",
  "Güvenlik",
  "Çalışan",
]);

function mapRole(role) {
  return {
    ...role,
    permissionIds: (role.permissions ?? []).map((permission) => permission.id),
    userCount: role.userCount ?? 0,
    active: role.active ?? true,
    systemRole: DEFAULT_ROLE_NAMES.has(role.name),
  };
}

export function RolesPage() {
  const { session } = useAuth();
  const [roles, setRoles] = useState([]);
  const permissionGroups = [];
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [detailsTarget, setDetailsTarget] = useState(null);
  const companyId = session.user.companyId;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    organizationRepository.roles(companyId, { size: 200 })
      .then((page) => {
        if (!mounted) return;
        setRoles((page.content ?? []).map(mapRole));
        setApiError("");
      })
      .catch((error) => {
        if (mounted) setApiError(getApiErrorMessage(error, "Roller yüklenemedi."));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [companyId]);
  const filtered = useMemo(() => roles.filter((role) => `${role.name} ${role.description}`.toLocaleLowerCase("tr-TR").includes(search.toLocaleLowerCase("tr-TR"))), [roles, search]);
  const permissionCount = new Set(roles.flatMap((role) => role.permissionIds)).size;

  const saveRole = (data) => {
    const normalized = { ...data, permissionIds: (data.permissionIds || []).map(Number) };
    if (editTarget) {
      setRoles((current) => current.map((item) => item.id === editTarget.id ? { ...item, ...normalized } : item));
      setEditTarget(null);
    } else {
      setRoles((current) => [{ id: Date.now(), ...normalized, userCount: 0, active: true, systemRole: false }, ...current]);
      setFormOpen(false);
    }
  };

  return (
    <div className={styles.shell}>
      <AdminSidebar session={session} />
      <div className={styles.main}>
        <AdminTopbar />
        <main className={styles.content}>
          {apiError ? <p role="alert">{apiError}</p> : null}
          <header className={styles.pageHead}><div><small>ERİŞİM YÖNETİMİ</small><h1>Roller ve yetkiler</h1><p>Şirket rollerini oluşturun ve kullanıcıların erişebileceği işlemleri belirleyin.</p></div><button className={styles.createButton} type="button" onClick={() => setFormOpen(true)}><AddRounded /> Yeni rol</button></header>
          <section className={styles.stats}>
            <article><span className={styles.blue}><VerifiedUserOutlined /></span><div><small>Toplam rol</small><strong>{roles.length}</strong><p>Aktif rol tanımı</p></div></article>
            <article><span className={styles.green}><LockOutlined /></span><div><small>Sistem rolü</small><strong>{roles.filter((role) => role.systemRole).length}</strong><p>Varsayılan korumalı rol</p></div></article>
            <article><span className={styles.orange}><ShieldOutlined /></span><div><small>Yetki kataloğu</small><strong>{permissionCount}</strong><p>{permissionGroups.length} yetki kategorisi</p></div></article>
            <article><span className={styles.gray}><GroupsOutlined /></span><div><small>Rol atanmış kullanıcı</small><strong>{roles.reduce((sum, role) => sum + role.userCount, 0)}</strong><p>Birden fazla rol içerebilir</p></div></article>
          </section>
          <section className={styles.panel}>
            <header className={styles.panelHead}><div><h2>Rol listesi</h2><p>{loading ? "Roller yükleniyor..." : `${filtered.length} rol gösteriliyor`}</p></div></header>
            <div className={styles.filters}><label><SearchRounded /><input value={search} placeholder="Rol adı veya açıklama ara..." onChange={(event) => setSearch(event.target.value)} /></label></div>
            <div className={styles.tableWrap}><table><thead><tr><th>ROL</th><th>TÜR</th><th>YETKİ</th><th>KULLANICI</th><th>İŞLEMLER</th></tr></thead><tbody>{filtered.map((role) => (
              <tr key={role.id}>
                <td><div className={styles.role}><span><VerifiedUserOutlined /></span><div><b>{role.name}</b><small>{role.description}</small></div></div></td>
                <td><span className={role.systemRole ? styles.system : styles.custom}>{role.systemRole ? <LockOutlined /> : <EditOutlined />}{role.systemRole ? "Sistem rolü" : "Özel rol"}</span></td>
                <td><b>{role.permissionIds.length} yetki</b><small>{permissionGroups.filter((group) => group.permissions.some((item) => role.permissionIds.includes(item.id))).length} kategori</small></td>
                <td><span className={styles.users}><GroupsOutlined />{role.userCount} kullanıcı</span></td>
                <td><div className={styles.actions}><button type="button" title="Rolü düzenle" onClick={() => setEditTarget(role)}><EditOutlined /></button><button type="button" title="Rol detayları" onClick={() => setDetailsTarget(role)}><MoreHorizRounded /></button></div></td>
              </tr>
            ))}</tbody></table></div>
          </section>
        </main>
      </div>
      <RoleDialog open={formOpen || Boolean(editTarget)} role={editTarget} onClose={() => { setFormOpen(false); setEditTarget(null); }} onSave={saveRole} />
      <RoleDetailsDialog role={detailsTarget} onClose={() => setDetailsTarget(null)} onEdit={() => { setEditTarget(detailsTarget); setDetailsTarget(null); }} />
    </div>
  );
}
