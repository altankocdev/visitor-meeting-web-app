import { apiClient } from "../api/client";

export const reservationRepository = {
  list: (companyId) => apiClient.get("/reservations", { headers: { "X-Company-Id": companyId } }),
  create: (companyId, userId, data) => apiClient.post("/reservations", data, { headers: { "X-Company-Id": companyId, "X-User-Id": userId } }),
};
