export const roomFeatures = [
  { id: 1, name: "Projeksiyon", description: "HDMI bağlantılı projeksiyon cihazı.", active: true },
  { id: 2, name: "Beyaz tahta", description: "Yazılabilir geniş toplantı tahtası.", active: true },
  { id: 3, name: "Video konferans", description: "Kamera, mikrofon ve konferans sistemi.", active: true },
  { id: 4, name: "Akıllı ekran", description: "Kablosuz bağlantı destekli etkileşimli ekran.", active: true },
  { id: 5, name: "Klima", description: "Bağımsız iklimlendirme sistemi.", active: true },
  { id: 6, name: "Ses sistemi", description: "Toplantı ve sunumlar için ses sistemi.", active: true },
  { id: 7, name: "Sabit telefon", description: "Dahili hat bağlantısı.", active: false },
];

export const managedRooms = [
  { id: 1, name: "Atlas", location: "2. Kat · Doğu", capacity: 12, description: "Ekip toplantıları ve müşteri görüşmeleri için orta büyüklükte oda.", featureIds: [1,2,3,5], active: true },
  { id: 2, name: "Luna", location: "3. Kat · Batı", capacity: 6, description: "Küçük ekip toplantıları ve birebir görüşmeler için sessiz oda.", featureIds: [2,4,5], active: true },
  { id: 3, name: "Orion", location: "1. Kat · Kuzey", capacity: 20, description: "Sunumlar ve geniş katılımlı toplantılar için ana salon.", featureIds: [1,2,3,4,5,6], active: true },
  { id: 4, name: "Pera", location: "2. Kat · Batı", capacity: 4, description: "Kısa görüşmeler için kompakt toplantı odası.", featureIds: [2,5], active: true },
  { id: 5, name: "Marmara", location: "Zemin Kat", capacity: 10, description: "Ziyaretçi görüşmeleri için resepsiyona yakın toplantı odası.", featureIds: [1,3,5], active: false },
];
