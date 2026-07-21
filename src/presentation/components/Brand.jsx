import { CalendarMonthRounded } from "@mui/icons-material";

export function Brand({ compact = false }) {
  return <div className="app-brand"><span className="app-brand__mark"><CalendarMonthRounded /></span>{!compact && <span>meetly</span>}</div>;
}
