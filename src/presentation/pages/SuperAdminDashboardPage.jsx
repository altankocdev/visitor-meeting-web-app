import {
  AddRounded,
  ApartmentRounded,
  BusinessRounded,
  CloseRounded,
  GroupRounded,
  HourglassTopRounded,
} from "@mui/icons-material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { getApiErrorMessage } from "../../infrastructure/api/apiError";
import { platformRepository } from "../../infrastructure/repositories/platformRepository";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import styles from "./SuperAdminDashboardPage.module.css";

function initials(value = "") {
  return value.split(/\s+/).filter(Boolean).slice(0, 2)
    .map((part) => part[0]).join("").toLocaleUpperCase("tr-TR") || "Ş";
}

const emptyCompany = {
  name: "", slug: "", description: "", taxNumber: "", contactEmail: "",
  contactPhone: "", address: "", industry: "", ownerFirstName: "",
  ownerLastName: "", ownerEmail: "", ownerUsername: "", ownerPassword: "",
};

export function SuperAdminDashboardPage() {
  const [companies, setCompanies] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [companyTotal, setCompanyTotal] = useState(0);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [activeAdminTotal, setActiveAdminTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: emptyCompany,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [companyPage, pendingPage, adminPage, activeAdmins] = await Promise.all([
        platformRepository.listCompanies(),
        platformRepository.listPendingCompanies(),
        platformRepository.listAdmins(),
        platformRepository.countActiveAdmins(),
      ]);
      setCompanies(companyPage.content ?? []);
      setCompanyTotal(companyPage.totalElements ?? 0);
      setPendingTotal(pendingPage.totalElements ?? 0);
      setAdmins(adminPage.content ?? []);
      setActiveAdminTotal(activeAdmins ?? 0);
      setError("");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Platform verileri yüklenemedi."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const createCompany = async (values) => {
    setSaving(true);
    setError("");
    try {
      const company = await platformRepository.createCompany(values);
      await platformRepository.approveCompany(company.id);
      reset(emptyCompany);
      setDialogOpen(false);
      await loadData();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Şirket ve şirket sahibi oluşturulamadı."));
    } finally {
      setSaving(false);
    }
  };

  const activeCompanies = useMemo(
    () => companies.filter((company) => company.active).length,
    [companies],
  );
  const stats = [
    { label: "Toplam şirket", value: companyTotal, note: "Platforma kayıtlı şirket", icon: BusinessRounded, tone: "blue" },
    { label: "Aktif şirket", value: activeCompanies, note: "Listelenen aktif kayıt", icon: ApartmentRounded, tone: "green" },
    { label: "Onay bekleyen", value: pendingTotal, note: "Değerlendirme bekleyen şirket", icon: HourglassTopRounded, tone: "orange" },
    { label: "Aktif yönetici", value: activeAdminTotal, note: "Platform yöneticisi", icon: GroupRounded, tone: "gray" },
  ];

  return (
    <div className={styles.shell}>
      <AdminSidebar />
      <div className={styles.main}>
        <AdminTopbar />
        <main className={styles.content}>
          <header className={styles.heading}>
            <div>
              <span className={styles.eyebrow}>MEETLY · PLATFORM YÖNETİMİ</span>
              <h1>Platform genel bakışı</h1>
              <p>Şirketleri ve ilk şirket sahibi hesaplarını yönetin.</p>
            </div>
            <button className={styles.primaryAction} type="button" onClick={() => setDialogOpen(true)}>
              <AddRounded /> Yeni şirket oluştur
            </button>
          </header>
          {error ? <p className={styles.error} role="alert">{error}</p> : null}
          <section className={styles.stats} aria-label="Platform özeti">
            {stats.map(({ icon: Icon, label, note, tone, value }) => (
              <article className={styles.stat} key={label}>
                <span className={`${styles.statIcon} ${styles[tone]}`}><Icon /></span>
                <div><small>{label}</small><strong>{loading ? "—" : value}</strong><p>{note}</p></div>
              </article>
            ))}
          </section>
          <section className={styles.grid}>
            <article className={styles.panel}>
              <header className={styles.panelHeader}><div><h2>Şirketler</h2></div></header>
              <div className={styles.tableWrap}>
                <table>
                  <thead><tr><th>ŞİRKET</th><th>İLETİŞİM</th><th>SEKTÖR</th><th>DURUM</th></tr></thead>
                  <tbody>
                    {!loading && companies.length === 0 ? <tr><td colSpan="4">Henüz şirket kaydı bulunmuyor.</td></tr> : companies.map((company) => (
                      <tr key={company.id}>
                        <td><div className={styles.company}><span>{initials(company.name)}</span><div><b>{company.name}</b><small>{company.slug}</small></div></div></td>
                        <td>{company.contactEmail || "—"}</td><td>{company.industry || "—"}</td>
                        <td><span className={company.active ? styles.activeStatus : styles.pending}>{company.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
            <aside className={styles.activity}>
              <header className={styles.panelHeader}><div><h2>Platform yöneticileri</h2><p>Yetkili hesaplar.</p></div></header>
              <div className={styles.activityList}>
                {!loading && admins.length === 0 ? <p>Yönetici kaydı bulunmuyor.</p> : admins.map((admin) => (
                  <div className={styles.activityItem} key={admin.id}>
                    <span className={`${styles.activityIcon} ${styles.blue}`}><GroupRounded /></span>
                    <div><b>{admin.fullName}</b><p>{admin.email}</p><small>{admin.active ? "Aktif" : "Pasif"}</small></div>
                  </div>
                ))}
              </div>
            </aside>
          </section>
        </main>
      </div>

      {dialogOpen ? (
        <div className={styles.backdrop} role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !saving) setDialogOpen(false);
        }}>
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="company-dialog-title">
            <header>
              <div><small>PLATFORM YÖNETİMİ</small><h2 id="company-dialog-title">Şirket ve sahibi oluştur</h2><p>Şirket onaylanır; varsayılan roller ve özellikler otomatik hazırlanır.</p></div>
              <button type="button" disabled={saving} onClick={() => setDialogOpen(false)} aria-label="Kapat"><CloseRounded /></button>
            </header>
            <form onSubmit={handleSubmit(createCompany)}>
              <h3>Şirket bilgileri</h3>
              <div className={styles.formGrid}>
                <label>Şirket adı<input maxLength={150} {...register("name", { required: "Şirket adı zorunludur.", maxLength: { value: 150, message: "Şirket adı en fazla 150 karakter olabilir." } })} />{errors.name && <i>{errors.name.message}</i>}</label>
                <label>Şirket adresi (slug)<input maxLength={100} {...register("slug", { required: "Slug zorunludur.", maxLength: { value: 100, message: "Slug en fazla 100 karakter olabilir." }, pattern: { value: /^[a-z0-9-]+$/, message: "Küçük harf, rakam ve tire kullanın." } })} />{errors.slug && <i>{errors.slug.message}</i>}</label>
                <label>İletişim e-postası<input type="email" maxLength={150} {...register("contactEmail", { required: "E-posta zorunludur.", maxLength: { value: 150, message: "E-posta en fazla 150 karakter olabilir." } })} />{errors.contactEmail && <i>{errors.contactEmail.message}</i>}</label>
                <label>Telefon<input maxLength={20} {...register("contactPhone")} /></label>
                <label>Sektör<input maxLength={100} {...register("industry")} /></label>
                <label>Vergi numarası<input maxLength={20} {...register("taxNumber")} /></label>
                <label className={styles.full}>Adres<input maxLength={500} {...register("address")} /></label>
                <label className={styles.full}>Açıklama<textarea rows="2" maxLength={1000} {...register("description")} /></label>
              </div>
              <h3>İlk şirket sahibi</h3>
              <div className={styles.formGrid}>
                <label>Ad<input maxLength={100} {...register("ownerFirstName", { required: "Ad zorunludur.", maxLength: { value: 100, message: "Ad en fazla 100 karakter olabilir." } })} />{errors.ownerFirstName && <i>{errors.ownerFirstName.message}</i>}</label>
                <label>Soyad<input maxLength={100} {...register("ownerLastName", { required: "Soyad zorunludur.", maxLength: { value: 100, message: "Soyad en fazla 100 karakter olabilir." } })} />{errors.ownerLastName && <i>{errors.ownerLastName.message}</i>}</label>
                <label>Kullanıcı adı<input maxLength={50} {...register("ownerUsername", { required: "Kullanıcı adı zorunludur.", maxLength: { value: 50, message: "Kullanıcı adı en fazla 50 karakter olabilir." } })} />{errors.ownerUsername && <i>{errors.ownerUsername.message}</i>}</label>
                <label>E-posta<input type="email" maxLength={150} {...register("ownerEmail", { required: "E-posta zorunludur.", maxLength: { value: 150, message: "E-posta en fazla 150 karakter olabilir." } })} />{errors.ownerEmail && <i>{errors.ownerEmail.message}</i>}</label>
                <label className={styles.full}>Geçici şifre<input type="password" minLength={8} maxLength={100} {...register("ownerPassword", { required: "Şifre zorunludur.", minLength: { value: 8, message: "En az 8 karakter olmalıdır." }, maxLength: { value: 100, message: "Şifre en fazla 100 karakter olabilir." } })} />{errors.ownerPassword && <i>{errors.ownerPassword.message}</i>}</label>
              </div>
              <footer>
                <button type="button" disabled={saving} onClick={() => setDialogOpen(false)}>Vazgeç</button>
                <button className={styles.submit} type="submit" disabled={saving}>{saving ? "Oluşturuluyor…" : "Şirketi ve sahibini oluştur"}</button>
              </footer>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}
