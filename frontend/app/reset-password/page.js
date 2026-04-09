"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiJson } from "@/lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fromParams = (searchParams.get("token") ?? "").trim();
    if (fromParams) {
      setToken(fromParams);
      return;
    }
    // Fallback for cases where searchParams hydrates late.
    if (typeof window !== "undefined") {
      const fromUrl = new URLSearchParams(window.location.search).get("token") ?? "";
      setToken(fromUrl.trim());
    }
  }, [searchParams]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!token || pending) return;
    setPending(true);
    setError("");
    setMessage("");
    try {
      const data = await apiJson("/api/v1/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      setMessage(data?.message || "Password reset successful");
      setTimeout(() => router.push("/login"), 1200);
    } catch (err) {
      setError(err.message || "Could not reset password");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col px-4 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Reset Password</h1>
      {!token ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          Missing or invalid reset token.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
          {message && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p>}
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
          <div className="flex items-center gap-2">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              maxLength={64}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="rounded-lg border border-zinc-300 px-3 py-2 text-xs">
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <button type="submit" disabled={pending || !token || !newPassword.trim()} className="rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white disabled:opacity-60">
            {pending ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}
    </main>
  );
}
