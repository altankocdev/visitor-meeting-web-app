const apiErrorMessages = {
  RESERVATION_CONFLICT: "Seçtiğiniz oda bu saat aralığında dolu. Lütfen farklı bir saat veya oda seçin.",
  INVALID_RESERVATION_TIME: "Rezervasyon başlangıç ve bitiş saatini kontrol edin.",
  RESERVATION_IN_PAST: "Geçmiş bir tarih veya saat için rezervasyon oluşturamazsınız.",
};

export function getApiErrorMessage(error, fallback = "İşlem tamamlanamadı.") {
  const body = error?.response?.data;
  const code = body?.code || body?.errorCode || body?.error;

  if (code && apiErrorMessages[code]) {
    return apiErrorMessages[code];
  }

  if (body?.fieldErrors) {
    return Object.values(body.fieldErrors).join(" ");
  }

  return body?.message || error?.message || fallback;
}