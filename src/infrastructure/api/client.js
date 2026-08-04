import axios from "axios";
import { tokenStorage } from "../auth/tokenStorage";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

export const apiClient = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

let refreshPromise = null;

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = tokenStorage.getRefreshToken();
    const isRefreshRequest = originalRequest?.url === "/auth/refresh";

    if (error.response?.status !== 401 || !refreshToken || originalRequest?._retry || isRefreshRequest) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise ??= refreshClient
        .post("/auth/refresh", { refreshToken })
        .then(({ data }) => data.data)
        .finally(() => {
          refreshPromise = null;
        });

      const tokens = await refreshPromise;
      tokenStorage.update(tokens);
      originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      tokenStorage.clear();
      window.dispatchEvent(new CustomEvent("meetly:session-expired"));
      return Promise.reject(refreshError);
    }
  },
);

export function unwrapApiResponse(response) {
  return response.data.data;
}
