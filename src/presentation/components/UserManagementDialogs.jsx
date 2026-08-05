import { BadgeOutlined, CloseRounded, DeleteForeverOutlined, EditOutlined, EmailOutlined, LockResetOutlined, PersonOffOutlined, PersonOutlineRounded, SaveOutlined, ToggleOnOutlined, VerifiedUserOutlined } from "@mui/icons-material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import styles from "./UserManagementDialogs.module.css";

function DialogShell({ children, eyebrow, icon: Icon, onClose, subtitle, title, wide = false }) {
  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`${styles.dialog} ${wide ? styles.wide : ""}`} role="dialog" aria-modal="true">
        <header><span className={styles.headerIcon}><Icon /></span><div><small>{eyebrow}</small><h2>{title}</h2><p>{subtitle}</p></div><button type="button" onClick={onClose} aria-label="Pencereyi kapat"><CloseRounded /></button></header>
        {children}
      </section>
    </div>
  );
}

export function EditUserDialog({ companyRoles, departments, jobTitles, onClose, onSave, user }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  useEffect(() => {
    if (user) reset({
      firstName: user.firstName, lastName: user.lastName, email: user.email, username: user.username,
      department: user.department, jobTitle: user.jobTitle, roles: user.roles,
    });
  }, [reset, user]);
  if (!user) return null;

  return (
    <DialogShell wide eyebrow="KULLANICI DÜZENLEME" icon={EditOutlined} onClose={onClose} title={`${user.firstName} ${user.lastName}`} subtitle="Kullanıcının profil ve organizasyon bilgilerini güncelleyin.">
      <form className={styles.form} onSubmit={handleSubmit(onSave)}>
        <div className={styles.grid}>
          <label>Ad<input {...register("firstName", { required: "Ad zorunludur." })} />{errors.firstName && <i>{errors.firstName.message}</i>}</label>
          <label>Soyad<input {...register("lastName", { required: "Soyad zorunludur." })} />{errors.lastName && <i>{errors.lastName.message}</i>}</label>
          <label className={styles.full}>Kurumsal e-posta<input type="email" {...register("email", { required: "E-posta zorunludur." })} /></label>
          <label>Kullanıcı adı<input disabled {...register("username")} /><em>Kullanıcı adı değiştirilemez.</em></label>
          <label>Departman<select {...register("department")}>{departments.map((item) => <option key={item.id}>{item.name}</option>)}</select></label>
          <label>Unvan<select {...register("jobTitle")}><option>Belirtilmedi</option>{jobTitles.map((item) => <option key={item.id}>{item.name}</option>)}</select></label>
          <fieldset className={styles.full}><legend>Atanmış roller</legend><div className={styles.roleOptions}>{companyRoles.map((role) => <label key={role.id}><input type="checkbox" value={role.name} {...register("roles", { required: true })} /><span>{role.name}</span></label>)}</div>{errors.roles && <i>En az bir rol seçmelisiniz.</i>}</fieldset>
        </div>
        <footer><button type="button" onClick={onClose}>Vazgeç</button><button className={styles.primary} type="submit"><SaveOutlined /> Değişiklikleri kaydet</button></footer>
      </form>
    </DialogShell>
  );
}

export function UserStatusDialog({ onClose, onConfirm, user }) {
  if (!user) return null;
  const willDeactivate = user.active;
  return (
    <DialogShell eyebrow="ERİŞİM YÖNETİMİ" icon={willDeactivate ? PersonOffOutlined : ToggleOnOutlined} onClose={onClose} title={willDeactivate ? "Kullanıcıyı pasifleştir" : "Kullanıcıyı aktifleştir"} subtitle={`${user.firstName} ${user.lastName} için sistem erişimini güncelleyin.`}>
      <div className={styles.confirmBody}>
        <div className={willDeactivate ? styles.warning : styles.success}>
          {willDeactivate ? <PersonOffOutlined /> : <ToggleOnOutlined />}
          <p>{willDeactivate ? "Kullanıcı sisteme giriş yapamaz ancak geçmiş kayıtları korunur." : "Kullanıcı yeniden sisteme giriş yapabilir ve atanmış yetkilerini kullanabilir."}</p>
        </div>
        <dl><div><dt>Kullanıcı</dt><dd>@{user.username}</dd></div><div><dt>Mevcut durum</dt><dd>{user.active ? "Aktif" : "Pasif"}</dd></div></dl>
      </div>
      <footer className={styles.footer}><button type="button" onClick={onClose}>Vazgeç</button><button className={willDeactivate ? styles.danger : styles.primary} type="button" onClick={onConfirm}>{willDeactivate ? "Pasifleştir" : "Aktifleştir"}</button></footer>
    </DialogShell>
  );
}

