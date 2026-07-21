import { AccessTimeRounded, CheckCircleOutlineRounded, MeetingRoomOutlined } from "@mui/icons-material";
import styles from "./StatCards.module.css";

const cards = [
  { label: "Bugünkü toplantılar", value: "6", hint: "2 toplantı size ait", Icon: AccessTimeRounded, tone: "blue" },
  { label: "Müsait odalar", value: "5", hint: "8 odadan", Icon: MeetingRoomOutlined, tone: "cyan" },
  { label: "Onay bekleyen", value: "3", hint: "İncelemeniz gerekiyor", Icon: CheckCircleOutlineRounded, tone: "navy" },
];

export function StatCards() { return <div className={styles.stats}>{cards.map(({label,value,hint,Icon,tone}) => <article className={styles.card} key={label}><span className={`${styles.icon} ${styles[tone]}`}><Icon /></span><div className={styles.copy}><small>{label}</small><strong>{value}</strong><p>{hint}</p></div></article>)}</div>; }
