import { CalendarMonthRounded, EmailOutlined, LockOutlined, VisibilityOutlined } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  return <main className="login-page">
    <section className="login-visual">
      <div className="login-brand"><span><CalendarMonthRounded /></span>meetly</div>
      <div className="login-copy"><small>AKILLI ÇALIŞMA ALANLARI</small><h1>Doğru oda.<br/><em>Tam zamanında.</em></h1><p>Toplantılarınızı birkaç saniyede planlayın, ekibinizle aynı ritimde çalışın.</p></div>
    </section>
    <section className="login-form-panel">
      <form className="login-form" onSubmit={handleSubmit(() => navigate("/dashboard"))}>
        <small className="login-eyebrow">TEKRAR HOŞ GELDİNİZ</small><h2>Oturum açın</h2><p>Rezervasyonlarınızı yönetmek için hesabınıza devam edin.</p>
        <label>E-posta adresi</label><div className={errors.email ? "login-input error" : "login-input"}><EmailOutlined/><input placeholder="ornek@sirket.com" {...register("email", {required:true,pattern:/^[^\s@]+@[^\s@]+\.[^\s@]+$/})}/></div>
        <div className="login-label-row"><label>Şifre</label><button type="button">Şifremi unuttum</button></div><div className={errors.password ? "login-input error" : "login-input"}><LockOutlined/><input type="password" placeholder="En az 6 karakter" {...register("password", {required:true,minLength:6})}/><VisibilityOutlined/></div>
        <label className="login-remember"><input type="checkbox"/> Beni hatırla</label>
        {(errors.email || errors.password) && <span className="login-error">E-posta ve şifre bilgilerinizi kontrol edin.</span>}
        <button className="login-submit" type="submit"><span>Oturum aç</span><b>→</b></button>
        <p className="login-signup">Şirketiniz henüz Meetly'de değil mi? <button type="button">Şirket oluşturun</button></p>
      </form>
    </section>
  </main>;
}
