import { CloseRounded, MeetingRoomOutlined, SaveOutlined, SettingsSuggestOutlined, ToggleOnOutlined } from "@mui/icons-material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import styles from "./RoomFeatureDialogs.module.css";

function Shell({ children, icon: Icon, onClose, subtitle, title, wide }) {
  return <div className={styles.backdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className={`${styles.dialog} ${wide ? styles.wide : ""}`} role="dialog" aria-modal="true"><header><span><Icon /></span><div><small>ODA VE ÖZELLİK YÖNETİMİ</small><h2>{title}</h2><p>{subtitle}</p></div><button type="button" onClick={onClose}><CloseRounded /></button></header>{children}</section></div>;
}

export function RoomFormDialog({ features, onClose, onSave, open, room }) {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  useEffect(() => { if (open) reset({ name: room?.name || "", location: room?.location || "", capacity: room?.capacity || 1, description: room?.description || "", featureIds: room?.featureIds.map(String) || [] }); }, [open, reset, room]);
  const selected = watch("featureIds") || [];
  if (!open) return null;
  return <Shell wide icon={MeetingRoomOutlined} onClose={onClose} title={room ? "Odayı düzenle" : "Yeni toplantı odası"} subtitle="Odanın konumunu, kapasitesini ve kullanılabilir donanımlarını tanımlayın."><form className={styles.form} onSubmit={handleSubmit(onSave)}><div className={styles.grid}><label>Oda adı<input maxLength={150} placeholder="Örn. Atlas" {...register("name", { required: "Oda adı zorunludur." })} />{errors.name && <i>{errors.name.message}</i>}</label><label>Konum<input maxLength={150} placeholder="Örn. 2. Kat · Doğu" {...register("location")} /></label><label>Kapasite<input type="number" min={1} {...register("capacity", { required: true, min: 1 })} /></label><label className={styles.full}>Açıklama<textarea rows={3} maxLength={1000} {...register("description")} /></label><fieldset className={styles.full}><legend>Oda özellikleri <span>{selected.length} seçili</span></legend><div className={styles.features}>{features.filter((item) => item.active).map((feature) => <label key={feature.id}><input type="checkbox" value={feature.id} {...register("featureIds")} /><span><SettingsSuggestOutlined /><b>{feature.name}</b><small>{feature.description}</small></span></label>)}</div></fieldset></div><footer><button type="button" onClick={onClose}>Vazgeç</button><button className={styles.primary} type="submit"><SaveOutlined />{room ? "Değişiklikleri kaydet" : "Odayı oluştur"}</button></footer></form></Shell>;
}

export function FeatureFormDialog({ feature, onClose, onSave, open }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  useEffect(() => { if (open) reset({ name: feature?.name || "", description: feature?.description || "" }); }, [feature, open, reset]);
  if (!open) return null;
  return <Shell icon={SettingsSuggestOutlined} onClose={onClose} title={feature ? "Özelliği düzenle" : "Yeni oda özelliği"} subtitle="Birden fazla toplantı odasında kullanılabilecek özellik tanımlayın."><form className={styles.form} onSubmit={handleSubmit(onSave)}><div className={styles.single}><label>Özellik adı<input maxLength={100} placeholder="Örn. Video konferans" {...register("name", { required: "Özellik adı zorunludur." })} />{errors.name && <i>{errors.name.message}</i>}</label><label>Açıklama<textarea rows={4} maxLength={500} {...register("description")} /></label></div><footer><button type="button" onClick={onClose}>Vazgeç</button><button className={styles.primary} type="submit"><SaveOutlined />{feature ? "Değişiklikleri kaydet" : "Özelliği oluştur"}</button></footer></form></Shell>;
}

export function ResourceStatusDialog({ item, onClose, onConfirm, type }) {
  if (!item) return null;
  const noun = type === "room" ? "oda" : "özellik";
  return <Shell icon={ToggleOnOutlined} onClose={onClose} title={`${noun === "oda" ? "Odayı" : "Özelliği"} ${item.active ? "pasifleştir" : "aktifleştir"}`} subtitle={`${item.name} için kullanım durumunu değiştirin.`}><div className={styles.confirm}><div className={item.active ? styles.warning : styles.success}><ToggleOnOutlined /><p>{item.active ? `${noun === "oda" ? "Oda rezervasyona" : "Özellik yeni oda atamalarına"} kapatılır; geçmiş kayıtlar korunur.` : `${noun === "oda" ? "Oda yeniden rezervasyona" : "Özellik yeniden oda atamalarına"} açılır.`}</p></div></div><footer><button type="button" onClick={onClose}>Vazgeç</button><button className={item.active ? styles.danger : styles.primary} type="button" onClick={onConfirm}>{item.active ? "Pasifleştir" : "Aktifleştir"}</button></footer></Shell>;
}
