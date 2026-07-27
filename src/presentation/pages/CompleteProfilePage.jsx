import {
  AlternateEmailRounded,
  BadgeOutlined,
  BusinessCenterOutlined,
  CheckCircleRounded,
  LogoutRounded,
  PersonOutlineRounded,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  completeEmployeeProfile,
  employeeSession,
} from "../../domain/auth/employeeSession";
import styles from "./CompleteProfilePage.module.css";

const jobTitles = [
  { id: "", name: "Pozisyon seçmek istemiyorum" },
  { id: "software-developer", name: "Yazılım Geliştirici" },
  { id: "product-specialist", name: "Ürün Uzmanı" },
  { id: "project-manager", name: "Proje Yöneticisi" },
  { id: "hr-specialist", name: "İnsan Kaynakları Uzmanı" },
];

export function CompleteProfilePage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: employeeSession.user.username,
      firstName: employeeSession.user.firstName,
      lastName: employeeSession.user.lastName,
      email: employeeSession.user.email,
      jobTitle: employeeSession.user.jobTitle?.id ?? "",
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
    navigate("/dashboard", { replace: true });
  };

  return (
    <main className={styles.page}>
      <button className={styles.logout} type="button" onClick={() => navigate("/login")}>
        <LogoutRounded />Oturumu kapat
      </button>

      <section className={styles.card}>
        <div className={styles.progress} aria-label="İlk giriş adımları">
          <span className={styles.completed}><CheckCircleRounded />Şifre</span>
          <i />
          <span className={styles.current}>2</span>
          <strong>Profil</strong>
        </div>

        <div className={styles.heading}>
          <span><BadgeOutlined /></span>
          <div>
            <small>SON BİR ADIM</small>
            <h1>Profilinizi tamamlayın</h1>
            <p>Rezervasyonlarda ve bildirimlerde kullanılacak kurumsal bilgilerinizi ekleyin.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.field}>
            <label htmlFor="username">Kullanıcı adı</label>
            <div className={`${styles.input} ${styles.readonly}`}>
              <AlternateEmailRounded />
              <input id="username" readOnly {...register("username")} />
              <small>Değiştirilemez</small>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="firstName">Ad</label>
              <div className={`${styles.input} ${errors.firstName ? styles.inputError : ""}`}>
                <PersonOutlineRounded />
                <input
                  id="firstName"
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
              <label htmlFor="lastName">Soyad</label>
              <div className={`${styles.input} ${errors.lastName ? styles.inputError : ""}`}>
                <PersonOutlineRounded />
                <input
                  id="lastName"
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
            <label htmlFor="email">Kurumsal e-posta adresi</label>
            <div className={`${styles.input} ${errors.email ? styles.inputError : ""}`}>
              <AlternateEmailRounded />
              <input
                id="email"
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
            <label htmlFor="jobTitle">Pozisyon <small>İsteğe bağlı</small></label>
            <div className={`${styles.input} ${styles.select}`}>
              <BusinessCenterOutlined />
              <select id="jobTitle" {...register("jobTitle")}>
                {jobTitles.map((jobTitle) => (
                  <option key={jobTitle.id || "empty"} value={jobTitle.id}>{jobTitle.name}</option>
                ))}
              </select>
            </div>
            <p className={styles.help}>Pozisyon seçenekleri daha sonra şirketinizin tanımladığı görevlerden gelecektir.</p>
          </div>

          <div className={styles.info}>
            <CheckCircleRounded />
            <p>Rolünüz, şirketiniz ve erişim yetkileriniz yöneticiniz tarafından atanır.</p>
          </div>

          <button className={styles.submit} type="submit">
            Profili kaydet ve devam et <span>→</span>
          </button>
        </form>
      </section>
    </main>
  );
}
