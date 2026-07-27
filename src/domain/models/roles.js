export const permissionGroups = [
  {
    category: "USER_MANAGEMENT", label: "Kullanıcı yönetimi",
    permissions: [
      { id: 1, code: "USER_CREATE", name: "Kullanıcı oluşturma" },
      { id: 2, code: "USER_VIEW_ALL", name: "Tüm kullanıcıları görüntüleme" },
      { id: 3, code: "USER_UPDATE", name: "Kullanıcı düzenleme" },
      { id: 4, code: "USER_DEACTIVATE", name: "Kullanıcı pasifleştirme" },
      { id: 5, code: "USER_ASSIGN_ROLE", name: "Rol atama" },
      { id: 6, code: "USER_ASSIGN_JOB_TITLE", name: "Unvan atama" },
    ],
  },
  {
    category: "ROLE_MANAGEMENT", label: "Rol ve yetki yönetimi",
    permissions: [
      { id: 7, code: "ROLE_CREATE", name: "Rol oluşturma" },
      { id: 8, code: "ROLE_VIEW", name: "Rolleri görüntüleme" },
      { id: 9, code: "ROLE_UPDATE", name: "Rol düzenleme" },
      { id: 10, code: "ROLE_ASSIGN_PERMISSION", name: "Yetki atama" },
    ],
  },
  {
    category: "ROOM_MANAGEMENT", label: "Oda yönetimi",
    permissions: [
      { id: 11, code: "ROOM_CREATE", name: "Oda oluşturma" },
      { id: 12, code: "ROOM_VIEW", name: "Odaları görüntüleme" },
      { id: 13, code: "ROOM_UPDATE", name: "Oda düzenleme" },
      { id: 14, code: "ROOM_MANAGE_FEATURES", name: "Oda özelliklerini yönetme" },
    ],
  },
  {
    category: "RESERVATION_MANAGEMENT", label: "Rezervasyon yönetimi",
    permissions: [
      { id: 15, code: "RESERVATION_CREATE", name: "Rezervasyon oluşturma" },
      { id: 16, code: "RESERVATION_VIEW_ALL", name: "Tüm rezervasyonları görüntüleme" },
      { id: 17, code: "RESERVATION_UPDATE_ALL", name: "Tüm rezervasyonları düzenleme" },
      { id: 18, code: "RESERVATION_APPROVE", name: "Rezervasyon onaylama" },
      { id: 19, code: "RESERVATION_REJECT", name: "Rezervasyon reddetme" },
    ],
  },
  {
    category: "VISITOR_MANAGEMENT", label: "Ziyaretçi yönetimi",
    permissions: [
      { id: 20, code: "VISITOR_CREATE", name: "Ziyaretçi oluşturma" },
      { id: 21, code: "VISITOR_VIEW", name: "Ziyaretçileri görüntüleme" },
      { id: 22, code: "VISITOR_CHECK_IN", name: "Giriş işlemi" },
      { id: 23, code: "VISITOR_CHECK_OUT", name: "Çıkış işlemi" },
    ],
  },
  {
    category: "REPORTING", label: "Raporlama ve denetim",
    permissions: [
      { id: 24, code: "REPORT_VIEW_ROOM_USAGE", name: "Oda kullanım raporu" },
      { id: 25, code: "REPORT_VIEW_RESERVATION_STATS", name: "Rezervasyon raporu" },
      { id: 26, code: "REPORT_EXPORT_EXCEL", name: "Excel dışa aktarma" },
      { id: 27, code: "AUDIT_LOG_VIEW", name: "Denetim kayıtlarını görüntüleme" },
    ],
  },
];

const ids = (...values) => values;
export const roles = [
  { id: 1, name: "Süper Admin", description: "Şirket içindeki tüm yönetim ve operasyon yetkilerine sahiptir.", permissionIds: permissionGroups.flatMap((group) => group.permissions.map((item) => item.id)), userCount: 1, active: true, systemRole: true },
  { id: 2, name: "İK", description: "Personel, organizasyon, oda, rezervasyon ve ziyaretçi süreçlerini yönetir.", permissionIds: ids(1,2,3,4,5,6,8,11,12,13,14,15,16,17,18,19,20,21,24,25,26), userCount: 6, active: true, systemRole: true },
  { id: 3, name: "Tesis Yöneticisi", description: "Toplantı odaları, özellikler ve fiziksel kaynaklardan sorumludur.", permissionIds: ids(2,11,12,13,14,16,24,26), userCount: 3, active: true, systemRole: true },
  { id: 4, name: "Takım Lideri", description: "Ekip rezervasyonlarını ve ziyaretçi süreçlerini takip eder.", permissionIds: ids(2,12,15,16,20,21), userCount: 12, active: true, systemRole: true },
  { id: 5, name: "Departman Asistanı", description: "Departman adına toplantı ve ziyaretçi organizasyonlarını yürütür.", permissionIds: ids(2,12,15,16,17,20,21), userCount: 8, active: true, systemRole: true },
  { id: 6, name: "Güvenlik", description: "Ziyaretçi giriş, çıkış ve kart işlemlerini yönetir.", permissionIds: ids(12,21,22,23), userCount: 5, active: true, systemRole: true },
  { id: 7, name: "Çalışan", description: "Kendi rezervasyonlarını ve ziyaretçi kayıtlarını yönetir.", permissionIds: ids(12,15,20,21), userCount: 111, active: true, systemRole: true },
];
