const apiErrorMessages = {
  RESERVATION_CONFLICT: "Seçtiğiniz oda bu saat aralığında dolu. Lütfen farklı bir saat veya oda seçin.",
  INVALID_RESERVATION_TIME: "Rezervasyon başlangıç ve bitiş saatini kontrol edin.",
  RESERVATION_IN_PAST: "Geçmiş bir tarih veya saat için rezervasyon oluşturamazsınız.",
  COMPANY_NOT_FOUND: "Şirket kaydı bulunamadı.",
  COMPANY_ALREADY_EXISTS: "Bu şirket adresi veya vergi numarası zaten kullanılıyor.",
  USER_NOT_FOUND: "Kullanıcı bulunamadı.",
  USER_EMAIL_ALREADY_EXISTS: "Bu e-posta adresi zaten kullanılıyor.",
  USER_USERNAME_ALREADY_EXISTS: "Bu kullanıcı adı zaten kullanılıyor.",
  DEPARTMENT_NOT_FOUND: "Departman bulunamadı.",
  ROOM_NOT_FOUND: "Toplantı odası bulunamadı.",
  ACCESS_DENIED: "Bu işlemi yapmaya yetkiniz bulunmuyor.",
  UNAUTHORIZED: "Oturumunuz sona erdi. Lütfen tekrar giriş yapın.",
  VALIDATION_ERROR: "Girdiğiniz bilgileri kontrol edin.",
};

const englishMessagePatterns = [
  [/access is denied|forbidden|not authorized|permission/i, "Bu işlemi yapmaya yetkiniz bulunmuyor."],
  [/unauthorized|authentication.*required|full authentication/i, "Oturumunuz sona erdi. Lütfen tekrar giriş yapın."],
  [/company.*not found/i, "Şirket kaydı bulunamadı."],
  [/user.*not found/i, "Kullanıcı bulunamadı."],
  [/department.*not found/i, "Departman bulunamadı."],
  [/room.*not found/i, "Toplantı odası bulunamadı."],
  [/reservation.*not found/i, "Rezervasyon bulunamadı."],
  [/already exists|already in use|duplicate/i, "Bu bilgilerle daha önce bir kayıt oluşturulmuş."],
  [/idempotency-key.*valid uuid/i, "İstek anahtarı geçerli bir UUID olmalıdır."],
  [/network error|failed to fetch/i, "Sunucuya ulaşılamadı. İnternet bağlantınızı ve backend servisinin çalıştığını kontrol edin."],
  [/timeout/i, "İstek zaman aşımına uğradı. Lütfen tekrar deneyin."],
  [/internal server error|unexpected error/i, "Sunucuda beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."],
];

function translateMessage(message, fallback) {
  if (!message || typeof message !== "string") return fallback;
  const translated = englishMessagePatterns.find(([pattern]) => pattern.test(message));
  if (translated) return translated[1];
  const looksEnglish = /\b(the|is|are|was|were|must|should|could|failed|error|invalid|required|not|found|already|unable)\b/i.test(message);
  return looksEnglish ? fallback : message;
}

export function getApiErrorMessage(error, fallback = "İşlem tamamlanamadı. Lütfen tekrar deneyin.") {
  const body = error?.response?.data;
  const code = body?.code || body?.errorCode || body?.error;

  if (code && apiErrorMessages[code]) return apiErrorMessages[code];

  if (body?.fieldErrors) {
    const messages = Object.values(body.fieldErrors)
      .map((message) => translateMessage(message, "Geçersiz bir alan değeri girdiniz."));
    return messages.join(" ");
  }

  return translateMessage(body?.message || error?.message, fallback);
}
