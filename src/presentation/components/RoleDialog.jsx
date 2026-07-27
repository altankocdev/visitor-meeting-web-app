import { CloseRounded, LockOutlined, SaveOutlined, VerifiedUserOutlined } from "@mui/icons-material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { permissionGroups } from "../../domain/models/roles";
import styles from "./RoleDialog.module.css";

export function RoleDialog({ onClose, onSave, open, role }) {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  useEffect(() => {
    if (open) reset({ name: role?.name || "", description: role?.description || "", permissionIds: role?.permissionIds.map(String) || [] });
  }, [open, reset, role]);
  const selected = watch("permissionIds") || [];
  if (!open) return null;

  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={styles.dialog} role="dialog" aria-modal="true">
        <header><span><VerifiedUserOutlined /></span><div><small>ROL VE YETKİ YÖNETİMİ</small><h2>{role ? "Rolü düzenle" : "Yeni rol oluştur"}</h2><p>Rol bilgilerini ve kullanıcıların erişebileceği işlemleri belirleyin.</p></div><button type="button" onClick={onClose}><CloseRounded /></button></header>
        <form onSubmit={handleSubmit(onSave)}>
          <div className={styles.meta}>
            <label>Rol adı<input disabled={role?.systemRole} maxLength={100} placeholder="Örn. Bölge Yöneticisi" {...register("name", { required: "Rol adı zorunludur." })} />{errors.name && <i>{errors.name.message}</i>}</label>
            <label>Açıklama<textarea maxLength={500} rows={3} placeholder="Rolün sorumluluk alanını açıklayın..." {...register("description")} /></label>
          </div>
          {role?.systemRole && <div className={styles.protected}><LockOutlined />Sistem rolünün adı değiştirilemez; yetki kapsamı düzenlenebilir.</div>}
          <div className={styles.permissionHead}><div><h3>Yetkiler</h3><p>Kategori bazında erişim izinlerini seçin.</p></div><span>{selected.length} yetki seçildi</span></div>
          <div className={styles.groups}>{permissionGroups.map((group) => (
            <fieldset key={group.category}>
              <legend>{group.label}</legend>
              {group.permissions.map((permission) => <label key={permission.id}><input type="checkbox" value={permission.id} {...register("permissionIds")} /><span><b>{permission.name}</b><small>{permission.code}</small></span></label>)}
            </fieldset>
          ))}</div>
          <footer><button type="button" onClick={onClose}>Vazgeç</button><button className={styles.primary} type="submit"><SaveOutlined />{role ? "Değişiklikleri kaydet" : "Rol oluştur"}</button></footer>
        </form>
      </section>
    </div>
  );
}

export function RoleDetailsDialog({ onClose, onEdit, role }) {
  if (!role) return null;
  return <div className={styles.backdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className={`${styles.dialog} ${styles.detailsDialog}`} role="dialog" aria-modal="true"><header><span><VerifiedUserOutlined /></span><div><small>ROL DETAYI</small><h2>{role.name}</h2><p>{role.description}</p></div><button type="button" onClick={onClose}><CloseRounded /></button></header><div className={styles.details}><div className={styles.summary}><div><small>Atanmış kullanıcı</small><strong>{role.userCount}</strong></div><div><small>Yetki sayısı</small><strong>{role.permissionIds.length}</strong></div><div><small>Rol türü</small><b>{role.systemRole ? "Sistem rolü" : "Özel rol"}</b></div></div>{permissionGroups.map((group) => { const items = group.permissions.filter((item) => role.permissionIds.includes(item.id)); return items.length ? <section key={group.category}><h3>{group.label}<span>{items.length}</span></h3><div>{items.map((item) => <p key={item.id}><i />{item.name}<small>{item.code}</small></p>)}</div></section> : null; })}</div><footer><button type="button" onClick={onClose}>Kapat</button><button className={styles.primary} type="button" onClick={onEdit}>Yetkileri düzenle</button></footer></section></div>;
}