export function UserDeleteDialog({ deleting, onClose, onConfirm, user }) {
  if (!user) return null;
  return (
    <DialogShell eyebrow="KALICI SİLME" icon={DeleteForeverOutlined} onClose={onClose} title="Kullanıcıyı kalıcı olarak sil" subtitle={`${user.firstName} ${user.lastName} hesabını şirketten kaldırın.`}>
      <div className={styles.confirmBody}>
        <div className={styles.warning}><DeleteForeverOutlined /><p>Bu işlem geri alınamaz. Rezervasyon, katılımcı veya bildirim geçmişi bulunan kullanıcılar silinemez; bu kullanıcıları pasifleştirmelisiniz.</p></div>
        <dl><div><dt>Kullanıcı</dt><dd>@{user.username}</dd></div><div><dt>E-posta</dt><dd>{user.email}</dd></div></dl>
      </div>
      <footer className={styles.footer}><button type="button" disabled={deleting} onClick={onClose}>Vazgeç</button><button className={styles.danger} type="button" disabled={deleting} onClick={onConfirm}>{deleting ? "Siliniyor..." : "Kalıcı olarak sil"}</button></footer>
    </DialogShell>
  );
}

export function UserDetailsDialog({ canAssignRole, canDelete, canUpdate, onClose, onDelete, onEdit, onResetPassword, user }) {
  if (!user) return null;
  return (
    <DialogShell eyebrow="KULLANICI DETAYI" icon={PersonOutlineRounded} onClose={onClose} title={`${user.firstName} ${user.lastName}`} subtitle={`@${user.username} hesabının ayrıntıları ve yönetim işlemleri.`}>
      <div className={styles.details}>
        <div className={styles.identity}><span>{`${user.firstName[0]}${user.lastName[0]}`}</span><div><b>{user.firstName} {user.lastName}</b><small>{user.active ? "Aktif kullanıcı" : "Pasif kullanıcı"}</small></div></div>
        <div className={styles.infoGrid}>
          <div><EmailOutlined /><span><small>E-posta</small><b>{user.email}</b></span></div>
          <div><BadgeOutlined /><span><small>Departman / unvan</small><b>{user.department} · {user.jobTitle}</b></span></div>
          <div className={styles.infoFull}><VerifiedUserOutlined /><span><small>Atanmış roller</small><p>{user.roles.map((role) => <em key={role}>{role}</em>)}</p></span></div>
        </div>
        {user.mustChangePassword && <div className={styles.firstLogin}><LockResetOutlined />Kullanıcı ilk girişinde şifresini değiştirmelidir.</div>}
        <div className={styles.management}>
          {canUpdate && <button type="button" onClick={onEdit}><EditOutlined /><span><b>Bilgileri düzenle</b><small>Profil, departman ve unvanı değiştir</small></span></button>}
          {canAssignRole && <button type="button" onClick={onEdit}><VerifiedUserOutlined /><span><b>Rolleri yönet</b><small>Rol ekle veya mevcut rolü kaldır</small></span></button>}
          <button type="button" onClick={onResetPassword}><LockResetOutlined /><span><b>Geçici şifre oluştur</b><small>İlk giriş şifre değişimini yeniden etkinleştir</small></span></button>
        </div>
      </div>
          {canDelete && <button className={styles.deleteAction} type="button" onClick={onDelete}><DeleteForeverOutlined /><span><b>Kullanıcıyı sil</b><small>Hesabı şirketten kalıcı olarak kaldır</small></span></button>}
      <footer className={styles.footer}><button type="button" onClick={onClose}>Kapat</button></footer>
    </DialogShell>
  );
}
