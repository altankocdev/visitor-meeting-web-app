import { apiClient, unwrapApiResponse } from "../api/client";

export const platformRepository = {
  async createCompany(payload) {
    return unwrapApiResponse(await apiClient.post("/companies", payload));
  },
  async approveCompany(companyId) {
    return unwrapApiResponse(await apiClient.patch(`/platform/companies/${companyId}/approve`));
  },
  async listCompanies(params = { page: 0, size: 20 }) {
    return unwrapApiResponse(await apiClient.get("/platform/companies", { params }));
  },
  async listPendingCompanies(params = { page: 0, size: 20 }) {
    return unwrapApiResponse(await apiClient.get("/platform/companies/pending", { params }));
  },
  async listAdmins(params = { page: 0, size: 20 }) {
    return unwrapApiResponse(await apiClient.get("/platform/admins", { params }));
  },
  async countActiveAdmins() {
    return unwrapApiResponse(await apiClient.get("/platform/admins/count/active"));
  },
};
