import { apiClient, unwrapApiResponse } from "../api/client";

const usersPath = (companyId) => `/companies/${companyId}/users`;

export const userRepository = {
  async list(companyId, params = {}) {
    const response = await apiClient.get(usersPath(companyId), { params });
    return unwrapApiResponse(response);
  },
  async directory(companyId, keyword = "", params = {}) {
    const response = await apiClient.get(`${usersPath(companyId)}/directory`, {
      params: { keyword: keyword || undefined, ...params },
    });
    return unwrapApiResponse(response);
  },
  async create(companyId, data) {
    const response = await apiClient.post(usersPath(companyId), data);
    return unwrapApiResponse(response);
  },
  async importUsers(companyId, file) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post(`${usersPath(companyId)}/import`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return unwrapApiResponse(response);
  },
  async update(companyId, userId, data) {
    const response = await apiClient.put(`${usersPath(companyId)}/${userId}`, data);
    return unwrapApiResponse(response);
  },
  async downloadImportTemplate(companyId) {
    const response = await apiClient.get(`${usersPath(companyId)}/import-template`, {
      responseType: "blob",
    });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = "toplu-kullanici-sablonu.xlsx";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  },
  activate: (companyId, userId) => apiClient.patch(`${usersPath(companyId)}/${userId}/activate`),
  deactivate: (companyId, userId) => apiClient.patch(`${usersPath(companyId)}/${userId}/deactivate`),
  deleteUser: (companyId, userId) => apiClient.delete(`${usersPath(companyId)}/${userId}`),
  forcePasswordReset: (companyId, userId) =>
    apiClient.patch(`${usersPath(companyId)}/${userId}/force-password-reset`),
};

