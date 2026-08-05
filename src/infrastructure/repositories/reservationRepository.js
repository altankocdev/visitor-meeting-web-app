import { apiClient, unwrapApiResponse } from "../api/client";

function createIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const reservationRepository = {
  async list(params = {}) {
    const response = await apiClient.get("/reservations", { params });
    return unwrapApiResponse(response);
  },

  async my(params = {}) {
    const response = await apiClient.get("/reservations/my", { params });
    return unwrapApiResponse(response);
  },

  async calendar(from, to, params = {}) {
    const response = await apiClient.get("/reservations/calendar", {
      params: { from, to, ...params },
    });
    return unwrapApiResponse(response);
  },

  async getById(id) {
    const response = await apiClient.get(`/reservations/${id}`);
    return unwrapApiResponse(response);
  },

  async create(data, idempotencyKey = createIdempotencyKey()) {
    const response = await apiClient.post("/reservations", data, {
      headers: { "Idempotency-Key": idempotencyKey },
    });
    return unwrapApiResponse(response);
  },

  async update(id, data) {
    const response = await apiClient.put(`/reservations/${id}`, data);
    return unwrapApiResponse(response);
  },

  async approve(id) {
    const response = await apiClient.patch(`/reservations/${id}/approve`);
    return unwrapApiResponse(response);
  },

  async reject(id, reason) {
    const response = await apiClient.patch(`/reservations/${id}/reject`, null, { params: { reason } });
    return unwrapApiResponse(response);
  },

  async cancel(id, reason) {
    const response = await apiClient.patch(`/reservations/${id}/cancel`, null, { params: { reason } });
    return unwrapApiResponse(response);
  },

  async addParticipant(id, userId) {
    const response = await apiClient.patch(`/reservations/${id}/participants/${userId}`);
    return unwrapApiResponse(response);
  },

  async removeParticipant(id, userId) {
    const response = await apiClient.delete(`/reservations/${id}/participants/${userId}`);
    return unwrapApiResponse(response);
  },
};
