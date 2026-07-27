import { permissions } from "./permissions";

// Backend bağlantısı kurulduğunda /auth/me cevabından üretilecek geçici oturum.
export const employeeSession = Object.freeze({
  mustChangePassword: true,
  user: {
    id: 42,
    username: "ece.yilmaz",
    email: "ece.yilmaz@atlasteknoloji.com",
    initials: "EY",
    role: "CALISAN",
    roleLabel: "Çalışan",
    companyName: "Atlas Teknoloji",
  },
  permissions: Object.values(permissions),
});
