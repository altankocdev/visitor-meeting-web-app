import { ApartmentRounded, CheckCircleOutlineRounded, EmailOutlined, LinkRounded, LocationOnOutlined, LockOutlined, PhoneOutlined, SaveOutlined, SettingsOutlined } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { hasPermission, permissions } from "../../domain/auth/permissions";
import { companySettings } from "../../domain/models/settings";
import { getApiErrorMessage } from "../../infrastructure/api/apiError";
import { organizationRepository } from "../../infrastructure/repositories/organizationRepository";
import { useAuth } from "../auth/AuthContext";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { AppNotice } from "../components/AppNotice";
import styles from "./CompanySettingsPage.module.css";

export function CompanySettingsPage() {
  const { session } = useAuth();
  const [saved, setSaved] = useState(false);
  const [apiError, setApiError] = useState("");
  const [company, setCompany] = useState(companySettings);
  const [policies, setPolicies] = useState({ approvalRequired: true, allowOverlap: false, visitorNotice: true, maxDuration: "240" });
  const canUpdate = hasPermission(session.permissions, permissions.COMPANY_UPDATE);
  const canManage = hasPermission(session.permissions, permissions.COMPANY_MANAGE_SETTINGS);
  const companyId = session.user.companyId;
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: companySettings });

  useEffect(() => {
    let active = true;
    if (!companyId) {
      setApiError("Şirket bilgilerine erişmek için şirket kapsamlı bir oturum gereklidir.");
      return () => { active = false; };
    }
    organizationRepository.company(companyId)
      .then((data) => {
        if (!active) return;
        setCompany(data);
        reset({ name: data.name ?? "", slug: data.slug ?? "", description: data.description ?? "", industry: data.industry ?? "", contactEmail: data.contactEmail ?? "", contactPhone: data.contactPhone ?? "", address: data.address ?? "" });
        setApiError("");
      })
      .catch((error) => active && setApiError(getApiErrorMessage(error, "Şirket bilgileri yüklenemedi.")));
    return () => { active = false; };
  }, [companyId, reset]);

  const saveProfile = async (values) => {
    setSaved(false);
    setApiError("");
    try {
      const updated = await organizationRepository.updateCompany(companyId, { ...values, taxNumber: company.taxNumber ?? null });
      setCompany(updated);
      reset({ name: updated.name ?? "", slug: updated.slug ?? "", description: updated.description ?? "", industry: updated.industry ?? "", contactEmail: updated.contactEmail ?? "", contactPhone: updated.contactPhone ?? "", address: updated.address ?? "" });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      setApiError(getApiErrorMessage(error, "Şirket bilgileri güncellenemedi."));
    }
  };

  return <div className={styles.shell}><AdminSidebar session={session} /><div className={styles.main}><AdminTopbar /><main className={styles.content}>
    <header className={styles.pageHead}><div><small>ŞİRKET YÖNETİMİ</small><h1>Şirket ayarları</h1><p>Kurumsal profil ve toplantı yönetimi tercihlerini güncelleyin.</p></div>{saved && <span className={styles.saved}><CheckCircleOutlineRounded />Değişiklikler kaydedildi</span>}</header>
    <AppNotice notice={apiError} onClose={() => setApiError("")} />
    <section className={styles.layout}><aside className={styles.companyCard}><span className={styles.logo}>YB</span><h2>Yaşar Bilgi</h2><p>Bilgi Teknolojileri</p><div><span><ApartmentRounded />Aktif şirket hesabı</span><span><LinkRounded />yasar-bilgi</span></div><small>Bu alandaki bilgiler şirketinizdeki tüm kullanıcılara ve kurumsal bildirimlere yansır.</small></aside>
      <div className={styles.sections}>
        <form className={styles.panel} onSubmit={handleSubmit(saveProfile)}><header><span><ApartmentRounded /></span><div><h2>Kurumsal profil</h2><p>Şirketin temel ve iletişim bilgileri.</p></div></header><div className={styles.formGrid}><label>Şirket adı<span><ApartmentRounded /><input disabled={!canUpdate} maxLength={150} {...register("name", { required: "Şirket adı zorunludur." })} /></span>{errors.name && <i>{errors.name.message}</i>}</label><label>Şirket adresi (slug)<span><LinkRounded /><input disabled={!canUpdate} maxLength={100} {...register("slug", { required: true, pattern: { value: /^[a-z0-9-]+$/, message: "Yalnızca küçük harf, rakam ve tire kullanılabilir." } })} /></span>{errors.slug && <i>{errors.slug.message}</i>}</label><label className={styles.full}>Şirket açıklaması<textarea disabled={!canUpdate} rows={3} maxLength={1000} {...register("description")} /></label><label>Sektör<input disabled={!canUpdate} maxLength={100} {...register("industry")} /></label><label>İletişim e-postası<span><EmailOutlined /><input disabled={!canUpdate} type="email" maxLength={150} {...register("contactEmail", { required: true })} /></span></label><label>Telefon<span><PhoneOutlined /><input disabled={!canUpdate} maxLength={20} {...register("contactPhone")} /></span></label><label className={styles.full}>Adres<span><LocationOnOutlined /><input disabled={!canUpdate} maxLength={500} {...register("address")} /></span></label></div>{canUpdate && <footer><p><LockOutlined />Yalnızca şirket bilgilerini güncelleme yetkisi olan kullanıcılar değiştirebilir.</p><button type="submit"><SaveOutlined />Değişiklikleri kaydet</button></footer>}</form>
        {canManage && <section className={styles.panel}><header><span><SettingsOutlined /></span><div><h2>Rezervasyon politikaları</h2><p>Şirket genelindeki varsayılan toplantı kuralları.</p></div></header><div className={styles.policyList}><label><span><b>Rezervasyon onayı gerekli</b><small>Yeni rezervasyonlar yetkili kişi tarafından onaylanır.</small></span><input type="checkbox" checked={policies.approvalRequired} onChange={() => setPolicies((value) => ({ ...value, approvalRequired: !value.approvalRequired }))} /><i /></label><label><span><b>Çakışan rezervasyonlara izin ver</b><small>Aynı oda ve saat aralığında birden fazla kayıt oluşturulabilir.</small></span><input type="checkbox" checked={policies.allowOverlap} onChange={() => setPolicies((value) => ({ ...value, allowOverlap: !value.allowOverlap }))} /><i /></label><label><span><b>Ziyaretçi bildirimi</b><small>Dış katılımcılı toplantılar güvenlik ekibine bildirilir.</small></span><input type="checkbox" checked={policies.visitorNotice} onChange={() => setPolicies((value) => ({ ...value, visitorNotice: !value.visitorNotice }))} /><i /></label><div className={styles.duration}><span><b>Maksimum toplantı süresi</b><small>Tek rezervasyon için izin verilen en uzun süre.</small></span><select value={policies.maxDuration} onChange={(event) => setPolicies((value) => ({ ...value, maxDuration: event.target.value }))}><option value="60">1 saat</option><option value="120">2 saat</option><option value="240">4 saat</option><option value="480">8 saat</option></select></div></div><footer><span /><button type="button" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}><SaveOutlined />Politikaları kaydet</button></footer></section>}
      </div>
    </section>
  </main></div></div>;
}
