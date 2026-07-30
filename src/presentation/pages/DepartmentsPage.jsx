import { AddRounded, ApartmentRounded, CheckCircleOutlineRounded, EditOutlined, GroupsOutlined, MoreHorizRounded, SearchRounded, ToggleOffOutlined } from "@mui/icons-material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { managementSession } from "../../domain/auth/managementSession";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { DepartmentDetailsDialog, DepartmentFormDialog, DepartmentStatusDialog } from "../components/DepartmentDialogs";
import styles from "./DepartmentsPage.module.css";

export function DepartmentsPage({ session = managementSession }) {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [detailsTarget, setDetailsTarget] = useState(null);

  const filtered = useMemo(() => departments.filter((department) => {
    const search = filters.search.trim().toLocaleLowerCase("tr-TR");
    return (!search || `${department.name} ${department.description}`.toLocaleLowerCase("tr-TR").includes(search))
      && (!filters.status || String(department.active) === filters.status);
  }), [departments, filters]);

  const saveDepartment = (data) => {
    if (editTarget) {
      setDepartments((current) => current.map((item) => item.id === editTarget.id ? { ...item, ...data } : item));
      setEditTarget(null);
    } else {
      setDepartments((current) => [{ id: Date.now(), ...data, userCount: 0, active: true, manager: null }, ...current]);
      setFormOpen(false);
    }
  };

  const toggleStatus = () => {
    setDepartments((current) => current.map((item) => item.id === statusTarget.id ? { ...item, active: !item.active } : item));
    setStatusTarget(null);
  };

  return (
    <div className={styles.shell}>
      <AdminSidebar session={session} />
      <div className={styles.main}>
        <AdminTopbar />
        <main className={styles.content}>
          <header className={styles.pageHead}>
            <div><small>ORGANİZASYON YÖNETİMİ</small><h1>Departmanlar</h1><p>Şirket organizasyonunu oluşturun ve çalışanların bağlı olduğu birimleri yönetin.</p></div>
            <button className={styles.createButton} type="button" onClick={() => setFormOpen(true)}><AddRounded /> Yeni departman</button>
          </header>

          <section className={styles.stats}>
            <article><span className={styles.blue}><ApartmentRounded /></span><div><small>Toplam departman</small><strong>{departments.length}</strong><p>Şirket organizasyonu</p></div></article>
            <article><span className={styles.green}><CheckCircleOutlineRounded /></span><div><small>Aktif departman</small><strong>{departments.filter((item) => item.active).length}</strong><p>Kullanıma açık birim</p></div></article>
            <article><span className={styles.orange}><GroupsOutlined /></span><div><small>Bağlı çalışan</small><strong>{departments.reduce((total, item) => total + item.userCount, 0)}</strong><p>Departmanı tanımlı kullanıcı</p></div></article>
            <article><span className={styles.gray}><ToggleOffOutlined /></span><div><small>Pasif departman</small><strong>{departments.filter((item) => !item.active).length}</strong><p>Yeni atamaya kapalı</p></div></article>
          </section>

          <section className={styles.panel}>
            <header className={styles.panelHead}><div><h2>Departman listesi</h2><p>{filtered.length} departman gösteriliyor</p></div></header>
            <div className={styles.filters}>
              <label className={styles.search}><SearchRounded /><input value={filters.search} placeholder="Departman adı veya açıklama ara..." onChange={(event) => setFilters((value) => ({ ...value, search: event.target.value }))} /></label>
              <select value={filters.status} onChange={(event) => setFilters((value) => ({ ...value, status: event.target.value }))}><option value="">Tüm durumlar</option><option value="true">Aktif</option><option value="false">Pasif</option></select>
            </div>
            <div className={styles.tableWrap}>
              <table>
                <thead><tr><th>DEPARTMAN</th><th>YÖNETİCİ</th><th>ÇALIŞAN</th><th>DURUM</th><th>İŞLEMLER</th></tr></thead>
                <tbody>{filtered.map((department) => (
                  <tr key={department.id}>
                    <td><div className={styles.department}><span><ApartmentRounded /></span><div><b>{department.name}</b><small>{department.description}</small></div></div></td>
                    <td><b>{department.manager || "Atanmadı"}</b><small>Departman yöneticisi</small></td>
                    <td><span className={styles.userCount}><GroupsOutlined />{department.userCount} kullanıcı</span></td>
                    <td><span className={`${styles.status} ${department.active ? styles.active : styles.passive}`}><i />{department.active ? "Aktif" : "Pasif"}</span></td>
                    <td><div className={styles.actions}><button type="button" title="Departmanı düzenle" onClick={() => setEditTarget(department)}><EditOutlined /></button><button type="button" title={department.active ? "Departmanı pasifleştir" : "Departmanı aktifleştir"} onClick={() => setStatusTarget(department)}><ToggleOffOutlined /></button><button type="button" title="Departman detayları" onClick={() => setDetailsTarget(department)}><MoreHorizRounded /></button></div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      <DepartmentFormDialog open={formOpen || Boolean(editTarget)} department={editTarget} onClose={() => { setFormOpen(false); setEditTarget(null); }} onSave={saveDepartment} />
      <DepartmentStatusDialog department={statusTarget} onClose={() => setStatusTarget(null)} onConfirm={toggleStatus} />
      <DepartmentDetailsDialog
        department={detailsTarget}
        onClose={() => setDetailsTarget(null)}
        onEdit={() => { setEditTarget(detailsTarget); setDetailsTarget(null); }}
        onViewUsers={() => navigate(`/management/users?department=${encodeURIComponent(detailsTarget.name)}`)}
      />
    </div>
  );
}
