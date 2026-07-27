import { tokenStorage } from "./tokenStorage";

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const decoded = atob(normalized);
  return decodeURIComponent(
    Array.from(decoded)
      .map((character) => `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`)
      .join(""),
  );
}

export function getAccessTokenClaims() {
  try {
    const token = tokenStorage.getAccessToken();
    if (!token) return null;
    return JSON.parse(decodeBase64Url(token.split(".")[1]));
  } catch {
    return null;
  }
}

