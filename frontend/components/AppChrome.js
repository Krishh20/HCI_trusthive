"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppAuth } from "@/hooks/use-app-auth";
import Header from "@/components/Header";

const AUTH_ROUTES = new Set(["/login", "/register", "/verify-otp", "/forgot-password", "/reset-password"]);

export default function AppChrome({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { loading, isAuthenticated } = useAppAuth();
  const isAuthRoute = AUTH_ROUTES.has(pathname);

  useEffect(() => {
    if (!loading && !isAuthenticated && !isAuthRoute) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, isAuthRoute, router]);

  if (loading) {
    return <div className="flex-1" />;
  }

  if (!isAuthenticated && !isAuthRoute) {
    return <div className="flex-1" />;
  }

  return (
    <>
      {!isAuthRoute && isAuthenticated ? <Header /> : null}
      <div className="flex-1">{children}</div>
    </>
  );
}
