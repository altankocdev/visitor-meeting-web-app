const STORAGE_KEY = "meetly.auth";

function readStoredSession() {
  try {
    const value = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export const tokenStorage = {
  getSession: readStoredSession,
  getAccessToken: () => readStoredSession()?.accessToken ?? null,
  getRefreshToken: () => readStoredSession()?.refreshToken ?? null,
  save(tokens, persistent = true) {
    const storage = persistent ? localStorage : sessionStorage;
    const otherStorage = persistent ? sessionStorage : localStorage;
    otherStorage.removeItem(STORAGE_KEY);
    storage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  },
  update(tokens) {
    const storage = localStorage.getItem(STORAGE_KEY) ? localStorage : sessionStorage;
    storage.setItem(STORAGE_KEY, JSON.stringify({
      ...(readStoredSession() ?? {}),
      ...tokens,
    }));
  },
  clear() {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  },
};
