"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function requestReset(e) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    setMessage("");
    try {
      const data = await apiJson("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSent(true);
      setMessage(data?.message || "Reset link sent to your email.");
    } catch (err) {
      setError(err.message || "Could not send reset link");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col px-4 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Forgot Password</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Enter your email to receive a password reset link.
      </p>
      {message && <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p>}
      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

      <form onSubmit={requestReset} className="mt-6 flex flex-col gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="bcs_1234567@iiitm.ac.in"
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
        <button type="submit" disabled={pending} className="rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white disabled:opacity-60">
          {pending ? "Sending..." : sent ? "Resend email" : "Send reset link"}
        </button>
      </form>
      <button type="button" onClick={() => router.push("/login")} className="mt-4 text-left text-sm text-teal-700 underline dark:text-teal-400">
        Back to login
      </button>
    </main>
  );
}
