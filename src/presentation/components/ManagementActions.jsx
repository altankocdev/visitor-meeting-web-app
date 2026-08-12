import { DeleteOutlineRounded, EditOutlined, MoreHorizRounded } from "@mui/icons-material";
import styles from "./ManagementActions.module.css";

export function ManagementActions({ children }) {
  return <div className={styles.actions}>{children}</div>;
}

export function EditAction({ label = "Düzenle", onClick }) {
  return <button className={styles.iconButton} type="button" title={label} aria-label={label} onClick={onClick}><EditOutlined /></button>;
}

export function StatusAction({ active, label, onClick }) {
  return <button className={styles.statusButton} type="button" title={label} aria-label={label} onClick={onClick}><span className={`${styles.switchTrack} ${active ? styles.switchOn : ""}`} aria-hidden="true"><i /></span></button>;
}

export function DeleteAction({ label = "Sil", onClick }) {
  return <button className={`${styles.iconButton} ${styles.deleteButton}`} type="button" title={label} aria-label={label} onClick={onClick}><DeleteOutlineRounded /></button>;
}

export function DetailsAction({ label = "Detayları görüntüle", onClick }) {
  return <button className={styles.iconButton} type="button" title={label} aria-label={label} onClick={onClick}><MoreHorizRounded /></button>;
}
