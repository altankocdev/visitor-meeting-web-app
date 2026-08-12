import { AddRounded, CheckCircleOutlineRounded, GroupsOutlined, PersonOffOutlined, SearchRounded, ShieldOutlined, UploadFileOutlined } from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { hasPermission, permissions } from "../../domain/auth/permissions";
import { getApiErrorMessage } from "../../infrastructure/api/apiError";
import { organizationRepository } from "../../infrastructure/repositories/organizationRepository";
import { userRepository } from "../../infrastructure/repositories/userRepository";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { DeleteAction, DetailsAction, EditAction, ManagementActions, StatusAction } from "../components/ManagementActions";
import { AppNotice } from "../components/AppNotice";
import { UserFormDialog } from "../components/UserFormDialog";
import { UserImportDialog } from "../components/UserImportDialog";
import { EditUserDialog, UserDeleteDialog, UserDetailsDialog, UserStatusDialog } from "../components/UserManagementDialogs";
import styles from "./UsersPage.module.css";
import { useAuth } from "../auth/AuthContext";

function mapUser(user) {
  return {
    ...user,
    departmentId: user.department?.id ?? null,
    jobTitleId: user.jobTitle?.id ?? null,
    roleIds: user.roles?.map((role) => role.id) ?? [],
    department: user.department?.name ?? "Belirtilmedi",
    jobTitle: user.jobTitle?.name ?? "Belirtilmedi",
    roles: user.roles?.map((role) => role.name) ?? [],
  };
}

