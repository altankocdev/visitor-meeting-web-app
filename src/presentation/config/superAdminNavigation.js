import { ApartmentRounded, AssessmentOutlined, BadgeOutlined, DashboardRounded, GroupsOutlined, HistoryRounded, MeetingRoomOutlined, NotificationsNoneRounded, PeopleAltOutlined, SettingsOutlined, VerifiedUserOutlined } from "@mui/icons-material";

export const superAdminNavigation = [
  { label: "Genel bakış", icon: DashboardRounded, path: "/super-admin/dashboard" },
  { label: "Kullanıcılar", icon: PeopleAltOutlined, path: "/management/users" },
  { label: "Departmanlar", icon: ApartmentRounded },
  { label: "Unvanlar", icon: BadgeOutlined },
  { label: "Roller ve yetkiler", icon: VerifiedUserOutlined },
  { label: "Odalar ve özellikler", icon: MeetingRoomOutlined },
  { label: "Rezervasyonlar", icon: GroupsOutlined, badge: 3 },
  { label: "Raporlar", icon: AssessmentOutlined },
  { label: "Denetim kayıtları", icon: HistoryRounded },
  { label: "Bildirimler", icon: NotificationsNoneRounded },
  { label: "Şirket ayarları", icon: SettingsOutlined },
];
