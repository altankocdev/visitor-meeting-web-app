import { apiClient, unwrapApiResponse } from "../api/client";

export const notificationRepository = {
  async getNotifications(companyId, { page = 0, size = 20 } = {}) {
    const response = await apiClient.get(`/companies/${companyId}/notifications`, {
      params: { page, size },
    });

    return unwrapApiResponse(response);
  },

  async getUnreadCount(companyId) {
    const response = await apiClient.get(`/companies/${companyId}/notifications/unread-count`);
    return unwrapApiResponse(response);
  },

  async markAsRead(companyId, notificationId) {
    const response = await apiClient.patch(`/companies/${companyId}/notifications/${notificationId}/read`);
    return unwrapApiResponse(response);
  },
};