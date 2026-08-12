import { apiClient, unwrapApiResponse } from "../api/client";

const params = (from, to) => ({ from: from || undefined, to: to || undefined });

export const reportRepository = {
  roomUsage: async (from, to) => unwrapApiResponse(await apiClient.get("/reports/room-usage", { params: params(from, to) })),
  cancellations: async (from, to) => unwrapApiResponse(await apiClient.get("/reports/cancellations", { params: params(from, to) })),
  userReservationStats: async (from, to) => unwrapApiResponse(await apiClient.get("/reports/user-reservation-stats", { params: params(from, to) })),
  async exportRoomUsage(from, to) {
    const response = await apiClient.get("/reports/room-usage/export", { params: params(from, to), responseType: "blob" });
    if (!(response.data instanceof Blob) || response.data.size === 0) {
      throw new Error("Oda raporu boş döndü.");
    }
    const disposition = response.headers["content-disposition"] ?? "";
    const filename = disposition.match(/filename="?([^";]+)"?/i)?.[1] ?? "oda-kullanim-raporu.xlsx";
    return { blob: response.data, filename };
  },
};
