export function getApiErrorMessage(error, fallback = "İşlem tamamlanamadı.") {
  const body = error?.response?.data;

  if (body?.fieldErrors) {
    return Object.values(body.fieldErrors).join(" ");
  }

  return body?.message || error?.message || fallback;
}

