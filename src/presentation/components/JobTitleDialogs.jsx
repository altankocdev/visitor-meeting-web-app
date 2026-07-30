import { BadgeOutlined, CloseRounded, EditOutlined, GroupsOutlined, SaveOutlined, ToggleOnOutlined, VerifiedUserOutlined } from "@mui/icons-material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import styles from "./JobTitleDialogs.module.css";

function Shell({ children, icon: Icon, onClose, subtitle, title }) {
  return <div className={styles.backdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className={styles.dialog} role="dialog" aria-modal="true"><header><span><Icon /></span><div><small>UNVAN YÖNETİMİ</small><h2>{title}</h2><p>{subtitle}</p></div><button type="button" onClick={onClose}><CloseRounded /></button></header>{children}</section></div>;
}

export function JobTitleFormDialog({ jobTitle, onClose, onSave, open, roles = [] }) {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  useEffect(() => {
    if (open) reset({ name: jobTitle?.name || "", description: jobTitle?.description || "", defaultRoleIds: jobTitle?.defaultRoleIds.map(String) || [] });
  }, [jobTitle, open, reset]);
  const selected = watch("defaultRoleIds") || [];
  if (!open) return null;
  return <Shell icon={jobTitle ? EditOutlined : BadgeOutlined} onClose={onClose} title={jobTitle ? "Unvanı düzenle" : "Yeni unvan oluştur"} subtitle="Unvan bilgilerini ve kullanıcıya otomatik atanacak varsayılan rolleri belirleyin."><form className={styles.form} onSubmit={handleSubmit(onSave)}><label>Unvan adı<input autoFocus maxLength={100} placeholder="Örn. Yazılım Geliştirici" {...register("name", { required: "Unvan adı zorunludur." })} />{errors.name && <i>{errors.name.message}</i>}</label><label>Açıklama<textarea maxLength={500} rows={3} placeholder="Unvanın görev kapsamını açıklayın..." {...register("description")} /></label><fieldset><legend>Varsayılan roller <span>{selected.length} seçili</span></legend><p>Bu unvan kullanıcıya atandığında seçili roller varsayılan olarak önerilir.</p><div className={styles.roles}>{roles.filter((role) => role.active && role.name !== "Süper Admin").map((role) => <label key={role.id}><input type="checkbox" value={role.id} {...register("defaultRoleIds")} /><span><VerifiedUserOutlined /><b>{role.name}</b><small>{role.permissionIds.length} yetki</small></span></label>)}</div></fieldset><footer><button type="button" onClick={onClose}>Vazgeç</button><button className={styles.primary} type="submit"><SaveOutlined />{jobTitle ? "Değişiklikleri kaydet" : "Unvan oluştur"}</button></footer></form></Shell>;
}

export function JobTitleStatusDialog({ jobTitle, onClose, onConfirm }) {
  if (!jobTitle) return null;
  return <Shell icon={ToggleOnOutlined} onClose={onClose} title={jobTitle.active ? "Unvanı pasifleştir" : "Unvanı aktifleştir"} subtitle={`${jobTitle.name} unvanının kullanım durumunu değiştirin.`}><div className={styles.confirm}><div className={jobTitle.active ? styles.warning : styles.success}><ToggleOnOutlined /><p>{jobTitle.active ? "Unvan yeni kullanıcı atamalarında seçilemez. Mevcut kullanıcıların unvan bilgisi korunur." : "Unvan yeniden kullanıcı profillerinde ve atama işlemlerinde seçilebilir."}</p></div>{jobTitle.userCount > 0 && <p className={styles.count}><GroupsOutlined /><b>{jobTitle.userCount} kullanıcı</b> halen bu unvana sahip.</p>}</div><footer className={styles.footer}><button type="button" onClick={onClose}>Vazgeç</button><button className={jobTitle.active ? styles.danger : styles.primary} type="button" onClick={onConfirm}>{jobTitle.active ? "Pasifleştir" : "Aktifleştir"}</button></footer></Shell>;
}

export function JobTitleDetailsDialog({ jobTitle, onClose, onEdit, roles = [] }) {
  if (!jobTitle) return null;
  const assignedRoles = roles.filter((role) => jobTitle.defaultRoleIds.includes(role.id));
  return <Shell icon={BadgeOutlined} onClose={onClose} title={jobTitle.name} subtitle="Unvan bilgileri ve varsayılan erişim kapsamı."><div className={styles.details}><div className={styles.summary}><div><small>Durum</small><b className={jobTitle.active ? styles.active : styles.passive}>{jobTitle.active ? "Aktif" : "Pasif"}</b></div><div><small>Atanmış kullanıcı</small><strong>{jobTitle.userCount}</strong></div><div><small>Varsayılan rol</small><strong>{assignedRoles.length}</strong></div></div><section><small>AÇIKLAMA</small><p>{jobTitle.description || "Bu unvan için açıklama girilmemiş."}</p></section><section><small>VARSAYILAN ROLLER</small><div className={styles.roleList}>{assignedRoles.length ? assignedRoles.map((role) => <span key={role.id}><VerifiedUserOutlined />{role.name}<small>{role.permissionIds.length} yetki</small></span>) : <p>Varsayılan rol atanmamış.</p>}</div></section></div><footer className={styles.footer}><button type="button" onClick={onClose}>Kapat</button><button className={styles.primary} type="button" onClick={onEdit}><EditOutlined />Unvanı düzenle</button></footer></Shell>;
}
