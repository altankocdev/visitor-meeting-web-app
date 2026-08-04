import { apiClient, unwrapApiResponse } from "../api/client";

export const roomRepository = {
  async list(companyId, params = {}) {
    const response = await apiClient.get("/rooms", { params: { companyId, ...params } });
    return unwrapApiResponse(response);
  },
  async byActive(companyId, active = true, params = {}) {
    const response = await apiClient.get("/rooms/by-active", {
      params: { companyId, active, ...params },
    });
    return unwrapApiResponse(response);
  },
  async byCapacity(companyId, capacity, params = {}) {
    const response = await apiClient.get("/rooms/by-capacity", {
      params: { companyId, capacity, ...params },
    });
    return unwrapApiResponse(response);
  },
  async search(companyId, keyword = "", params = {}) {
    const response = await apiClient.get("/rooms/search", {
      params: { companyId, keyword: keyword || undefined, ...params },
    });
    return unwrapApiResponse(response);
  },
};
