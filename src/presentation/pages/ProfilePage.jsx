import {
  AlternateEmailRounded,
  BadgeOutlined,
  BusinessCenterOutlined,
  CheckCircleRounded,
  PersonOutlineRounded,
  SaveRounded,
  ShieldOutlined,
} from "@mui/icons-material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  completeEmployeeProfile,
  employeeSession,
} from "../../domain/auth/employeeSession";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import styles from "./ProfilePage.module.css";

const jobTitles = [
  { id: "", name: "Pozisyon seçilmedi" },
  { id: "software-developer", name: "Yazılım Geliştirici" },
  { id: "product-specialist", name: "Ürün Uzmanı" },
  { id: "project-manager", name: "Proje Yöneticisi" },
  { id: "hr-specialist", name: "İnsan Kaynakları Uzmanı" },
];

export function ProfilePage() {
  const [saved, setSaved] = useState(false);
  const user = employeeSession.user;
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ")
    || `@${user.username}`;
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      jobTitle: user.jobTitle?.id ?? "",
    },
  });

  const onSubmit = (data) => {
    const selectedJobTitle = jobTitles.find((item) => item.id === data.jobTitle);

    completeEmployeeProfile({
      ...data,
      jobTitle: selectedJobTitle?.id
        ? { id: selectedJobTitle.id, name: selectedJobTitle.name }
        : null,
    });
    setSaved(true);
  };

  return (
    <div className={styles.shell}>
      <Sidebar session={employeeSession} />

      <div className={styles.main}>
        <Topbar user={employeeSession.user} />

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
                <div><dt>Pozisyon</dt><dd>{user.jobTitle?.name || "Belirtilmedi"}</dd></div>
                <div><dt>E-posta</dt><dd>{user.email || "Belirtilmedi"}</dd></div>
                <div><dt>Kullanıcı adı</dt><dd>@{user.username}</dd></div>
              </dl>

              <p className={styles.summaryNote}>
                Rol ve şirket bilgileri yalnızca yetkili yöneticiler tarafından değiştirilebilir.
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
                  <label htmlFor="profileJobTitle">Pozisyon <small>İsteğe bağlı</small></label>
                  <div className={`${styles.input} ${styles.select}`}>
                    <BusinessCenterOutlined />
                    <select id="profileJobTitle" {...register("jobTitle")}>
                      {jobTitles.map((jobTitle) => (
                        <option key={jobTitle.id || "empty"} value={jobTitle.id}>{jobTitle.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.actions}>
                  <p>Değişiklikler yalnızca profil bilgilerinizi etkiler.</p>
                  <button type="submit" disabled={!isDirty && !saved}>
                    <SaveRounded />Değişiklikleri kaydet
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
