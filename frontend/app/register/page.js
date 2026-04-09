"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setPending(true);
    const fd = new FormData(e.target);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    try {
      const data = await apiJson("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      setMessage(data?.message || "OTP sent to your email.");
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col px-4 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Register
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Only IIITM Gwalior emails (e.g. bcs_1234567@iiitm.ac.in) are accepted.{" "}
        <Link href="/login" className="font-medium text-teal-700 underline dark:text-teal-400">
          Log in
        </Link>
      </p>
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        {message && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
            {message}
          </p>
        )}
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
            {error}
          </p>
        )}
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Name
          <input
            name="name"
            required
            minLength={2}
            autoComplete="name"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="bcs_1234567@iiitm.ac.in"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Password (6–64 characters)
          <div className="flex items-center gap-2">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              maxLength={64}
              autoComplete="new-password"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-xs dark:border-zinc-600"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>
        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {pending ? "Sending OTP…" : "Create account"}
        </button>
      </form>
    </main>
  );
}
