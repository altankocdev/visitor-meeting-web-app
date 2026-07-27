import { ApartmentRounded, CloseRounded, EditOutlined, GroupsOutlined, SaveOutlined, ToggleOnOutlined } from "@mui/icons-material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import styles from "./DepartmentDialogs.module.css";

function Shell({ children, icon: Icon, onClose, subtitle, title }) {
  return <div className={styles.backdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className={styles.dialog} role="dialog" aria-modal="true"><header><span><Icon /></span><div><small>DEPARTMAN YÖNETİMİ</small><h2>{title}</h2><p>{subtitle}</p></div><button onClick={onClose} type="button"><CloseRounded /></button></header>{children}</section></div>;
}

export function DepartmentFormDialog({ department, onClose, onSave, open }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  useEffect(() => {
    if (open) reset({ name: department?.name || "", description: department?.description || "" });
  }, [department, open, reset]);
  if (!open) return null;
  return <Shell icon={department ? EditOutlined : ApartmentRounded} onClose={onClose} title={department ? "Departmanı düzenle" : "Yeni departman oluştur"} subtitle="Departmanın görünen adını ve şirket içindeki sorumluluk alanını tanımlayın."><form className={styles.form} onSubmit={handleSubmit(onSave)}><label>Departman adı<input autoFocus maxLength={100} placeholder="Örn. İnsan Kaynakları" {...register("name", { required: "Departman adı zorunludur." })} />{errors.name && <i>{errors.name.message}</i>}</label><label>Açıklama <em>İsteğe bağlı</em><textarea maxLength={500} rows={4} placeholder="Departmanın görev ve sorumluluklarını açıklayın..." {...register("description")} /><small>En fazla 500 karakter</small></label><footer><button type="button" onClick={onClose}>Vazgeç</button><button className={styles.primary} type="submit"><SaveOutlined />{department ? "Değişiklikleri kaydet" : "Departman oluştur"}</button></footer></form></Shell>;
}

export function DepartmentStatusDialog({ department, onClose, onConfirm }) {
  if (!department) return null;
  return <Shell icon={ToggleOnOutlined} onClose={onClose} title={department.active ? "Departmanı pasifleştir" : "Departmanı aktifleştir"} subtitle={`${department.name} departmanının kullanım durumunu değiştirin.`}><div className={styles.confirm}><div className={department.active ? styles.warning : styles.success}><ToggleOnOutlined /><p>{department.active ? "Departman yeni kullanıcı atamalarında seçilemez. Mevcut kullanıcı kayıtları korunur." : "Departman yeniden kullanıcı ve organizasyon işlemlerinde seçilebilir."}</p></div>{department.active && department.userCount > 0 && <p className={styles.count}><GroupsOutlined /><b>{department.userCount} kullanıcı</b> halen bu departmana bağlı.</p>}</div><footer className={styles.footer}><button type="button" onClick={onClose}>Vazgeç</button><button className={department.active ? styles.danger : styles.primary} type="button" onClick={onConfirm}>{department.active ? "Pasifleştir" : "Aktifleştir"}</button></footer></Shell>;
}

export function DepartmentDetailsDialog({ department, onClose, onEdit, onViewUsers }) {
  if (!department) return null;
  return <Shell icon={ApartmentRounded} onClose={onClose} title={department.name} subtitle="Departman bilgileri ve organizasyon özeti."><div className={styles.details}><div className={styles.summary}><span><ApartmentRounded /></span><div><small>Departman durumu</small><b className={department.active ? styles.active : styles.passive}>{department.active ? "Aktif" : "Pasif"}</b></div><div><small>Toplam kullanıcı</small><strong>{department.userCount}</strong></div></div><section><small>AÇIKLAMA</small><p>{department.description || "Bu departman için açıklama girilmemiş."}</p></section><section><small>DEPARTMAN YÖNETİCİSİ</small><p>{department.manager || "Henüz bir yönetici atanmamış."}</p></section><button className={styles.userButton} type="button" onClick={onViewUsers}><GroupsOutlined />Departmana bağlı {department.userCount} kullanıcıyı görüntüle</button></div><footer className={styles.footer}><button type="button" onClick={onClose}>Kapat</button><button className={styles.primary} type="button" onClick={onEdit}><EditOutlined />Departmanı düzenle</button></footer></Shell>;
}
