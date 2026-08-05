import {
  AccountCircleRounded,
  CalendarMonthRounded,
  DashboardRounded,
  MeetingRoomRounded,
  NotificationsRounded,
  PersonOutlineRounded,
} from "@mui/icons-material";
import { permissions } from "../../domain/auth/permissions";

export const employeeNavigation = [
  {
    label: "Genel bakış",
    path: "/dashboard",
    icon: DashboardRounded,
    permission: permissions.DASHBOARD_VIEW,
  },
  {
    label: "Profilim",
    path: "/profile",
    icon: AccountCircleRounded,
    permission: permissions.USER_VIEW,
  },
  {
    label: "Rezervasyonlarım",
    path: "/reservations",
    icon: CalendarMonthRounded,
    permission: permissions.RESERVATION_VIEW_OWN,
  },
  {
    label: "Oda uygunluğu",
    path: "/rooms",
    icon: MeetingRoomRounded,
    permission: permissions.ROOM_VIEW_AVAILABILITY,
  },
  {
    label: "Ziyaretçilerim",
    path: null,
    icon: PersonOutlineRounded,
    permission: permissions.VISITOR_VIEW,
  },
  {
    label: "Bildirimler",
    path: "/notifications",
    icon: NotificationsRounded,
    permission: permissions.NOTIFICATION_VIEW,
  },
];
