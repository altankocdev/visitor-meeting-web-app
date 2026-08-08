import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authRepository } from "../../infrastructure/repositories/authRepository";
import { tokenStorage } from "../../infrastructure/auth/tokenStorage";
import { withMinimumDelay } from "../utils/withMinimumDelay";

const AuthContext = createContext(null);

function initials(firstName, lastName, fallback = "ME") {
  const value = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.trim();
  return (value || fallback.slice(0, 2)).toLocaleUpperCase("tr-TR");
}

function mapSession(payload, isPlatformAdmin) {
  if (isPlatformAdmin) {
    const names = (payload.fullName || "Platform yöneticisi")
      .trim()
      .split(/\s+/);
    return {
      isPlatformAdmin: true,
      permissions: [],
      user: {
        id: payload.id,
        firstName: names[0] ?? "",
        lastName: names.slice(1).join(" "),
        email: payload.email,
        username: payload.email?.split("@")[0] ?? "admin",
        initials: initials(names[0], names[1], "PA"),
        roleLabel: "Platform yöneticisi",
        companyName: "Meetly Platform",
      },
    };
  }

  const roleNames = [...(payload.roleNames ?? [])];
  return {
    isPlatformAdmin: false,
    permissions: [...(payload.permissions ?? [])],
    user: {
      id: payload.userId,
      companyId: payload.companyId,
      companyName: payload.companyName,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      username: payload.username,
      initials: initials(payload.firstName, payload.lastName, payload.username),
      owner: payload.owner,
      roles: roleNames,
      roleLabel: payload.owner
        ? "Şirket sahibi"
        : (roleNames[0] ?? "Kullanıcı"),
    },
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(
    Boolean(tokenStorage.getAccessToken()),
  );

  const refreshSession = useCallback(async () => {
    if (!tokenStorage.getAccessToken()) {
      setSession(null);
      setLoading(false);
      return null;
    }
    setLoading(true);
    try {
      const result = await authRepository.me();
      const nextSession = mapSession(result.data, result.isPlatformAdmin);
      setSession(nextSession);
      return nextSession;
    } catch (error) {
      tokenStorage.clear();
      setSession(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession().catch(() => {});
  }, [refreshSession]);

  const [loggingOut, setLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await withMinimumDelay(authRepository.logout(), 2000);
    } finally {
      setSession(null);
      setLoggingOut(false);
    }
  }, []);

  const value = useMemo(
    () => ({ session, loading, refreshSession, logout, loggingOut }),
    [session, loading, refreshSession, logout, loggingOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
