import { apiClient, unwrapApiResponse } from "../api/client";

function endpointFor(isPlatformAdmin, exportFile = false) {
  const base = isPlatformAdmin ? "/platform/audit-logs" : "/audit-logs";
  return exportFile ? `${base}/export` : base;
}

function getDownloadFilename(disposition) {
  const encoded = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (encoded) return decodeURIComponent(encoded);
  return disposition.match(/filename="?([^";]+)"?/i)?.[1] ?? "denetim-kayitlari.xlsx";
}

export const auditRepository = {
  async list({ isPlatformAdmin = false, ...params } = {}) {
    return unwrapApiResponse(await apiClient.get(endpointFor(isPlatformAdmin), { params }));
  },

  async exportFile({ isPlatformAdmin = false, ...params } = {}) {
    const response = await apiClient.get(endpointFor(isPlatformAdmin, true), {
      params,
      responseType: "blob",
    });
    if (!(response.data instanceof Blob) || response.data.size === 0) {
      throw new Error("Denetim kaydı dosyası boş döndü.");
    }

    const disposition = response.headers["content-disposition"] ?? "";
    return { blob: response.data, filename: getDownloadFilename(disposition) };
  },
};
