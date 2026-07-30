import { apiClient, unwrapApiResponse } from "../api/client";

export const organizationRepository = {
  async departments(companyId, params = {}) {
    const response = await apiClient.get(`/companies/${companyId}/departments`, { params });
    return unwrapApiResponse(response);
  },
  async roles(companyId, params = {}) {
    const response = await apiClient.get("/roles", { params: { companyId, ...params } });
    return unwrapApiResponse(response);
  },
  async jobTitles(params = {}) {
    const response = await apiClient.get("/job-titles", { params });
    return unwrapApiResponse(response);
  },
};

