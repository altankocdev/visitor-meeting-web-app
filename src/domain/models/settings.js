export const notifications = [
  { id: 1, recipientUserId: 1, title: "Yeni rezervasyon onayı bekliyor", message: "Ayşe Kaya tarafından Luna odası için oluşturulan Bütçe planlama rezervasyonu onayınızı bekliyor.", reservationId: 101, category: "RESERVATION", read: false, createdAt: "2026-07-27T15:18:00" },
  { id: 2, recipientUserId: 1, title: "Yeni kullanıcı hesabı oluşturuldu", message: "deniz.arslan kullanıcı hesabı başarıyla oluşturuldu ve ilk giriş bağlantısı gönderildi.", reservationId: null, category: "USER", read: false, createdAt: "2026-07-27T14:42:00" },
  { id: 3, recipientUserId: 1, title: "Toplantı odası pasifleştirildi", message: "Marmara toplantı odası bakım çalışması nedeniyle pasif duruma getirildi.", reservationId: null, category: "ROOM", read: true, createdAt: "2026-07-27T13:20:00" },
  { id: 4, recipientUserId: 1, title: "Rezervasyon iptal edildi", message: "Müşteri sunumu rezervasyonu organizatör tarafından iptal edildi.", reservationId: 95, category: "RESERVATION", read: true, createdAt: "2026-07-26T16:08:00" },
  { id: 5, recipientUserId: 1, title: "Rol yetkileri güncellendi", message: "İK rolünün raporlama yetkileri Yaşar Bilgi Müdürü tarafından güncellendi.", reservationId: null, category: "SECURITY", read: true, createdAt: "2026-07-26T12:35:00" },
];

export const companySettings = {
  name: "Yaşar Bilgi",
  slug: "yasar-bilgi",
  description: "Kurumsal teknoloji çözümleri ve bilgi yönetimi hizmetleri.",
  contactEmail: "iletisim@yasarbilgi.com",
  contactPhone: "+90 224 555 14 16",
  address: "Nilüfer, Bursa",
  industry: "Bilgi Teknolojileri",
};
