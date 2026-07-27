import { apiClient, unwrapApiResponse } from "../api/client";
import { tokenStorage } from "../auth/tokenStorage";

export const authRepository = {
  async login({ companySlug, identifier, password, remember = true }) {
    const response = await apiClient.post("/auth/login", {
      companySlug,
      email: identifier,
      password,
    });
    const tokens = unwrapApiResponse(response);
    tokenStorage.save(tokens, remember);
    return tokens;
  },

  changePassword: (currentPassword, newPassword) =>
    apiClient.post("/auth/change-password", { currentPassword, newPassword }),

  async logout() {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      if (refreshToken) {
        await apiClient.post("/auth/logout", { refreshToken });
      }
    } finally {
      tokenStorage.clear();
    }
  },
};

