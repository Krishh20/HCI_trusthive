"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { apiJson } from "@/lib/api";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { applySession } = useAuth();
  const prefillEmail = useMemo(() => searchParams.get("email") ?? "", [searchParams]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const otp = String(fd.get("otp") ?? "").trim();
    try {
      const data = await apiJson("/api/v1/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      });
      applySession({ token: data.token, user: data.user });
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err.message || "OTP verification failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col px-4 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Verify OTP</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Enter the 6-digit OTP sent to your email to complete registration.
      </p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
            {error}
          </p>
        )}

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Email
          <input
            name="email"
            type="email"
            required
            defaultValue={prefillEmail}
            autoComplete="email"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          OTP
          <input
            name="otp"
            required
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="123456"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 tracking-[0.3em] text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </label>

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {pending ? "Verifying…" : "Verify and continue"}
        </button>
      </form>

      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        Didn&apos;t receive OTP?{" "}
        <Link href="/register" className="font-medium text-teal-700 underline dark:text-teal-400">
          Register again
        </Link>
      </p>
    </main>
  );
}
