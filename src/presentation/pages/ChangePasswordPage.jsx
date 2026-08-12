import {
  CheckCircleRounded,
  LockResetRounded,
  LogoutRounded,
  ShieldOutlined,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../infrastructure/api/apiError";
import { authRepository } from "../../infrastructure/repositories/authRepository";
import { useAuth } from "../auth/AuthContext";
import styles from "./ChangePasswordPage.module.css";

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const { refreshSession, session } = useAuth();
  const user = session?.user;
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  const onSubmit = async ({ currentPassword, newPassword }) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      await authRepository.changePassword(currentPassword, newPassword);
      const activeSession = await refreshSession();
      navigate(activeSession?.user?.owner ? "/management/dashboard" : "/dashboard", { replace: true });
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Şifre değiştirilemedi."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <button className={styles.logout} type="button" onClick={() => navigate("/login")}>
        <LogoutRounded />Oturumu kapat
      </button>

      <section className={styles.card}>
        <div className={styles.icon}><LockResetRounded /></div>
        <small className={styles.eyebrow}>İLK GİRİŞ GÜVENLİĞİ</small>
        <h1>Yeni şifrenizi oluşturun</h1>
        <p className={styles.lead}>
          Hesabınızı kullanmaya devam etmeden önce geçici şifrenizi değiştirmeniz gerekiyor.
        </p>

        <div className={styles.account}>
          <span>{user?.initials}</span>
          <div>
            <strong>@{user?.username}</strong>
            <small>{user?.email}</small>
          </div>
          <ShieldOutlined />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <label htmlFor="currentPassword">Geçici şifre</label>
          <div className={`${styles.input} ${errors.currentPassword ? styles.inputError : ""}`}>
            <ShieldOutlined />
            <input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              autoComplete="current-password"
              maxLength={100}
              placeholder="Size verilen geçici şifre"
              {...register("currentPassword", { required: "Geçici şifre zorunludur." })}
            />
            <button
              type="button"
              aria-label={showCurrentPassword ? "Geçici şifreyi gizle" : "Geçici şifreyi göster"}
              onClick={() => setShowCurrentPassword((value) => !value)}
            >
              {showCurrentPassword ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
            </button>
          </div>
          {errors.currentPassword && <span className={styles.error}>{errors.currentPassword.message}</span>}

          <label htmlFor="newPassword">Yeni şifre</label>
          <div className={`${styles.input} ${errors.newPassword ? styles.inputError : ""}`}>
            <ShieldOutlined />
            <input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              maxLength={100}
              placeholder="Yeni şifrenizi girin"
              {...register("newPassword", {
                required: "Yeni şifre zorunludur.",
                maxLength: { value: 100, message: "Şifre en fazla 100 karakter olabilir." },
                pattern: {
                  value: passwordPattern,
                  message: "Şifre bütün güvenlik koşullarını sağlamalıdır.",
                },
              })}
            />
            <button
              type="button"
              aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
            </button>
          </div>
          {errors.newPassword && <span className={styles.error}>{errors.newPassword.message}</span>}

          <label htmlFor="confirmPassword">Yeni şifre tekrar</label>
          <div className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ""}`}>
            <ShieldOutlined />
            <input
              id="confirmPassword"
              type={showConfirmation ? "text" : "password"}
              autoComplete="new-password"
              maxLength={100}
              placeholder="Yeni şifrenizi tekrar girin"
              {...register("confirmPassword", {
                required: "Şifre tekrarı zorunludur.",
                validate: (value) => value === newPassword || "Şifreler birbiriyle eşleşmiyor.",
              })}
            />
            <button
              type="button"
              aria-label={showConfirmation ? "Şifre tekrarını gizle" : "Şifre tekrarını göster"}
              onClick={() => setShowConfirmation((value) => !value)}
            >
              {showConfirmation ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
            </button>
          </div>
          {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword.message}</span>}

          <div className={styles.requirements}>
            <strong>Şifreniz şunları içermeli:</strong>
            <span><CheckCircleRounded />En az 8 karakter</span>
            <span><CheckCircleRounded />Büyük ve küçük harf</span>
            <span><CheckCircleRounded />En az bir rakam ve özel karakter</span>
          </div>

          {submitError && <span className={styles.error} role="alert">{submitError}</span>}
          <button className={styles.submit} type="submit" disabled={submitting}>
            {submitting ? "Şifre değiştiriliyor..." : "Şifreyi değiştir"} <span>→</span>
          </button>
        </form>

        <p className={styles.note}>
          Güvenliğiniz için yeni şifreniz geçici şifrenizden farklı olmalıdır.
        </p>
      </section>
    </main>
  );
}
