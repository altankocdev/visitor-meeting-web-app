import { apiClient, unwrapApiResponse } from "../api/client";

export const organizationRepository = {
  async company(companyId) {
    const response = await apiClient.get(`/companies/${companyId}`);
    return unwrapApiResponse(response);
  },
  async updateCompany(companyId, data) {
    const response = await apiClient.put(`/companies/${companyId}`, data);
    return unwrapApiResponse(response);
  },
  async departments(companyId, params = {}) {
    const response = await apiClient.get(`/companies/${companyId}/departments`, { params });
    return unwrapApiResponse(response);
  },
  async createDepartment(companyId, data) {
    const response = await apiClient.post(`/companies/${companyId}/departments`, data);
    return unwrapApiResponse(response);
  },
  async archiveDepartment(companyId, departmentId) {
    return unwrapApiResponse(await apiClient.patch(`/companies/${companyId}/departments/${departmentId}/deactivate`));
  },
  async roles(companyId, params = {}) {
    const response = await apiClient.get("/roles", { params: { companyId, ...params } });
    return unwrapApiResponse(response);
  },
  async createRole(companyId, data) {
    const response = await apiClient.post("/roles", data, { params: { companyId } });
    return unwrapApiResponse(response);
  },
  async archiveRole(companyId, roleId) {
    return unwrapApiResponse(await apiClient.patch(`/roles/${roleId}/deactivate`, null, { params: { companyId } }));
  },
  async jobTitles(params = {}) {
    const response = await apiClient.get("/job-titles", { params });
    return unwrapApiResponse(response);
  },
  async createJobTitle(data) {
    const response = await apiClient.post("/job-titles", data);
    return unwrapApiResponse(response);
  },
  async archiveJobTitle(jobTitleId) {
    return unwrapApiResponse(await apiClient.patch(`/job-titles/${jobTitleId}/deactivate`));
  },
  async rooms(companyId, params = {}) {
    const response = await apiClient.get("/rooms", {
      params: { companyId, ...params },
    });
    return unwrapApiResponse(response);
  },
  async createRoom(companyId, data) {
    const response = await apiClient.post("/rooms", data, { params: { companyId } });
    return unwrapApiResponse(response);
  },
  async updateRoom(companyId, id, data) {
    const response = await apiClient.put(`/rooms/${id}`, data, { params: { companyId } });
    return unwrapApiResponse(response);
  },
  async activateRoom(companyId, id) {
    const response = await apiClient.patch(`/rooms/${id}/activate`, null, { params: { companyId } });
    return unwrapApiResponse(response);
  },
  async deactivateRoom(companyId, id) {
    const response = await apiClient.patch(`/rooms/${id}/deactivate`, null, { params: { companyId } });
    return unwrapApiResponse(response);
  },
  async archiveRoom(companyId, id) {
    const response = await apiClient.delete(`/rooms/${id}`, { params: { companyId } });
    return unwrapApiResponse(response);
  },
  async features(companyId, params = {}) {
    const response = await apiClient.get(`/companies/${companyId}/features`, { params });
    return unwrapApiResponse(response);
  },
  async createFeature(companyId, data) {
    const response = await apiClient.post(`/companies/${companyId}/features`, data);
    return unwrapApiResponse(response);
  },
  async updateFeature(companyId, id, data) {
    const response = await apiClient.put(`/companies/${companyId}/features/${id}`, data);
    return unwrapApiResponse(response);
  },
  async activateFeature(companyId, id) {
    const response = await apiClient.patch(`/companies/${companyId}/features/${id}/activate`);
    return unwrapApiResponse(response);
  },
  async deactivateFeature(companyId, id) {
    const response = await apiClient.patch(`/companies/${companyId}/features/${id}/deactivate`);
    return unwrapApiResponse(response);
  },
};

