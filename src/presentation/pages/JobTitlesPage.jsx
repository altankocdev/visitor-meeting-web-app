import { AddRounded, BadgeOutlined, CheckCircleOutlineRounded, GroupsOutlined, SearchRounded, VerifiedUserOutlined } from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "../../infrastructure/api/apiError";
import { organizationRepository } from "../../infrastructure/repositories/organizationRepository";
import { useAuth } from "../auth/AuthContext";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { DeleteAction, DetailsAction, EditAction, ManagementActions } from "../components/ManagementActions";
import { AppNotice } from "../components/AppNotice";
import { JobTitleDetailsDialog, JobTitleFormDialog } from "../components/JobTitleDialogs";
import styles from "./JobTitlesPage.module.css";

function mapJobTitle(item) {
  return {
    ...item,
    defaultRoleIds: (item.defaultRoles ?? []).map((role) => role.id),
    userCount: item.userCount ?? 0,
  };
}

function mapRole(role) {
  return {
    ...role,
    active: role.active ?? true,
    permissionIds: (role.permissions ?? []).map((permission) => permission.id),
  };
}

export function JobTitlesPage() {
  const { session } = useAuth();
  const [jobTitles, setJobTitles] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const [filters, setFilters] = useState({ search: "", status: "", roleId: "" });
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
    Promise.all([
      organizationRepository.jobTitles({ size: 200 }),
      organizationRepository.roles(companyId, { size: 200 }),
    ]).then(([jobTitlePage, rolePage]) => {
      if (!mounted) return;
      setJobTitles((jobTitlePage.content ?? []).filter((item) => item.active).map(mapJobTitle));
      setRoles((rolePage.content ?? []).filter((item) => item.active).map(mapRole));
      setApiError("");
    }).catch((error) => {
      if (mounted) setApiError(getApiErrorMessage(error, "Unvanlar yüklenemedi."));
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [companyId]);

  const filtered = useMemo(() => jobTitles.filter((item) => {
    const search = filters.search.toLocaleLowerCase("tr-TR");
    return (!search || `${item.name} ${item.description}`.toLocaleLowerCase("tr-TR").includes(search))
      && (!filters.status || String(item.active) === filters.status)
      && (!filters.roleId || item.defaultRoleIds.includes(Number(filters.roleId)));
  }), [filters, jobTitles]);

  const saveJobTitle = async (data) => {
    const normalized = { ...data, defaultRoleIds: (data.defaultRoleIds || []).map(Number) };
    if (editTarget) {
      setJobTitles((current) => current.map((item) => item.id === editTarget.id ? { ...item, ...normalized } : item));
      setEditTarget(null);
    } else {
      setSaving(true);
      try {
        const created = await organizationRepository.createJobTitle(normalized);
        setJobTitles((current) => [mapJobTitle(created), ...current]);
        setFormOpen(false);
        setApiError("");
      } catch (error) {
        setApiError(getApiErrorMessage(error, "Unvan oluşturulamadı."));
      } finally {
        setSaving(false);
      }
    }
  };

  const archiveJobTitle = async (jobTitle) => {
    if (!window.confirm(`${jobTitle.name} unvanını silmek istediğinize emin misiniz? Geçmiş kullanıcı kayıtları korunacaktır.`)) return;
    try {
      await organizationRepository.archiveJobTitle(jobTitle.id);
      setJobTitles((current) => current.filter((item) => item.id !== jobTitle.id));
    } catch (error) {
      setApiError(getApiErrorMessage(error, "Unvan silinemedi."));
    }
  };

  return <div className={styles.shell}><AdminSidebar session={session} /><div className={styles.main}><AdminTopbar /><main className={styles.content}>
    <AppNotice notice={apiError} onClose={() => setApiError("")} />
    <header className={styles.pageHead}><div><small>ORGANİZASYON YÖNETİMİ</small><h1>Unvanlar</h1><p>Şirket unvanlarını ve unvanla birlikte önerilecek varsayılan rolleri yönetin.</p></div><button className={styles.createButton} type="button" onClick={() => setFormOpen(true)}><AddRounded />Yeni unvan</button></header>
    <section className={styles.stats}>
      <article><span className={styles.blue}><BadgeOutlined /></span><div><small>Toplam unvan</small><strong>{jobTitles.length}</strong><p>Şirket unvan kataloğu</p></div></article>
      <article><span className={styles.green}><CheckCircleOutlineRounded /></span><div><small>Aktif unvan</small><strong>{jobTitles.filter((item) => item.active).length}</strong><p>Atamaya açık</p></div></article>
      <article><span className={styles.orange}><GroupsOutlined /></span><div><small>Unvanı tanımlı kullanıcı</small><strong>{jobTitles.reduce((sum, item) => sum + item.userCount, 0)}</strong><p>Organizasyona bağlı</p></div></article>
      <article><span className={styles.gray}><VerifiedUserOutlined /></span><div><small>Rol bağlı unvan</small><strong>{jobTitles.filter((item) => item.defaultRoleIds.length).length}</strong><p>Varsayılan erişim tanımlı</p></div></article>
    </section>
    <section className={styles.panel}><header className={styles.panelHead}><div><h2>Unvan listesi</h2><p>{loading ? "Unvanlar yükleniyor..." : `${filtered.length} unvan gösteriliyor`}</p></div></header>
      <div className={styles.filters}><label><SearchRounded /><input value={filters.search} placeholder="Unvan adı veya açıklama ara..." onChange={(event) => setFilters((value) => ({ ...value, search: event.target.value }))} /></label><select value={filters.roleId} onChange={(event) => setFilters((value) => ({ ...value, roleId: event.target.value }))}><option value="">Tüm varsayılan roller</option>{roles.filter((role) => role.name !== "Süper Admin").map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></div>
      <div className={styles.tableWrap}><table><thead><tr><th>UNVAN</th><th>VARSAYILAN ROL</th><th>KULLANICI</th><th>DURUM</th><th>İŞLEMLER</th></tr></thead><tbody>{filtered.map((item) => {
        const assignedRoles = roles.filter((role) => item.defaultRoleIds.includes(role.id));
        return <tr key={item.id}><td><div className={styles.title}><span><BadgeOutlined /></span><div><b>{item.name}</b><small>{item.description}</small></div></div></td><td><div className={styles.roles}>{assignedRoles.length ? assignedRoles.map((role) => <span key={role.id}>{role.name}</span>) : <small>Rol atanmamış</small>}</div></td><td><span className={styles.users}><GroupsOutlined />{item.userCount} kullanıcı</span></td><td><span className={`${styles.status} ${styles.active}`}><i />Aktif</span></td><td><ManagementActions><EditAction label="Unvanı düzenle" onClick={() => setEditTarget(item)} /><DeleteAction label="Unvanı sil" onClick={() => archiveJobTitle(item)} /><DetailsAction label="Unvan detayları" onClick={() => setDetailsTarget(item)} /></ManagementActions></td></tr>;
      })}</tbody></table></div>
    </section>
  </main></div>
  <JobTitleFormDialog open={formOpen || Boolean(editTarget)} jobTitle={editTarget} roles={roles} onClose={() => { if (!saving) { setFormOpen(false); setEditTarget(null); } }} onSave={saveJobTitle} />
  <JobTitleDetailsDialog jobTitle={detailsTarget} roles={roles} onClose={() => setDetailsTarget(null)} onEdit={() => { setEditTarget(detailsTarget); setDetailsTarget(null); }} />
  </div>;
}
