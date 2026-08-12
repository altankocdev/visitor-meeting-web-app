import { AddRounded, EditOutlined, GroupsOutlined, LockOutlined, SearchRounded, ShieldOutlined, VerifiedUserOutlined } from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "../../infrastructure/api/apiError";
import { organizationRepository } from "../../infrastructure/repositories/organizationRepository";
import { useAuth } from "../auth/AuthContext";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { DeleteAction, DetailsAction, EditAction, ManagementActions } from "../components/ManagementActions";
import { AppNotice } from "../components/AppNotice";
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
  "Şirket Yöneticisi",
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
    if (!companyId) {
      setLoading(false);
      setApiError("Şirket kullanıcıları için şirket kapsamlı bir oturum gereklidir.");
      return;
    }
    let mounted = true;
    setLoading(true);
    organizationRepository.roles(companyId, { size: 200 })
      .then((page) => {
        if (!mounted) return;
        setRoles((page.content ?? []).map(mapRole).filter((item) => item.active));
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

  const saveRole = async (data) => {
    const normalized = { ...data, permissionIds: (data.permissionIds || []).map(Number) };
    if (editTarget) {
      setRoles((current) => current.map((item) => item.id === editTarget.id ? { ...item, ...normalized } : item));
      setEditTarget(null);
    } else {
      try {
        const created = await organizationRepository.createRole(companyId, normalized);
        setRoles((current) => [mapRole(created), ...current]);
        setFormOpen(false);
        setApiError("");
      } catch (error) {
        setApiError(getApiErrorMessage(error, "Rol oluşturulamadı."));
      }
    }
  };

  const archiveRole = async (role) => {
    if (!window.confirm(`${role.name} rolünü silmek istediğinize emin misiniz? Kullanıcıların geçmiş rol kayıtları korunacaktır.`)) return;
    try {
      await organizationRepository.archiveRole(companyId, role.id);
      setRoles((current) => current.filter((item) => item.id !== role.id));
    } catch (error) {
      setApiError(getApiErrorMessage(error, "Rol silinemedi."));
    }
  };

  return (
    <div className={styles.shell}>
      <AdminSidebar session={session} />
      <div className={styles.main}>
        <AdminTopbar />
        <main className={styles.content}>
          <AppNotice notice={apiError} onClose={() => setApiError("")} />
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
                <td><ManagementActions><EditAction label="Rolü düzenle" onClick={() => setEditTarget(role)} />{!role.systemRole && <DeleteAction label="Rolü sil" onClick={() => archiveRole(role)} />}<DetailsAction label="Rol detayları" onClick={() => setDetailsTarget(role)} /></ManagementActions></td>
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
