
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const verified = searchParams.get("verified") === "1";
  const authError = searchParams.get("error");

  // 🔥 Always reset state when page loads
  useEffect(() => {
    setEmail("");
    setPassword("");
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
      router.refresh();
    }
  }, [status, router]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setPending(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.error) {
        throw new Error("Invalid email or password");
      }

      // ✅ clear inputs after success
      setEmail("");
      setPassword("");

      router.replace(result?.url || "/");
      router.refresh();
    } catch (err) {
      setError(err.message || "Unable to sign in");

      // ✅ clear only password on failure
      setPassword("");
    } finally {
      setPending(false);
    }
  }

  async function onGoogleSignIn() {
    setError("");
    setGooglePending(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch {
      setError("Unable to start Google sign-in. Please try again.");
      setGooglePending(false);
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

      {verified ? (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
          OTP verified successfully. Please log in.
        </p>
      ) : null}
      {authError === "AccessDenied" ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
          Only campus email IDs are allowed.
        </p>
      ) : null}

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

      <div className="my-6 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="h-px flex-1 bg-zinc-300 dark:bg-zinc-700" />
        <span>OR</span>
        <span className="h-px flex-1 bg-zinc-300 dark:bg-zinc-700" />
      </div>

      <button
        type="button"
        onClick={onGoogleSignIn}
        disabled={googlePending}
        className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
      >
        {googlePending ? "Redirecting to Google…" : "Sign in with Google"}
      </button>
    </main>
  );
}

