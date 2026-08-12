import { AddRounded, ApartmentRounded, CheckCircleOutlineRounded, GroupsOutlined, SearchRounded } from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../infrastructure/api/apiError";
import { organizationRepository } from "../../infrastructure/repositories/organizationRepository";
import { useAuth } from "../auth/AuthContext";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { DeleteAction, DetailsAction, EditAction, ManagementActions } from "../components/ManagementActions";
import { AppNotice } from "../components/AppNotice";
import { DepartmentDetailsDialog, DepartmentFormDialog } from "../components/DepartmentDialogs";
import styles from "./DepartmentsPage.module.css";

export function DepartmentsPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const [filters, setFilters] = useState({ search: "" });
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [detailsTarget, setDetailsTarget] = useState(null);
  const companyId = session.user.companyId;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    organizationRepository.departments(companyId, { size: 200 })
      .then((page) => {
        if (!mounted) return;
        setDepartments((page.content ?? []).filter((item) => item.active));
        setApiError("");
      })
      .catch((error) => {
        if (mounted) setApiError(getApiErrorMessage(error, "Departmanlar yüklenemedi."));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [companyId]);

  const filtered = useMemo(() => departments.filter((department) => {
    const search = filters.search.trim().toLocaleLowerCase("tr-TR");
    return !search || `${department.name} ${department.description}`.toLocaleLowerCase("tr-TR").includes(search);
  }), [departments, filters]);

  const saveDepartment = async (data) => {
    if (editTarget) {
      setDepartments((current) => current.map((item) => item.id === editTarget.id ? { ...item, ...data } : item));
      setEditTarget(null);
    } else {
      setSaving(true);
      try {
        const created = await organizationRepository.createDepartment(companyId, data);
        setDepartments((current) => [created, ...current]);
        setFormOpen(false);
        setApiError("");
      } catch (error) {
        setApiError(getApiErrorMessage(error, "Departman oluşturulamadı."));
      } finally {
        setSaving(false);
      }
    }
  };

  const archiveDepartment = async (department) => {
    if (!window.confirm(`${department.name} departmanını silmek istediğinize emin misiniz? Geçmiş kayıtlar korunacaktır.`)) return;
    try {
      await organizationRepository.archiveDepartment(companyId, department.id);
      setDepartments((current) => current.filter((item) => item.id !== department.id));
    } catch (error) {
      setApiError(getApiErrorMessage(error, "Departman silinemedi."));
    }
  };

  return (
    <div className={styles.shell}>
      <AdminSidebar session={session} />
      <div className={styles.main}>
        <AdminTopbar />
        <main className={styles.content}>
          <AppNotice notice={apiError} onClose={() => setApiError("")} />
          <header className={styles.pageHead}>
            <div><small>ORGANİZASYON YÖNETİMİ</small><h1>Departmanlar</h1><p>Şirket organizasyonunu oluşturun ve çalışanların bağlı olduğu birimleri yönetin.</p></div>
            <button className={styles.createButton} type="button" onClick={() => setFormOpen(true)}><AddRounded /> Yeni departman</button>
          </header>

          <section className={styles.stats}>
            <article><span className={styles.blue}><ApartmentRounded /></span><div><small>Toplam departman</small><strong>{departments.length}</strong><p>Şirket organizasyonu</p></div></article>
            <article><span className={styles.green}><CheckCircleOutlineRounded /></span><div><small>Aktif departman</small><strong>{departments.filter((item) => item.active).length}</strong><p>Kullanıma açık birim</p></div></article>
            <article><span className={styles.orange}><GroupsOutlined /></span><div><small>Bağlı çalışan</small><strong>{departments.reduce((total, item) => total + item.userCount, 0)}</strong><p>Departmanı tanımlı kullanıcı</p></div></article>
          </section>

          <section className={styles.panel}>
            <header className={styles.panelHead}><div><h2>Departman listesi</h2><p>{loading ? "Departmanlar yükleniyor..." : `${filtered.length} departman gösteriliyor`}</p></div></header>
            <div className={styles.filters}>
              <label className={styles.search}><SearchRounded /><input value={filters.search} placeholder="Departman adı veya açıklama ara..." onChange={(event) => setFilters((value) => ({ ...value, search: event.target.value }))} /></label>
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
                    <td><ManagementActions><EditAction label="Departmanı düzenle" onClick={() => setEditTarget(department)} /><DeleteAction label="Departmanı sil" onClick={() => archiveDepartment(department)} /><DetailsAction label="Departman detayları" onClick={() => setDetailsTarget(department)} /></ManagementActions></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      <DepartmentFormDialog open={formOpen || Boolean(editTarget)} department={editTarget} onClose={() => { if (!saving) { setFormOpen(false); setEditTarget(null); } }} onSave={saveDepartment} />
      <DepartmentDetailsDialog
        department={detailsTarget}
        onClose={() => setDetailsTarget(null)}
        onEdit={() => { setEditTarget(detailsTarget); setDetailsTarget(null); }}
        onViewUsers={() => navigate(`/management/users?department=${encodeURIComponent(detailsTarget.name)}`)}
      />
    </div>
  );
}
