"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import Header from "@/components/Header";

const AUTH_ROUTES = new Set(["/login", "/register", "/verify-otp", "/forgot-password", "/reset-password"]);

export default function AppChrome({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAuthRoute = AUTH_ROUTES.has(pathname);

  useEffect(() => {
    if (!loading && !user && !isAuthRoute) {
      router.replace("/login");
    }
  }, [loading, user, isAuthRoute, router]);

  if (loading) {
    return <div className="flex-1" />;
  }

  if (!user && !isAuthRoute) {
    return <div className="flex-1" />;
  }

  return (
    <>
      {!isAuthRoute && user ? <Header /> : null}
      <div className="flex-1">{children}</div>
    </>
  );
}
