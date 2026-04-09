"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getApiBase } from "@/lib/config";

const AuthContext = createContext(null);

export const TOKEN_KEY = "hci_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback(({ token: t, user: u }) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, t);
    }
    setTokenState(t);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
    }
    setTokenState(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const t =
      typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

    if (!t) {
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setTokenState(t);

    (async () => {
      try {
        const res = await fetch(`${getApiBase()}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (!res.ok) throw new Error("session");
        const data = await res.json();
        if (!cancelled) setUser(data.user);
      } catch {
        if (!cancelled) logout();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      applySession,
      logout,
    }),
    [user, token, loading, applySession, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
