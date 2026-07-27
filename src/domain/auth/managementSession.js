import { permissions } from "./permissions";

export const managementSession = {
  user: {
    id: 1,
    firstName: "Yaşar Bilgi",
    lastName: "Müdürü",
    username: "admin",
    initials: "YB",
    role: "SUPER_ADMIN",
    roleLabel: "Süper admin",
    companyName: "Yaşar Bilgi",
  },
  permissions: Object.values(permissions),
};
