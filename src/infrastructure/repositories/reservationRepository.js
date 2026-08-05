import { apiClient, unwrapApiResponse } from "../api/client";

function createIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
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
