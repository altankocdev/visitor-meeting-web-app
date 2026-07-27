import { permissions } from "./permissions";

// Backend bağlantısı kurulana kadar ilk giriş akışını temsil eden geçici oturum.
export const employeeSession = {
  mustChangePassword: true,
  mustCompleteProfile: true,
  user: {
    id: 42,
    username: "ece.yilmaz",
    email: "",
    firstName: "",
    lastName: "",
    jobTitle: null,
    initials: "EY",
    role: "CALISAN",
    roleLabel: "Çalışan",
    companyName: "Atlas Teknoloji",
  },
  permissions: Object.values(permissions),
};

export function completePasswordStep() {
  employeeSession.mustChangePassword = false;
}

export function completeEmployeeProfile(profile) {
  const firstName = profile.firstName.trim();
  const lastName = profile.lastName.trim();

  employeeSession.user = {
    ...employeeSession.user,
    firstName,
    lastName,
    email: profile.email.trim(),
    jobTitle: profile.jobTitle || null,
    initials: `${firstName.charAt(0)}${lastName.charAt(0)}`.toLocaleUpperCase("tr-TR"),
  };
  employeeSession.mustCompleteProfile = false;
}
