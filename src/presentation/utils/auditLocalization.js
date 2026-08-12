export const auditActionLabels = {
  USER_CREATED: "Kullanıcı oluşturuldu", USER_UPDATED: "Kullanıcı güncellendi", USER_ACTIVATED: "Kullanıcı aktifleştirildi", USER_DEACTIVATED: "Kullanıcı pasifleştirildi", USER_DELETED: "Kullanıcı silindi", USER_BULK_IMPORTED: "Kullanıcılar Excel'den aktarıldı", USER_PROMOTED_TO_OWNER: "Kullanıcı şirket sahibi yapıldı",
  ROLE_ASSIGNED: "Rol kullanıcıya atandı", ROLE_REVOKED: "Rol kullanıcıdan kaldırıldı", OWNERSHIP_TRANSFERRED: "Şirket sahipliği devredildi", OWNERSHIP_FORCE_TRANSFERRED: "Şirket sahipliği yönetici tarafından devredildi", PASSWORD_RESET_FORCED: "Şifre değiştirme zorunluluğu etkinleştirildi",
  LOGIN_SUCCESS: "Giriş başarılı", LOGIN_FAILED: "Giriş başarısız", LOGOUT: "Oturum kapatıldı",
  RESERVATION_CREATED: "Rezervasyon oluşturuldu", RESERVATION_UPDATED: "Rezervasyon güncellendi", RESERVATION_APPROVED: "Rezervasyon onaylandı", RESERVATION_REJECTED: "Rezervasyon reddedildi", RESERVATION_AUTO_REJECTED: "Rezervasyon otomatik reddedildi", RESERVATION_CANCELLED: "Rezervasyon iptal edildi", RESERVATION_CANCEL_ALL: "Rezervasyon yönetici tarafından iptal edildi", RESERVATION_EXPIRED: "Rezervasyon süresi doldu",
  ROLE_CREATED: "Rol oluşturuldu", ROLE_UPDATED: "Rol güncellendi", ROLE_ACTIVATED: "Rol aktifleştirildi", ROLE_DEACTIVATED: "Rol pasifleştirildi", PERMISSION_ASSIGNED_TO_ROLE: "Yetki role eklendi", PERMISSION_REVOKED_FROM_ROLE: "Yetki rolden kaldırıldı",
  PERMISSION_OVERRIDE_CREATED: "Kullanıcıya özel yetki oluşturuldu", PERMISSION_OVERRIDE_UPDATED: "Kullanıcıya özel yetki güncellendi", PERMISSION_OVERRIDE_ACTIVATED: "Kullanıcıya özel yetki aktifleştirildi", PERMISSION_OVERRIDE_DEACTIVATED: "Kullanıcıya özel yetki pasifleştirildi",
  ROOM_CREATED: "Oda oluşturuldu", ROOM_UPDATED: "Oda güncellendi", ROOM_ACTIVATED: "Oda aktifleştirildi", ROOM_DEACTIVATED: "Oda pasifleştirildi",
  DEPARTMENT_CREATED: "Departman oluşturuldu", DEPARTMENT_UPDATED: "Departman güncellendi", DEPARTMENT_ACTIVATED: "Departman aktifleştirildi", DEPARTMENT_DEACTIVATED: "Departman pasifleştirildi",
  JOB_TITLE_CREATED: "Unvan oluşturuldu", JOB_TITLE_UPDATED: "Unvan güncellendi", JOB_TITLE_ACTIVATED: "Unvan aktifleştirildi", JOB_TITLE_DEACTIVATED: "Unvan pasifleştirildi",
  FEATURE_CREATED: "Özellik oluşturuldu", FEATURE_UPDATED: "Özellik güncellendi", FEATURE_ACTIVATED: "Özellik aktifleştirildi", FEATURE_DEACTIVATED: "Özellik pasifleştirildi", COMPANY_APPROVED: "Şirket onaylandı", COMPANY_REJECTED: "Şirket reddedildi",
};

export const auditTargetLabels = { USER: "Kullanıcı", USER_PERMISSION: "Kullanıcı yetkisi", RESERVATION: "Rezervasyon", ROLE: "Rol", ROOM: "Oda", DEPARTMENT: "Departman", JOB_TITLE: "Unvan", COMPANY: "Şirket", FEATURE: "Özellik", AUTH: "Oturum" };

const quotes = (text = "") => [...text.matchAll(/'([^']*)'/g)].map((match) => match[1]);

export function localizeAuditDetails(action, details) {
  if (!details) return `${auditActionLabels[action] || "İşlem"}.`;
  if (/[çğıöşüÇĞİÖŞÜ]/.test(details)) return details;
  const values = quotes(details);
  const subject = values[0] ? `“${values[0]}”` : "Kayıt";
  const templates = {
    USER_CREATED: `${subject} adlı kullanıcı oluşturuldu.`, USER_UPDATED: `${subject} adlı kullanıcı güncellendi.`, USER_ACTIVATED: `${subject} adlı kullanıcı aktifleştirildi.`, USER_DEACTIVATED: `${subject} adlı kullanıcı pasifleştirildi.`, USER_DELETED: `${subject} adlı kullanıcı kalıcı olarak silindi.`, USER_PROMOTED_TO_OWNER: `${subject} adlı kullanıcı şirket sahibi yapıldı.`,
    LOGIN_SUCCESS: `${subject} adlı kullanıcı giriş yaptı.`, LOGIN_FAILED: "Giriş denemesi başarısız oldu.", LOGOUT: `${subject} adlı kullanıcı çıkış yaptı.`,
    RESERVATION_CREATED: `${subject} rezervasyonu${values[1] ? ` “${values[1]}” odası için` : ""} oluşturuldu.`, RESERVATION_UPDATED: `${subject} rezervasyonu güncellendi.`, RESERVATION_APPROVED: `${subject} rezervasyonu onaylandı.`, RESERVATION_REJECTED: `${subject} rezervasyonu reddedildi.`, RESERVATION_CANCELLED: `${subject} rezervasyonu iptal edildi.`,
    ROOM_CREATED: `${subject} adlı oda oluşturuldu.`, ROOM_UPDATED: `${subject} adlı oda güncellendi.`, DEPARTMENT_CREATED: `${subject} adlı departman oluşturuldu.`, DEPARTMENT_UPDATED: `${subject} adlı departman güncellendi.`, JOB_TITLE_CREATED: `${subject} adlı unvan oluşturuldu.`, JOB_TITLE_UPDATED: `${subject} adlı unvan güncellendi.`, ROLE_CREATED: `${subject} adlı rol oluşturuldu.`, ROLE_UPDATED: `${subject} adlı rol güncellendi.`, FEATURE_CREATED: `${subject} adlı özellik oluşturuldu.`, FEATURE_UPDATED: `${subject} adlı özellik güncellendi.`,
  };
  return templates[action] || `${auditActionLabels[action] || "Sistem işlemi"}.`;
}
