import { CircularProgress } from "@mui/material";
import styles from "./LoadingOverlay.module.css";

export function LoadingOverlay({ label = "Yükleniyor..." }) {
  return (
    <div className={styles.loadingOverlay} role="status" aria-live="polite">
      <div className={styles.loadingCard}>
        <CircularProgress size={44} thickness={4} />
        <span>{label}</span>
      </div>
    </div>
  );
}
