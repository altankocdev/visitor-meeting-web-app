import { ApartmentRounded, AssessmentOutlined, BadgeOutlined, DashboardRounded, GroupsOutlined, HistoryRounded, MeetingRoomOutlined, NotificationsNoneRounded, PeopleAltOutlined, SettingsOutlined, VerifiedUserOutlined } from "@mui/icons-material";

export const superAdminNavigation = [
  { label: "Genel bakış", icon: DashboardRounded, path: "/super-admin/dashboard" },
  { label: "Kullanıcılar", icon: PeopleAltOutlined, path: "/management/users" },
  { label: "Departmanlar", icon: ApartmentRounded, path: "/management/departments" },
  { label: "Unvanlar", icon: BadgeOutlined, path: "/management/job-titles" },
  { label: "Roller ve yetkiler", icon: VerifiedUserOutlined, path: "/management/roles" },
  { label: "Odalar ve özellikler", icon: MeetingRoomOutlined, path: "/management/rooms" },
  { label: "Rezervasyonlar", icon: GroupsOutlined, badge: 3, path: "/management/reservations" },
  { label: "Raporlar", icon: AssessmentOutlined, path: "/management/reports" },
  { label: "Denetim kayıtları", icon: HistoryRounded, path: "/management/audit-logs" },
  { label: "Bildirimler", icon: NotificationsNoneRounded },
  { label: "Şirket ayarları", icon: SettingsOutlined },
];
