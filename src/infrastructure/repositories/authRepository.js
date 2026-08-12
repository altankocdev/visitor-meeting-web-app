import { apiClient, unwrapApiResponse } from "../api/client";
import { tokenStorage } from "../auth/tokenStorage";
import { getAccessTokenClaims } from "../auth/jwtClaims";

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

  async loginSuperAdmin({ email, password, remember = true }) {
    const response = await apiClient.post("/platform/auth/login", {
      email,
      password,
    });
    const tokens = unwrapApiResponse(response);
    tokenStorage.save(tokens, remember);
    return tokens;
  },

  async me() {
    const claims = getAccessTokenClaims();
    const isPlatformAdmin = claims?.tokenType === "SUPER_ADMIN";
    const endpoint = isPlatformAdmin ? `/platform/admins/${claims.sub}` : "/auth/me";
    const response = await apiClient.get(endpoint);
    return { data: unwrapApiResponse(response), isPlatformAdmin };
  },

  async updateProfile(data) {
    const response = await apiClient.put("/auth/me", data);
    return unwrapApiResponse(response);
  },

  async profileJobTitles() {
    const response = await apiClient.get("/auth/me/job-titles");
    return unwrapApiResponse(response);
  },

  async changePassword(currentPassword, newPassword) {
    const response = await apiClient.post("/auth/change-password", { currentPassword, newPassword });
    const tokens = unwrapApiResponse(response);
    tokenStorage.update(tokens);
    return tokens;
  },

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
