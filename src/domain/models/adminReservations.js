export const adminReservations = [
  { id: 101, title: "Bütçe planlama", description: "Üçüncü çeyrek bütçe kalemlerinin değerlendirilmesi.", startTime: "2026-07-28T10:00:00", endTime: "2026-07-28T11:30:00", room: { id: 2, name: "Luna", location: "3. Kat · Batı", capacity: 6 }, organizer: { id: 1, fullName: "Ayşe Kaya", email: "ayse.kaya@yasarbilgi.com" }, participants: [{ id: 2, fullName: "Mert Demir", email: "mert.demir@yasarbilgi.com" }, { id: 3, fullName: "Selin Aksoy", email: "selin.aksoy@yasarbilgi.com" }], capacityWarning: false, status: "PENDING_APPROVAL", approvalDeadline: "2026-07-27T18:00:00", active: true },
  { id: 102, title: "Haftalık ekip toplantısı", description: "Sprint durumu ve haftalık iş planı.", startTime: "2026-07-29T11:00:00", endTime: "2026-07-29T12:00:00", room: { id: 1, name: "Atlas", location: "2. Kat · Doğu", capacity: 12 }, organizer: { id: 2, fullName: "Mert Demir", email: "mert.demir@yasarbilgi.com" }, participants: [{ id: 4, fullName: "Emre Yıldız", email: "emre.yildiz@yasarbilgi.com" }], capacityWarning: false, status: "ACTIVE", active: true },
  { id: 103, title: "Müşteri sunumu", description: "Yeni ürün yol haritası sunumu.", startTime: "2026-07-30T14:00:00", endTime: "2026-07-30T16:00:00", room: { id: 3, name: "Orion", location: "1. Kat · Kuzey", capacity: 20 }, organizer: { id: 3, fullName: "Selin Aksoy", email: "selin.aksoy@yasarbilgi.com" }, participants: [{ id: 1, fullName: "Ayşe Kaya", email: "ayse.kaya@yasarbilgi.com" }, { id: 2, fullName: "Mert Demir", email: "mert.demir@yasarbilgi.com" }], capacityWarning: false, status: "ACTIVE", active: true },
  { id: 104, title: "İşe alım değerlendirmesi", description: "Teknik görüşme sonuçlarının değerlendirilmesi.", startTime: "2026-07-27T13:00:00", endTime: "2026-07-27T14:00:00", room: { id: 4, name: "Pera", location: "2. Kat · Batı", capacity: 4 }, organizer: { id: 1, fullName: "Ayşe Kaya", email: "ayse.kaya@yasarbilgi.com" }, participants: [], capacityWarning: false, status: "COMPLETED", active: true },
  { id: 105, title: "Operasyon koordinasyonu", description: "Haftalık operasyon gündemi.", startTime: "2026-07-31T09:00:00", endTime: "2026-07-31T10:00:00", room: { id: 2, name: "Luna", location: "3. Kat · Batı", capacity: 6 }, organizer: { id: 4, fullName: "Emre Yıldız", email: "emre.yildiz@yasarbilgi.com" }, participants: [], capacityWarning: false, status: "REJECTED", rejectionReason: "Oda bakım çalışması nedeniyle kullanılamıyor.", active: true },
];

export const reservationStatusMeta = {
  PENDING_APPROVAL: { label: "Onay bekliyor", color: "#a86517", background: "#fff0dc" },
  ACTIVE: { label: "Onaylandı", color: "#14715c", background: "#e4f4ef" },
  REJECTED: { label: "Reddedildi", color: "#b23d4a", background: "#fbe8eb" },
  EXPIRED: { label: "Süresi doldu", color: "#687b84", background: "#edf2f4" },
  CANCELLED: { label: "İptal edildi", color: "#687b84", background: "#edf2f4" },
  COMPLETED: { label: "Tamamlandı", color: "#176b9d", background: "#e4f3fc" },
};
