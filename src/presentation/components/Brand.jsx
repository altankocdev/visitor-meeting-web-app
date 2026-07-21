import { CalendarMonthRounded } from "@mui/icons-material";
import styles from "./Brand.module.css";

export function Brand({ compact = false }) {
  return <div className={styles.brand}><span className={styles.mark}><CalendarMonthRounded /></span>{!compact && <span className={styles.name}>meetly</span>}</div>;
}
