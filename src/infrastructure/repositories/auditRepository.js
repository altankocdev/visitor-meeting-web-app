import { apiClient, unwrapApiResponse } from "../api/client";

function endpointFor(isPlatformAdmin, exportFile = false) {
  const base = isPlatformAdmin ? "/platform/audit-logs" : "/audit-logs";
  return exportFile ? `${base}/export` : base;
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
    const disposition = response.headers["content-disposition"] ?? "";
    const filename = disposition.match(/filename="?([^";]+)"?/i)?.[1] ?? "audit-logs.xlsx";
    return { blob: response.data, filename };
  },
};
