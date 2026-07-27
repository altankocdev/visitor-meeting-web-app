import { permissions } from "./permissions";

// Backend bağlantısı kurulduğunda bu nesne /auth/me cevabından üretilecek.
export const employeeSession = Object.freeze({
  user: {
    id: 42,
    firstName: "Ece",
    lastName: "Yılmaz",
    initials: "EY",
    role: "CALISAN",
    roleLabel: "Çalışan",
    companyName: "Atlas Teknoloji",
  },
  permissions: Object.values(permissions),
});

