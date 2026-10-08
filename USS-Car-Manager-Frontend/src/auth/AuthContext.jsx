import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);
const TOKEN_KEY = "uss_auth_token";
const USER_KEY = "uss_auth_user";
const EXPIRY_KEY = "uss_auth_expiry";

function readStoredUser() {
  try {
    return JSON.parse(sessionStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(Boolean(sessionStorage.getItem(TOKEN_KEY)));

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(EXPIRY_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    const onExpired = () => clearSession();
    window.addEventListener("uss-auth-expired", onExpired);
    return () => window.removeEventListener("uss-auth-expired", onExpired);
  }, [clearSession]);

  useEffect(() => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const expiry = sessionStorage.getItem(EXPIRY_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    if (expiry && new Date(expiry) <= new Date()) {
      clearSession();
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then(({ data }) => {
        setUser(data);
        sessionStorage.setItem(USER_KEY, JSON.stringify(data));
      })
      .catch(clearSession)
      .finally(() => setLoading(false));
  }, [clearSession]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    sessionStorage.setItem(TOKEN_KEY, data.token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
    sessionStorage.setItem(EXPIRY_KEY, data.expiresAt);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Clear local session even if the network/server is unavailable.
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      canWrite: user?.role === "admin" || user?.role === "manager",
    }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
