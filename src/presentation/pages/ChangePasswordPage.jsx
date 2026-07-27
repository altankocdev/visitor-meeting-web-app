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
import { employeeSession } from "../../domain/auth/employeeSession";
import styles from "./ChangePasswordPage.module.css";

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  const onSubmit = () => {
    // Backend bağlandığında şifre güncellendikten ve token yenilendikten sonra yönlendirilecek.
    navigate("/dashboard", { replace: true });
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
          <span>{employeeSession.user.initials}</span>
          <div>
            <strong>@{employeeSession.user.username}</strong>
            <small>{employeeSession.user.email}</small>
          </div>
          <ShieldOutlined />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <label htmlFor="newPassword">Yeni şifre</label>
          <div className={`${styles.input} ${errors.newPassword ? styles.inputError : ""}`}>
            <ShieldOutlined />
            <input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Yeni şifrenizi girin"
              {...register("newPassword", {
                required: "Yeni şifre zorunludur.",
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

          <button className={styles.submit} type="submit">
            Şifreyi değiştir ve devam et <span>→</span>
          </button>
        </form>

        <p className={styles.note}>
          Güvenliğiniz için yeni şifreniz geçici şifrenizden farklı olmalıdır.
        </p>
      </section>
    </main>
  );
}
