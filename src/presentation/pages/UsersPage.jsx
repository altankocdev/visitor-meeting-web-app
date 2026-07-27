import { AddRounded, CheckCircleOutlineRounded, EditOutlined, GroupsOutlined, MoreHorizRounded, PersonOffOutlined, SearchRounded, ShieldOutlined } from "@mui/icons-material";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { managementSession } from "../../domain/auth/managementSession";
import { hasPermission, permissions } from "../../domain/auth/permissions";
import { companyRoles, departments, jobTitles, users as seedUsers } from "../../domain/models/users";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { UserFormDialog } from "../components/UserFormDialog";
import { EditUserDialog, UserDetailsDialog, UserStatusDialog } from "../components/UserManagementDialogs";
import styles from "./UsersPage.module.css";

export function UsersPage({ session = managementSession }) {
  const [searchParams] = useSearchParams();
  const departmentFromUrl = searchParams.get("department") || "";
  const [users, setUsers] = useState(seedUsers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [detailsTarget, setDetailsTarget] = useState(null);
  const [filters, setFilters] = useState({ search: "", department: departmentFromUrl, role: "", status: "" });
  const canCreate = hasPermission(session.permissions, permissions.USER_CREATE);
  const canUpdate = hasPermission(session.permissions, permissions.USER_UPDATE);
  const canDeactivate = hasPermission(session.permissions, permissions.USER_DEACTIVATE);
  const canActivate = hasPermission(session.permissions, permissions.USER_ACTIVATE);
  const canAssignRole = hasPermission(session.permissions, permissions.USER_ASSIGN_ROLE);

  const filteredUsers = useMemo(() => users.filter((user) => {
    const search = filters.search.trim().toLocaleLowerCase("tr-TR");
    const text = `${user.firstName} ${user.lastName} ${user.username} ${user.email}`.toLocaleLowerCase("tr-TR");
    return (!search || text.includes(search))
      && (!filters.department || user.department === filters.department)
      && (!filters.role || user.roles.includes(filters.role))
      && (!filters.status || String(user.active) === filters.status);
  }), [filters, users]);

  const createUser = (data) => {
    const department = departments.find((item) => item.id === Number(data.departmentId));
    const jobTitle = jobTitles.find((item) => item.id === Number(data.jobTitleId));
    const roles = companyRoles.filter((item) => data.roleIds.map(Number).includes(item.id)).map((item) => item.name);
    setUsers((current) => [{
      id: Date.now(), firstName: data.firstName, lastName: data.lastName, username: data.username,
      email: data.email, department: department?.name || "Belirtilmedi", jobTitle: jobTitle?.name || "Belirtilmedi",
      roles, active: true, mustChangePassword: true,
    }, ...current]);
  };

  const updateUser = (data) => {
    setUsers((current) => current.map((user) => user.id === editTarget.id
      ? { ...user, ...data, roles: Array.isArray(data.roles) ? data.roles : [data.roles] }
      : user));
    setEditTarget(null);
  };

  const toggleUserStatus = () => {
    setUsers((current) => current.map((user) => user.id === statusTarget.id
      ? { ...user, active: !user.active }
      : user));
    setStatusTarget(null);
  };

  const resetTemporaryPassword = () => {
    setUsers((current) => current.map((user) => user.id === detailsTarget.id
      ? { ...user, mustChangePassword: true }
      : user));
    setDetailsTarget((current) => ({ ...current, mustChangePassword: true }));
  };

  return (
    <div className={styles.shell}>
      <AdminSidebar session={session} />
      <div className={styles.main}>
        <AdminTopbar />
        <main className={styles.content}>
          <header className={styles.pageHead}>
            <div><small>ŞİRKET YÖNETİMİ</small><h1>Kullanıcılar</h1><p>Çalışanları görüntüleyin; departman, unvan ve rol bilgilerini yönetin.</p></div>
            {canCreate && <button className={styles.createButton} type="button" onClick={() => setDialogOpen(true)}><AddRounded /> Yeni kullanıcı</button>}
          </header>

          <section className={styles.stats}>
            <article><span className={styles.blue}><GroupsOutlined /></span><div><small>Toplam kullanıcı</small><strong>{users.length}</strong><p>Şirket hesabına kayıtlı</p></div></article>
            <article><span className={styles.green}><CheckCircleOutlineRounded /></span><div><small>Aktif kullanıcı</small><strong>{users.filter((user) => user.active).length}</strong><p>Sisteme erişimi açık</p></div></article>
            <article><span className={styles.orange}><ShieldOutlined /></span><div><small>Yönetim rolü</small><strong>{users.filter((user) => !user.roles.includes("Çalışan")).length}</strong><p>Ek yetkisi bulunan</p></div></article>
            <article><span className={styles.gray}><PersonOffOutlined /></span><div><small>İlk giriş bekleyen</small><strong>{users.filter((user) => user.mustChangePassword).length}</strong><p>Şifre değişimi gerekli</p></div></article>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}><div><h2>Kullanıcı listesi</h2><p>{filteredUsers.length} kullanıcı gösteriliyor</p></div></div>
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
                    <td><div className={styles.actions}>{canUpdate && <button type="button" title="Kullanıcıyı düzenle" onClick={() => setEditTarget(user)}><EditOutlined /></button>}{((user.active && canDeactivate) || (!user.active && canActivate)) && <button type="button" title={user.active ? "Kullanıcıyı pasifleştir" : "Kullanıcıyı aktifleştir"} onClick={() => setStatusTarget(user)}><PersonOffOutlined /></button>}<button type="button" title="Kullanıcı detayları" onClick={() => setDetailsTarget(user)}><MoreHorizRounded /></button></div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
      {canCreate && <UserFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onCreate={createUser} />}
      <EditUserDialog user={editTarget} onClose={() => setEditTarget(null)} onSave={updateUser} />
      <UserStatusDialog user={statusTarget} onClose={() => setStatusTarget(null)} onConfirm={toggleUserStatus} />
      <UserDetailsDialog
        user={detailsTarget}
        canUpdate={canUpdate}
        canAssignRole={canAssignRole}
        onClose={() => setDetailsTarget(null)}
        onEdit={() => {
          setEditTarget(detailsTarget);
          setDetailsTarget(null);
        }}
        onResetPassword={resetTemporaryPassword}
      />
    </div>
  );
}
