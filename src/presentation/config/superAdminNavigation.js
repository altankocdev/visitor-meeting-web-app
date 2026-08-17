import { ApartmentRounded, AssessmentOutlined, BadgeOutlined, DashboardRounded, GroupsOutlined, HistoryRounded, MeetingRoomOutlined, NotificationsNoneRounded, PeopleAltOutlined, SettingsOutlined, VerifiedUserOutlined } from "@mui/icons-material";
import { permissions } from "../../domain/auth/permissions";

export const superAdminNavigation = [
  { label: "Genel bakış", icon: DashboardRounded, path: "/super-admin/dashboard" },
  { label: "Kullanıcılar", icon: PeopleAltOutlined, path: "/management/users", requiredAny: [permissions.USER_VIEW_ALL] },
  { label: "Departmanlar", icon: ApartmentRounded, path: "/management/departments", requiredAny: [permissions.DEPARTMENT_VIEW] },
  { label: "Unvanlar", icon: BadgeOutlined, path: "/management/job-titles", requiredAny: [permissions.JOB_TITLE_VIEW] },
  { label: "Roller ve yetkiler", icon: VerifiedUserOutlined, path: "/management/roles", requiredAny: [permissions.ROLE_VIEW] },
  { label: "Odalar ve özellikler", icon: MeetingRoomOutlined, path: "/management/rooms", requiredAny: [permissions.ROOM_VIEW] },
  { label: "Rezervasyonlar", icon: GroupsOutlined, path: "/management/reservations", requiredAny: [permissions.RESERVATION_VIEW_ALL] },
  { label: "Raporlar", icon: AssessmentOutlined, path: "/management/reports", requiredAny: [permissions.REPORT_VIEW_ROOM_USAGE, permissions.REPORT_VIEW_RESERVATION_STATS, permissions.REPORT_VIEW_CANCELLATION_STATS] },
  { label: "Denetim kayıtları", icon: HistoryRounded, path: "/management/audit-logs", requiredAny: [permissions.AUDIT_LOG_VIEW], platformAllowed: true },
  { label: "Bildirimler", icon: NotificationsNoneRounded, path: "/management/notifications", requiredAny: [permissions.NOTIFICATION_VIEW] },
  { label: "Şirket ayarları", icon: SettingsOutlined, path: "/management/company-settings", requiredAny: [permissions.COMPANY_VIEW] },
];
