"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";

export function useAppAuth() {
  const { data: session, status } = useSession();

  return useMemo(() => {
    const user = session?.user ?? null;
    const token = session?.accessToken ?? null;
    const provider = session?.provider ?? null;
    const loading = status === "loading";
    const isAuthenticated = Boolean(user);
    const hasBackendToken = Boolean(token);
    const userId = user?.user_id ?? user?.id ?? null;

    return {
      session,
      status,
      loading,
      isAuthenticated,
      hasBackendToken,
      provider,
      user,
      userId,
      token,
    };
  }, [session, status]);
}
