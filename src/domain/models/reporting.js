export const reportSummary = {
  reservations: 184,
  approvalRate: 91,
  roomUsageRate: 68,
  cancellations: 12,
};

export const weeklyReservationData = [
  { day: "Pzt", approved: 24, pending: 3, cancelled: 2 },
  { day: "Sal", approved: 31, pending: 2, cancelled: 1 },
  { day: "Çar", approved: 28, pending: 5, cancelled: 3 },
  { day: "Per", approved: 35, pending: 2, cancelled: 2 },
  { day: "Cum", approved: 30, pending: 4, cancelled: 1 },
  { day: "Cmt", approved: 10, pending: 1, cancelled: 2 },
  { day: "Paz", approved: 6, pending: 0, cancelled: 1 },
];

export const roomUsage = [
  { id: 1, name: "Orion", location: "1. Kat · Kuzey", reservations: 48, hours: 61, utilization: 82 },
  { id: 2, name: "Atlas", location: "2. Kat · Doğu", reservations: 43, hours: 52, utilization: 74 },
  { id: 3, name: "Luna", location: "3. Kat · Batı", reservations: 39, hours: 45, utilization: 65 },
  { id: 4, name: "Pera", location: "2. Kat · Batı", reservations: 31, hours: 34, utilization: 51 },
  { id: 5, name: "Marmara", location: "Zemin Kat", reservations: 23, hours: 27, utilization: 42 },
];

export const auditLogs = [
  { id: 1, actorUserId: 1, actor: "Yaşar Bilgi Müdürü", username: "admin", action: "USER_CREATED", targetType: "USER", targetId: 146, targetLabel: "deniz.arslan", details: "Yeni çalışan hesabı oluşturuldu ve Çalışan rolü atandı.", createdAt: "2026-07-27T15:42:00" },
  { id: 2, actorUserId: 2, actor: "Ayşe Kaya", username: "ayse.kaya", action: "RESERVATION_APPROVED", targetType: "RESERVATION", targetId: 101, targetLabel: "Bütçe planlama", details: "Luna odası için bekleyen rezervasyon onaylandı.", createdAt: "2026-07-27T15:18:00" },
  { id: 3, actorUserId: 1, actor: "Yaşar Bilgi Müdürü", username: "admin", action: "ROLE_UPDATED", targetType: "ROLE", targetId: 2, targetLabel: "İK", details: "İK rolüne REPORT_EXPORT_EXCEL yetkisi eklendi.", createdAt: "2026-07-27T14:55:00" },
  { id: 4, actorUserId: 1, actor: "Yaşar Bilgi Müdürü", username: "admin", action: "ROOM_CREATED", targetType: "ROOM", targetId: 5, targetLabel: "Marmara", details: "10 kişi kapasiteli yeni toplantı odası oluşturuldu.", createdAt: "2026-07-27T13:36:00" },
  { id: 5, actorUserId: null, actor: "Sistem", username: "system", action: "RESERVATION_EXPIRED", targetType: "RESERVATION", targetId: 98, targetLabel: "Satış değerlendirmesi", details: "Onay süresi dolan rezervasyon otomatik olarak kapatıldı.", createdAt: "2026-07-27T12:00:00" },
  { id: 6, actorUserId: 1, actor: "Yaşar Bilgi Müdürü", username: "admin", action: "DEPARTMENT_UPDATED", targetType: "DEPARTMENT", targetId: 2, targetLabel: "Bilgi Teknolojileri", details: "Departman açıklaması güncellendi.", createdAt: "2026-07-26T16:24:00" },
  { id: 7, actorUserId: 2, actor: "Ayşe Kaya", username: "ayse.kaya", action: "USER_DEACTIVATED", targetType: "USER", targetId: 132, targetLabel: "eski.kullanici", details: "Kullanıcı hesabı pasif duruma getirildi.", createdAt: "2026-07-26T11:08:00" },
];