export function UsersPage() {
  const { session } = useAuth();
  const [searchParams] = useSearchParams();
  const departmentFromUrl = searchParams.get("department") || "";
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [companyRoles, setCompanyRoles] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [editTarget, setEditTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [detailsTarget, setDetailsTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [filters, setFilters] = useState({ search: "", department: departmentFromUrl, role: "", status: "" });
  const canCreate = session.isPlatformAdmin
    || hasPermission(session.permissions, permissions.USER_CREATE);
  const canUpdate = hasPermission(session.permissions, permissions.USER_UPDATE);
  const canDeactivate = hasPermission(session.permissions, permissions.USER_DEACTIVATE);
  const canActivate = hasPermission(session.permissions, permissions.USER_ACTIVATE);
  const canAssignRole = hasPermission(session.permissions, permissions.USER_ASSIGN_ROLE);
  const canDelete = hasPermission(session.permissions, permissions.USER_DELETE);
  const companyId = session.user.companyId;

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      setApiError("Şirket kullanıcıları için şirket kapsamlı bir oturum gereklidir.");
      return;
    }
    let active = true;
    setLoading(true);
    Promise.all([
      userRepository.list(companyId, { size: 200 }),
      organizationRepository.departments(companyId, { size: 200 }),
      organizationRepository.roles(companyId, { size: 200 }),
      organizationRepository.jobTitles({ size: 200 }),
    ]).then(([userPage, departmentPage, rolePage, jobTitlePage]) => {
      if (!active) return;
      setUsers(userPage.content.map(mapUser));
      setDepartments(departmentPage.content);
      setCompanyRoles(rolePage.content);
      setJobTitles(jobTitlePage.content);
      setApiError("");
    }).catch((error) => {
      if (active) setApiError(getApiErrorMessage(error, "Kullanıcılar yüklenemedi."));
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [companyId]);

  const filteredUsers = useMemo(() => users.filter((user) => {
    const search = filters.search.trim().toLocaleLowerCase("tr-TR");
    const text = `${user.firstName} ${user.lastName} ${user.username} ${user.email}`.toLocaleLowerCase("tr-TR");
    return (!search || text.includes(search))
      && (!filters.department || user.department === filters.department)
      && (!filters.role || user.roles.includes(filters.role))
      && (!filters.status || String(user.active) === filters.status);
  }), [filters, users]);

  const createUser = async (data) => {
    try {
      const created = await userRepository.create(companyId, {
        ...data,
        departmentId: data.departmentId ? Number(data.departmentId) : null,
        jobTitleId: data.jobTitleId ? Number(data.jobTitleId) : null,
        roleIds: data.roleIds.map(Number),
      });
      setUsers((current) => [mapUser(created), ...current]);
      setApiError("");
      return true;
    } catch (error) {
      setApiError(getApiErrorMessage(error, "Kullanıcı oluşturulamadı."));
      return false;
    }
  };

  const importUsers = async (file) => {
    try {
      const createdUsers = await userRepository.importUsers(companyId, file);
      const userPage = await userRepository.list(companyId, { size: 200 });
      setUsers(userPage.content.map(mapUser));
      setApiError("");
      setSuccessMessage(`${createdUsers.length} kullanıcı başarıyla içe aktarıldı.`);
      return { ok: true };
    } catch (error) {
      setSuccessMessage("");
      return { ok: false, message: getApiErrorMessage(error, "Kullanıcılar Excel dosyasından aktarılamadı.") };
    }
  };

  const downloadImportTemplate = async () => {
    try {
      await userRepository.downloadImportTemplate(companyId);
      setApiError("");
    } catch (error) {
      setApiError(getApiErrorMessage(error, "Excel şablonu indirilemedi."));
    }
  };

  const updateUser = async (data) => {
    if (!editTarget) return false;
    try {
      const updated = await userRepository.update(companyId, editTarget.id, {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        departmentId: data.departmentId ? Number(data.departmentId) : null,
        jobTitleId: data.jobTitleId ? Number(data.jobTitleId) : null,
        roleIds: (data.roleIds ?? []).map(Number),
      });
      const mapped = mapUser(updated);
      setUsers((current) => current.map((user) => user.id === mapped.id ? mapped : user));
      setDetailsTarget((current) => current?.id === mapped.id ? mapped : current);
      setEditTarget(null);
      setApiError("");
      setSuccessMessage("Kullanıcı bilgileri başarıyla güncellendi.");
      return true;
    } catch (error) {
      setSuccessMessage("");
      setApiError(getApiErrorMessage(error, "Kullanıcı bilgileri güncellenemedi."));
      return false;
    }
  };

  const toggleUserStatus = async () => {
    try {
      const action = statusTarget.active ? userRepository.deactivate : userRepository.activate;
      await action(companyId, statusTarget.id);
      setUsers((current) => current.map((user) => user.id === statusTarget.id
        ? { ...user, active: !user.active }
        : user));
      setStatusTarget(null);
    } catch (error) {
      setApiError(getApiErrorMessage(error, "Kullanıcı durumu güncellenemedi."));
    }
  };

  const resetTemporaryPassword = async () => {
    try {
      await userRepository.forcePasswordReset(companyId, detailsTarget.id);
      setUsers((current) => current.map((user) => user.id === detailsTarget.id
        ? { ...user, mustChangePassword: true }
        : user));
      setDetailsTarget((current) => ({ ...current, mustChangePassword: true }));
    } catch (error) {
      setApiError(getApiErrorMessage(error, "Şifre sıfırlama zorunluluğu ayarlanamadı."));
    }
  };

  const deleteUser = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await userRepository.deleteUser(companyId, deleteTarget.id);
      setUsers((current) => current.filter((user) => user.id !== deleteTarget.id));
      setDetailsTarget(null);
      setDeleteTarget(null);
      setApiError("");
      setSuccessMessage("Kullanıcı kalıcı olarak silindi.");
    } catch (error) {
      setApiError(getApiErrorMessage(error, "Kullanıcı silinemedi. Geçmiş kaydı varsa pasifleştirmeyi deneyin."));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.shell}>
      <AdminSidebar session={session} />
      <div className={styles.main}>
        <AdminTopbar />
        <main className={styles.content}>
          <header className={styles.pageHead}>
            <div><small>ŞİRKET YÖNETİMİ</small><h1>Kullanıcılar</h1><p>Çalışanları görüntüleyin; departman, unvan ve rol bilgilerini yönetin.</p></div>
            {canCreate && <div className={styles.headActions}><button className={styles.importButton} type="button" onClick={() => setImportDialogOpen(true)}><UploadFileOutlined /> Excel ile aktar</button><button className={styles.createButton} type="button" onClick={() => setDialogOpen(true)}><AddRounded /> Yeni kullanıcı</button></div>}
          </header>
          <AppNotice notice={apiError} onClose={() => setApiError("")} />
          {successMessage && <p className={styles.success} role="status">{successMessage}</p>}

          <section className={styles.stats}>
            <article><span className={styles.blue}><GroupsOutlined /></span><div><small>Toplam kullanıcı</small><strong>{users.length}</strong><p>Şirket hesabına kayıtlı</p></div></article>
            <article><span className={styles.green}><CheckCircleOutlineRounded /></span><div><small>Aktif kullanıcı</small><strong>{users.filter((user) => user.active).length}</strong><p>Sisteme erişimi açık</p></div></article>
            <article><span className={styles.orange}><ShieldOutlined /></span><div><small>Yönetim rolü</small><strong>{users.filter((user) => !user.roles.includes("Çalışan")).length}</strong><p>Ek yetkisi bulunan</p></div></article>
            <article><span className={styles.gray}><PersonOffOutlined /></span><div><small>İlk giriş bekleyen</small><strong>{users.filter((user) => user.mustChangePassword).length}</strong><p>Şifre değişimi gerekli</p></div></article>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}><div><h2>Kullanıcı listesi</h2><p>{loading ? "Kullanıcılar yükleniyor..." : `${filteredUsers.length} kullanıcı gösteriliyor`}</p></div></div>
            <div className={styles.filters}>
              <label className={styles.search}><SearchRounded /><input value={filters.search} placeholder="Ad, kullanıcı adı veya e-posta ara..." onChange={(event) => setFilters((value) => ({ ...value, search: event.target.value }))} /></label>
              <select value={filters.department} onChange={(event) => setFilters((value) => ({ ...value, department: event.target.value }))}><option value="">Tüm departmanlar</option>{departments.map((item) => <option key={item.id}>{item.name}</option>)}</select>
              <select value={filters.role} onChange={(event) => setFilters((value) => ({ ...value, role: event.target.value }))}><option value="">Tüm roller</option>{companyRoles.map((item) => <option key={item.id}>{item.name}</option>)}</select>
              <select value={filters.status} onChange={(event) => setFilters((value) => ({ ...value, status: event.target.value }))}><option value="">Tüm durumlar</option><option value="true">Aktif</option><option value="false">Pasif</option></select>
            </div>

            <div className={styles.tableWrap}>
              <table>
                <thead><tr><th>KULLANICI</th><th>DEPARTMAN / UNVAN</th><th>ROL</th><th>DURUM</th><th>İŞLEMLER</th></tr></thead>
                <tbody>{filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td><div className={styles.user}><span>{`${user.firstName[0]}${user.lastName[0]}`}</span><div><b>{user.firstName} {user.lastName}</b><small>@{user.username} · {user.email}</small></div></div></td>
                    <td><b>{user.department}</b><small>{user.jobTitle}</small></td>
                    <td><div className={styles.roles}>{user.roles.map((role) => <span key={role}>{role}</span>)}</div></td>
                    <td><span className={`${styles.status} ${user.active ? styles.active : styles.passive}`}><i />{user.active ? (user.mustChangePassword ? "İlk giriş bekleniyor" : "Aktif") : "Pasif"}</span></td>
                    <td><ManagementActions>{canUpdate && <EditAction label="Kullanıcıyı düzenle" onClick={() => setEditTarget(user)} />}{((user.active && canDeactivate) || (!user.active && canActivate)) && <StatusAction active={user.active} label={user.active ? "Kullanıcıyı pasifleştir" : "Kullanıcıyı aktifleştir"} onClick={() => setStatusTarget(user)} />}{canDelete && !user.owner && user.id !== session.user.id && <DeleteAction label="Kullanıcıyı kalıcı olarak sil" onClick={() => setDeleteTarget(user)} />}<DetailsAction label="Kullanıcı detayları" onClick={() => setDetailsTarget(user)} /></ManagementActions></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
      {canCreate && <UserFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onCreate={createUser} departments={departments} jobTitles={jobTitles} companyRoles={companyRoles} />}
      {canCreate && <UserImportDialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} onImport={importUsers} onDownloadTemplate={downloadImportTemplate} />}
      <EditUserDialog user={editTarget} onClose={() => setEditTarget(null)} onSave={updateUser} departments={departments} jobTitles={jobTitles} companyRoles={companyRoles} />
      <UserStatusDialog user={statusTarget} onClose={() => setStatusTarget(null)} onConfirm={toggleUserStatus} />
      <UserDeleteDialog user={deleteTarget} deleting={deleting} onClose={() => setDeleteTarget(null)} onConfirm={deleteUser} />
      <UserDetailsDialog
        user={detailsTarget}
        canUpdate={canUpdate}
        canAssignRole={canAssignRole}
        canDelete={canDelete && !detailsTarget?.owner && detailsTarget?.id !== session.user.id}
        onClose={() => setDetailsTarget(null)}
        onEdit={() => {
          setEditTarget(detailsTarget);
          setDetailsTarget(null);
        }}
        onResetPassword={resetTemporaryPassword}
        onDelete={() => {
          setDeleteTarget(detailsTarget);
          setDetailsTarget(null);
        }}
      />
    </div>
  );
}
