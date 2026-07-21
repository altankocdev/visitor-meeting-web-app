import { AdminPanelSettingsRounded, CalendarMonthRounded, EmailOutlined, LockOutlined, VisibilityOffOutlined, VisibilityOutlined } from "@mui/icons-material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { email: "", password: "", remember: false } });

  return <main className={styles.page}>
    <section className={styles.visual} aria-label="Modern toplantı odası">
      <div className={styles.brand}><span><CalendarMonthRounded /></span>meetly</div>
      <div className={styles.copy}><small>AKILLI ÇALIŞMA ALANLARI</small><h1>Doğru oda.<br/><em>Tam zamanında.</em></h1><p>Toplantılarınızı birkaç saniyede planlayın, ekibinizle aynı ritimde çalışın.</p></div>
    </section>
    <section className={styles.formPanel}>
      <button className={styles.adminLink} type="button" onClick={() => navigate("/super-admin/login")}><AdminPanelSettingsRounded />Sistem yöneticisi</button>
      <form className={styles.form} onSubmit={handleSubmit(() => navigate("/dashboard"))} noValidate>
        <small className={styles.eyebrow}>TEKRAR HOŞ GELDİNİZ</small><h2>Oturum açın</h2><p>Rezervasyonlarınızı yönetmek için hesabınıza devam edin.</p>
        <label htmlFor="email">E-posta adresi</label>
        <div className={`${styles.input} ${errors.email ? styles.error : ""}`}><EmailOutlined/><input id="email" type="email" autoComplete="email" placeholder="ornek@sirket.com" {...register("email", { required: "E-posta adresi zorunludur.", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Geçerli bir e-posta adresi girin." } })}/></div>
        {errors.email && <span className={styles.errorText}>{errors.email.message}</span>}
        <div className={styles.labelRow}><label htmlFor="password">Şifre</label><button type="button">Şifremi unuttum</button></div>
        <div className={`${styles.input} ${errors.password ? styles.error : ""}`}><LockOutlined/><input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="En az 6 karakter" {...register("password", { required: "Şifre zorunludur.", minLength: { value: 6, message: "Şifre en az 6 karakter olmalıdır." } })}/><button className={styles.passwordToggle} type="button" aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"} onClick={() => setShowPassword(value => !value)}>{showPassword ? <VisibilityOffOutlined/> : <VisibilityOutlined/>}</button></div>
        {errors.password && <span className={styles.errorText}>{errors.password.message}</span>}
        <label className={styles.remember}><input type="checkbox" {...register("remember")}/><span>Beni hatırla</span></label>
        <button className={styles.submit} type="submit"><span>Oturum aç</span><b>→</b></button>
        <p className={styles.signup}>Şirketiniz henüz Meetly&apos;de değil mi? <button type="button">Şirket oluşturun</button></p>
      </form>
    </section>
  </main>;
}
