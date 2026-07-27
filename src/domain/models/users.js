export const departments = [
  { id: 1, name: "İnsan Kaynakları" },
  { id: 2, name: "Bilgi Teknolojileri" },
  { id: 3, name: "Yönetim" },
  { id: 4, name: "Operasyon" },
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
