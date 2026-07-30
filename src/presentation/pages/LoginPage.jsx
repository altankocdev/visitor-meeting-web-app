import {
  AdminPanelSettingsRounded,
  CalendarMonthRounded,
  LockOutlined,
  PersonOutlineRounded,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../infrastructure/api/apiError";
import { authRepository } from "../../infrastructure/repositories/authRepository";
import { useAuth } from "../auth/AuthContext";
import styles from "./LoginPage.module.css";

export function LoginPage() {
  const navigate = useNavigate();
  const { refreshSession } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      companySlug: "",
      loginIdentifier: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (values) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const session = await authRepository.login({
        companySlug: values.companySlug.trim().toLocaleLowerCase("tr-TR"),
        identifier: values.loginIdentifier.trim(),
        password: values.password,
        remember: values.remember,
      });
      const activeSession = await refreshSession();
      navigate(session.mustChangePassword
        ? "/change-password"
        : activeSession?.user?.owner ? "/management/dashboard" : "/dashboard");
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Oturum açılamadı. Bilgilerinizi kontrol edin."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.visual} aria-label="Modern toplantı odası">
        <div className={styles.brand}><span><CalendarMonthRounded /></span>meetly</div>
        <div className={styles.copy}>
          <small>AKILLI ÇALIŞMA ALANLARI</small>
          <h1>Doğru oda.<br /><em>Tam zamanında.</em></h1>
          <p>Toplantılarınızı birkaç saniyede planlayın, ekibinizle aynı ritimde çalışın.</p>
        </div>
      </section>

      <section className={styles.formPanel}>
        <button className={styles.adminLink} type="button" onClick={() => navigate("/super-admin/login")}>
          <AdminPanelSettingsRounded />Sistem yöneticisi
        </button>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <small className={styles.eyebrow}>TEKRAR HOŞ GELDİNİZ</small>
          <h2>Oturum açın</h2>
          <p>Kullanıcı adınız veya kurumsal e-posta adresinizle devam edin.</p>

          <label htmlFor="companySlug">Şirket kodu</label>
          <div className={`${styles.input} ${errors.companySlug ? styles.error : ""}`}>
            <PersonOutlineRounded />
            <input
              id="companySlug"
              type="text"
              autoComplete="organization"
              placeholder="ornek-sirket"
              {...register("companySlug", {
                required: "Şirket kodu zorunludur.",
                pattern: {
                  value: /^[a-z0-9-]+$/,
                  message: "Şirket kodu küçük harf, rakam ve tire içerebilir.",
                },
              })}
            />
          </div>
          {errors.companySlug && <span className={styles.errorText}>{errors.companySlug.message}</span>}

          <label htmlFor="loginIdentifier">Kullanıcı adı veya e-posta</label>
          <div className={`${styles.input} ${errors.loginIdentifier ? styles.error : ""}`}>
            <PersonOutlineRounded />
            <input
              id="loginIdentifier"
              type="text"
              autoComplete="username"
              placeholder="ece.yilmaz veya ece@sirket.com"
              {...register("loginIdentifier", {
                required: "Kullanıcı adı veya e-posta zorunludur.",
              })}
            />
          </div>
          {errors.loginIdentifier && <span className={styles.errorText}>{errors.loginIdentifier.message}</span>}

          <div className={styles.labelRow}>
            <label htmlFor="password">Şifre</label>
            <button type="button">Şifremi unuttum</button>
          </div>
          <div className={`${styles.input} ${errors.password ? styles.error : ""}`}>
            <LockOutlined />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Şifrenizi girin"
              {...register("password", { required: "Şifre zorunludur." })}
            />
            <button
              className={styles.passwordToggle}
              type="button"
              aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
            </button>
          </div>
          {errors.password && <span className={styles.errorText}>{errors.password.message}</span>}

          <label className={styles.remember}>
            <input type="checkbox" {...register("remember")} />
            <span>Beni hatırla</span>
          </label>

          {submitError && <span className={styles.errorText} role="alert">{submitError}</span>}
          <button className={styles.submit} type="submit" disabled={submitting}>
            <span>{submitting ? "Oturum açılıyor..." : "Oturum aç"}</span><b>→</b>
          </button>
          <p className={styles.signup}>Şirketiniz henüz Meetly&apos;de değil mi? <button type="button">Şirket oluşturun</button></p>
        </form>
      </section>
    </main>
  );
}
