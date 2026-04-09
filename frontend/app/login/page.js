
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { apiJson } from "@/lib/api";

export default function LoginPage() {
  const { applySession } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 🔥 Always reset state when page loads
  useEffect(() => {
    setEmail("");
    setPassword("");
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setPending(true);

    try {
      const data = await apiJson("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      applySession({ token: data.token, user: data.user });

      // ✅ clear inputs after success
      setEmail("");
      setPassword("");

      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err.message);

      // ✅ clear only password on failure
      setPassword("");
    } finally {
      setPending(false);
    }
  }

  return (
    <main key="login-page" className="mx-auto flex w-full max-w-md flex-col px-4 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Log in
      </h1>

      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Use your IIITM institutional email.{" "}
        <Link
          href="/register"
          className="font-medium text-teal-700 underline dark:text-teal-400"
        >
          Register
        </Link>
      </p>

      <form
        onSubmit={onSubmit}
        autoComplete="off"
        className="mt-8 flex flex-col gap-4"
      >
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
            {error}
          </p>
        )}

        {/* Email */}
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Email
          <input
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="off"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </label>

        {/* Password */}
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Password
          <div className="flex items-center gap-2">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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

        <Link
          href="/forgot-password"
          className="text-xs text-teal-700 underline dark:text-teal-400"
        >
          Forgot password?
        </Link>

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}

