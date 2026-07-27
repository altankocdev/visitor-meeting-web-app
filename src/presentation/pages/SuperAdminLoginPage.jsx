import { AdminPanelSettingsRounded, LockOutlined, PersonOutlineRounded, VisibilityOffOutlined, VisibilityOutlined } from "@mui/icons-material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../infrastructure/api/apiError";
import { authRepository } from "../../infrastructure/repositories/authRepository";
import styles from "./SuperAdminLoginPage.module.css";

export function SuperAdminLoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const onSubmit = async (data) => {
    setLoginError("");
    setSubmitting(true);
    try {
      const session = await authRepository.login({
        companySlug: data.companySlug,
        identifier: data.username,
        password: data.password,
        remember: true,
      });
      navigate(session.mustChangePassword ? "/change-password" : "/super-admin/dashboard");
    } catch (error) {
      setLoginError(getApiErrorMessage(error, "Yönetici girişi başarısız."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <button className={styles.back} type="button" onClick={() => navigate("/login")}>← Kullanıcı girişine dön</button>
      <section className={styles.card}>
        <header className={styles.header}><span className={styles.icon}><AdminPanelSettingsRounded /></span><div><small>MEETLY YÖNETİM PANELİ</small><h1>Süper admin girişi</h1><p>Platform yönetim araçlarına erişmek için yönetici bilgilerinizle oturum açın.</p></div></header>
        <div className={styles.security}><span />Bu alan yalnızca yetkili sistem yöneticileri içindir.</div>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <label>Şirket kodu</label>
          <div className={`${styles.input} ${errors.companySlug ? styles.error : ""}`}><PersonOutlineRounded /><input autoComplete="organization" placeholder="ornek-sirket" {...register("companySlug", { required: "Şirket kodu zorunludur." })} /></div>
          {errors.companySlug && <span className={styles.errorText}>{errors.companySlug.message}</span>}
          <label>Kullanıcı adı</label>
          <div className={`${styles.input} ${errors.username ? styles.error : ""}`}><PersonOutlineRounded /><input autoComplete="username" placeholder="Yönetici kullanıcı adı" {...register("username", { required: "Kullanıcı adı zorunludur." })} /></div>
          {errors.username && <span className={styles.errorText}>{errors.username.message}</span>}
          <label>Şifre</label>
          <div className={`${styles.input} ${errors.password ? styles.error : ""}`}><LockOutlined /><input type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Yönetici şifresi" {...register("password", { required: "Şifre zorunludur." })} /><button className={styles.toggle} type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <VisibilityOffOutlined /> : <VisibilityOutlined />}</button></div>
          {errors.password && <span className={styles.errorText}>{errors.password.message}</span>}
          {loginError && <div className={styles.loginError}>{loginError}</div>}
          <button className={styles.submit} disabled={submitting}><span>{submitting ? "Giriş yapılıyor..." : "Yönetim paneline giriş yap"}</span><b>→</b></button>
        </form>
        <footer className={styles.footer}><AdminPanelSettingsRounded />Tüm yönetici girişleri güvenlik amacıyla kayıt altına alınır.</footer>
      </section>
    </main>
  );
}
