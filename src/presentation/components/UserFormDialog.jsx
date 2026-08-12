import { CloseRounded, LockOutlined, PersonAddAltRounded } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import styles from "./UserFormDialog.module.css";

export function UserFormDialog({ companyRoles, departments, jobTitles, open, onClose, onCreate }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { roleIds: ["6"] },
  });

  if (!open) return null;

  const submit = async (data) => {
    const created = await onCreate(data);
    if (!created) return;
    reset({ roleIds: ["6"] });
    onClose();
  };

  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="create-user-title">
        <header>
          <span className={styles.headerIcon}><PersonAddAltRounded /></span>
          <div><small>KULLANICI YÖNETİMİ</small><h2 id="create-user-title">Yeni kullanıcı oluştur</h2><p>Kullanıcıya ait temel bilgileri, departmanı ve rolü tanımlayın.</p></div>
          <button type="button" onClick={onClose} aria-label="Pencereyi kapat"><CloseRounded /></button>
        </header>

        <form onSubmit={handleSubmit(submit)}>
          <div className={styles.grid}>
            <label>Ad<input maxLength={100} placeholder="Adı" {...register("firstName", { required: "Ad zorunludur.", maxLength: { value: 100, message: "Ad en fazla 100 karakter olabilir." } })} />{errors.firstName && <i>{errors.firstName.message}</i>}</label>
            <label>Soyad<input maxLength={100} placeholder="Soyadı" {...register("lastName", { required: "Soyad zorunludur.", maxLength: { value: 100, message: "Soyad en fazla 100 karakter olabilir." } })} />{errors.lastName && <i>{errors.lastName.message}</i>}</label>
            <label className={styles.full}>Kurumsal e-posta<input type="email" maxLength={150} placeholder="kullanici@yasarbilgi.com" {...register("email", { required: "E-posta zorunludur.", maxLength: { value: 150, message: "E-posta en fazla 150 karakter olabilir." } })} />{errors.email && <i>{errors.email.message}</i>}</label>
            <label>Kullanıcı adı<input maxLength={50} placeholder="ad.soyad" {...register("username", { required: "Kullanıcı adı zorunludur.", maxLength: { value: 50, message: "Kullanıcı adı en fazla 50 karakter olabilir." } })} />{errors.username && <i>{errors.username.message}</i>}</label>
            <label>Geçici şifre<span className={styles.password}><LockOutlined /><input type="password" minLength={8} maxLength={100} placeholder="En az 8 karakter" {...register("password", { required: "Geçici şifre zorunludur.", minLength: { value: 8, message: "En az 8 karakter olmalıdır." }, maxLength: { value: 100, message: "Şifre en fazla 100 karakter olabilir." } })} /></span>{errors.password && <i>{errors.password.message}</i>}</label>
            <label>Departman<select {...register("departmentId")}><option value="">Departman seçin</option>{departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label>Unvan<select {...register("jobTitleId")}><option value="">Unvan seçin</option>{jobTitles.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <fieldset className={styles.full}><legend>Rol seçimi</legend><p>Kullanıcının sistemde yapabileceklerini belirler.</p><div className={styles.roles}>{companyRoles.map((role) => <label key={role.id}><input type="checkbox" value={role.id} {...register("roleIds", { required: true })} /><span>{role.name}</span></label>)}</div>{errors.roleIds && <i>En az bir rol seçmelisiniz.</i>}</fieldset>
          </div>
          <div className={styles.notice}><LockOutlined /><span>Kullanıcı ilk girişinde geçici şifresini değiştirmek zorunda olacak.</span></div>
          <footer><button type="button" onClick={onClose}>Vazgeç</button><button className={styles.submit} type="submit"><PersonAddAltRounded /> Kullanıcı oluştur</button></footer>
        </form>
      </section>
    </div>
  );
}
