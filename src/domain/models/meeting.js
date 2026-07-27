export const reservationStatuses = {
  ACTIVE: { label: "Onaylandı", color: "#14856F" },
  PENDING_APPROVAL: { label: "Onay bekliyor", color: "#E3933B" },
  COMPLETED: { label: "Tamamlandı", color: "#70818B" },
};

export const rooms = [
  { id: 1, name: "Orion", location: "4. Kat · Kuzey", capacity: 8, features: ["Ekran", "Video konferans"], available: true },
  { id: 2, name: "Luna", location: "3. Kat · Doğu", capacity: 4, features: ["Beyaz tahta"], available: true },
  { id: 3, name: "Atlas", location: "2. Kat · Batı", capacity: 12, features: ["Ekran", "Video konferans"], available: false },
];

export const reservations = [
  { id: 1, title: "Ürün yol haritası", start: "2026-07-20T09:30:00", end: "2026-07-20T10:30:00", roomId: 1, room: "Orion", participants: 7, status: "ACTIVE", organizer: "Ece Yılmaz" },
  { id: 2, title: "Tasarım değerlendirme", start: "2026-07-20T13:00:00", end: "2026-07-20T14:00:00", roomId: 2, room: "Luna", participants: 4, status: "PENDING_APPROVAL", organizer: "Mert Kaya" },
  { id: 3, title: "Haftalık ekip toplantısı", start: "2026-07-21T11:00:00", end: "2026-07-21T12:00:00", roomId: 3, room: "Atlas", participants: 10, status: "ACTIVE", organizer: "Siz" },
  { id: 4, title: "Müşteri sunumu", start: "2026-07-22T14:30:00", end: "2026-07-22T16:00:00", roomId: 1, room: "Orion", participants: 6, status: "ACTIVE", organizer: "Selin Ak" },
  { id: 5, title: "Bütçe planlama", start: "2026-07-23T10:00:00", end: "2026-07-23T11:30:00", roomId: 2, room: "Luna", participants: 3, status: "PENDING_APPROVAL", organizer: "Siz" },
  { id: 6, title: "Satış değerlendirmesi", start: "2026-07-20T09:30:00", end: "2026-07-20T10:30:00", roomId: 2, room: "Luna", participants: 5, status: "ACTIVE", organizer: "Deniz Arslan" },
  { id: 7, title: "Teknik planlama", start: "2026-07-20T09:30:00", end: "2026-07-20T10:30:00", roomId: 3, room: "Atlas", participants: 8, status: "ACTIVE", organizer: "Burak Demir" },
];
