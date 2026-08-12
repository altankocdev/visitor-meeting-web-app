import {
  AlternateEmailRounded,
  ApartmentRounded,
  BadgeOutlined,
  BusinessCenterOutlined,
  CheckCircleRounded,
  PersonOutlineRounded,
  SaveRounded,
  ShieldOutlined,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import styles from "./ProfilePage.module.css";
import { useAuth } from "../auth/AuthContext";
import { authRepository } from "../../infrastructure/repositories/authRepository";
import { getApiErrorMessage } from "../../infrastructure/api/apiError";

export function ProfilePage() {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [jobTitles, setJobTitles] = useState([]);
  const { session, refreshSession } = useAuth();
  const user = session.user;
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ")
    || `@${user.username}`;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      jobTitleId: user.jobTitle?.id ? String(user.jobTitle.id) : "",
    },
  });

  useEffect(() => {
    let active = true;
    authRepository.profileJobTitles()
      .then((items) => { if (active) setJobTitles(items ?? []); })
      .catch((error) => { if (active) setSaveError(getApiErrorMessage(error, "Pozisyonlar yüklenemedi.")); });
    return () => { active = false; };
  }, []);

  const onSubmit = async (data) => {
    setSaving(true);
    setSaved(false);
    setSaveError("");
    try {
      const updated = await authRepository.updateProfile({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        jobTitleId: data.jobTitleId ? Number(data.jobTitleId) : null,
      });
      await refreshSession();
      reset({
        username: updated.username,
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        jobTitleId: updated.jobTitleId ? String(updated.jobTitleId) : "",
      });
      setSaved(true);
    } catch (error) {
      setSaveError(getApiErrorMessage(error, "Profil bilgileri güncellenemedi."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.shell}>
      <Sidebar />

      <div className={styles.main}>
        <Topbar />

        <main className={styles.content}>
          <div className={styles.pageHead}>
            <div>
              <small>HESAP AYARLARI</small>
              <h1>Profilim</h1>
              <p>Kurumsal profil bilgilerinizi görüntüleyin ve güncel tutun.</p>
            </div>

            {saved && (
              <span className={styles.saved}><CheckCircleRounded />Değişiklikler kaydedildi</span>
            )}
            {saveError && <span className={styles.saveError} role="alert">{saveError}</span>}
          </div>

          <div className={styles.layout}>
            <aside className={styles.summary}>
              <span className={styles.largeAvatar}>{user.initials}</span>
              <h2>{displayName}</h2>
              <p>@{user.username}</p>

              <div className={styles.role}>
                <ShieldOutlined />
                <div>
                  <small>SİSTEM ROLÜ</small>
                  <strong>{user.roleLabel}</strong>
                </div>
              </div>

              <dl>
                <div><dt>Şirket</dt><dd>{user.companyName}</dd></div>
                <div><dt>Departman</dt><dd>{user.departmentName || "Belirtilmedi"}</dd></div>
                <div><dt>Pozisyon</dt><dd>{user.jobTitle?.name || "Belirtilmedi"}</dd></div>
                <div><dt>E-posta</dt><dd>{user.email || "Belirtilmedi"}</dd></div>
                <div><dt>Kullanıcı adı</dt><dd>@{user.username}</dd></div>
              </dl>

              <p className={styles.summaryNote}>
                Rol, şirket ve departman bilgileri yalnızca yetkili yöneticiler tarafından değiştirilebilir.
              </p>
            </aside>

            <section className={styles.formPanel}>
              <div className={styles.formHead}>
                <span><BadgeOutlined /></span>
                <div>
                  <h2>Kişisel bilgiler</h2>
                  <p>Rezervasyonlarda ve bildirimlerde kullanılacak bilgiler.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} noValidate onChange={() => saved && setSaved(false)}>
                <div className={styles.field}>
                  <label htmlFor="profileUsername">Kullanıcı adı</label>
                  <div className={`${styles.input} ${styles.readonly}`}>
                    <AlternateEmailRounded />
                    <input id="profileUsername" readOnly {...register("username")} />
                    <small>Değiştirilemez</small>
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label htmlFor="profileFirstName">Ad</label>
                    <div className={`${styles.input} ${errors.firstName ? styles.inputError : ""}`}>
                      <PersonOutlineRounded />
                      <input
                        id="profileFirstName"
                        autoComplete="given-name"
                        placeholder="Adınız"
                        {...register("firstName", {
                          required: "Ad zorunludur.",
                          maxLength: { value: 100, message: "Ad en fazla 100 karakter olabilir." },
                        })}
                      />
                    </div>
                    {errors.firstName && <span className={styles.error}>{errors.firstName.message}</span>}
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="profileLastName">Soyad</label>
                    <div className={`${styles.input} ${errors.lastName ? styles.inputError : ""}`}>
                      <PersonOutlineRounded />
                      <input
                        id="profileLastName"
                        autoComplete="family-name"
                        placeholder="Soyadınız"
                        {...register("lastName", {
                          required: "Soyad zorunludur.",
                          maxLength: { value: 100, message: "Soyad en fazla 100 karakter olabilir." },
                        })}
                      />
                    </div>
                    {errors.lastName && <span className={styles.error}>{errors.lastName.message}</span>}
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="profileEmail">Kurumsal e-posta</label>
                  <div className={`${styles.input} ${errors.email ? styles.inputError : ""}`}>
                    <AlternateEmailRounded />
                    <input
                      id="profileEmail"
                      type="email"
                      autoComplete="email"
                      placeholder="kullanici@sirket.com"
                      {...register("email", {
                        required: "E-posta adresi zorunludur.",
                        maxLength: { value: 150, message: "E-posta en fazla 150 karakter olabilir." },
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Geçerli bir e-posta adresi girin.",
                        },
                      })}
                    />
                  </div>
                  {errors.email && <span className={styles.error}>{errors.email.message}</span>}
                </div>

                <div className={styles.field}>
                  <label htmlFor="profileDepartment">Departman <small>Yönetici tarafından belirlenir</small></label>
                  <div className={`${styles.input} ${styles.readonly}`}>
                    <ApartmentRounded />
                    <input
                      id="profileDepartment"
                      readOnly
                      value={user.departmentName || "Departman atanmadı"}
                    />
                    <small>Değiştirilemez</small>
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="profileJobTitle">Pozisyon <small>İsteğe bağlı</small></label>
                  <div className={`${styles.input} ${styles.select}`}>
                    <BusinessCenterOutlined />
                    <select id="profileJobTitle" {...register("jobTitleId")}>
                      <option value="">Pozisyon seçilmedi</option>
                      {jobTitles.map((jobTitle) => <option key={jobTitle.id} value={jobTitle.id}>{jobTitle.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className={styles.actions}>
                  <p>Değişiklikler yalnızca profil bilgilerinizi etkiler.</p>
                  <button type="submit" disabled={!isDirty || saving}>
                    <SaveRounded />{saving ? "Kaydediliyor..." : "Değişiklikleri kaydet"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
