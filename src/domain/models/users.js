export const departments = [
  { id: 1, name: "İnsan Kaynakları" },
  { id: 2, name: "Bilgi Teknolojileri" },
  { id: 3, name: "Yönetim" },
  { id: 4, name: "Operasyon" },
];

export const departmentRecords = [
  { id: 1, name: "İnsan Kaynakları", description: "İşe alım, çalışan deneyimi ve kurum içi süreçlerin yönetimi.", userCount: 18, active: true, manager: "Ayşe Kaya" },
  { id: 2, name: "Bilgi Teknolojileri", description: "Yazılım, altyapı, bilgi güvenliği ve teknik destek operasyonları.", userCount: 42, active: true, manager: "Mert Demir" },
  { id: 3, name: "Yönetim", description: "Şirket stratejisi, idari koordinasyon ve yönetici destek süreçleri.", userCount: 9, active: true, manager: "Selin Aksoy" },
  { id: 4, name: "Operasyon", description: "Günlük operasyonların planlanması ve hizmet süreçlerinin takibi.", userCount: 31, active: true, manager: "Emre Yıldız" },
  { id: 5, name: "Satış ve Pazarlama", description: "Müşteri kazanımı, marka iletişimi ve satış faaliyetleri.", userCount: 27, active: true, manager: "Deniz Arslan" },
  { id: 6, name: "Arşiv ve Dokümantasyon", description: "Kurumsal belge ve arşiv süreçlerinin yönetimi.", userCount: 0, active: false, manager: null },
];

export const jobTitles = [
  { id: 1, name: "İK Uzmanı" },
  { id: 2, name: "Yazılım Geliştirici" },
  { id: 3, name: "Takım Lideri" },
  { id: 4, name: "Departman Asistanı" },
];

export const companyRoles = [
  { id: 1, name: "İK" },
  { id: 2, name: "Tesis Yöneticisi" },
  { id: 3, name: "Takım Lideri" },
  { id: 4, name: "Departman Asistanı" },
  { id: 5, name: "Güvenlik" },
  { id: 6, name: "Çalışan" },
];

export const users = [
  { id: 1, firstName: "Ayşe", lastName: "Kaya", username: "ayse.kaya", email: "ayse.kaya@yasarbilgi.com", department: "İnsan Kaynakları", jobTitle: "İK Uzmanı", roles: ["İK"], active: true, mustChangePassword: false },
  { id: 2, firstName: "Mert", lastName: "Demir", username: "mert.demir", email: "mert.demir@yasarbilgi.com", department: "Bilgi Teknolojileri", jobTitle: "Takım Lideri", roles: ["Takım Lideri"], active: true, mustChangePassword: false },
  { id: 3, firstName: "Selin", lastName: "Aksoy", username: "selin.aksoy", email: "selin.aksoy@yasarbilgi.com", department: "Yönetim", jobTitle: "Departman Asistanı", roles: ["Departman Asistanı"], active: true, mustChangePassword: false },
  { id: 4, firstName: "Emre", lastName: "Yıldız", username: "emre.yildiz", email: "emre.yildiz@yasarbilgi.com", department: "Operasyon", jobTitle: "Operasyon Uzmanı", roles: ["Çalışan"], active: true, mustChangePassword: true },
  { id: 5, firstName: "Deniz", lastName: "Arslan", username: "deniz.arslan", email: "deniz.arslan@yasarbilgi.com", department: "Bilgi Teknolojileri", jobTitle: "Yazılım Geliştirici", roles: ["Çalışan"], active: false, mustChangePassword: false },
];
