"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50 font-sans relative overflow-hidden">
      
      {/* 2. TOP NAVIGATION */}
      <nav className="w-full flex justify-between items-center px-6 py-4 absolute top-0 z-20">
        <Link href="/login" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
          <svg className="w-5 h-5 focus:outline-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Login
        </Link>
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shadow-inner">
             <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
           </div>
           <span className="text-indigo-600 font-bold tracking-tight">TrustHive</span>
        </div>
      </nav>

      {/* Center content wrapper */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-12 z-10 w-full max-w-md mx-auto">
        
        {/* 3. MAIN CARD CONTAINER */}
        <div className="w-full bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/40 p-6 md:p-8 flex flex-col items-center">
           
           {/* 4. MAIN HEADING */}
           <h1 className="text-4xl font-bold tracking-tight text-gray-900 text-center mb-3 mt-2">
             RESET YOUR <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">KEY</span>
           </h1>

           {/* 5. SUBTEXT */}
           <p className="text-sm text-gray-500 text-center leading-relaxed mb-8 font-medium">
             Enter your registered campus email to securely receive a password reset sequence.
           </p>

           <form onSubmit={requestReset} className="w-full space-y-5">
             
             {error && (
               <div className="rounded-2xl bg-red-50 p-4 border border-red-100 flex gap-3 text-sm text-red-800 shadow-sm">
                 <svg className="w-5 h-5 shrink-0 mt-0.5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                 <span className="leading-tight">{error}</span>
               </div>
             )}

             {message && (
               <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100 flex gap-3 text-sm text-emerald-800 shadow-sm">
                 <svg className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                 <span className="leading-tight">{message}</span>
               </div>
             )}

             {/* 7. INPUT FIELD */}
             <div className="space-y-1.5 flex flex-col">
               <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">
                 Campus Email
               </label>
               <div className="relative flex items-center">
                  <div className="absolute left-4 text-gray-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="bcs_1234567@iiitm.ac.in"
                    className="w-full rounded-2xl border border-gray-200 bg-white/60 py-3.5 pl-11 pr-4 text-sm text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
               </div>
             </div>

             {/* 8. INFO / ALERT BOX */}
             <div className="bg-indigo-50/50 rounded-2xl p-4 flex items-start gap-3 border border-indigo-100/50">
                <svg className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                <p className="text-xs text-indigo-700/80 font-medium leading-relaxed">
                  We will transmit a cryptographic reset link to your email. Ensure you have access to your institutional inbox.
                </p>
             </div>

             {/* 9. PRIMARY BUTTON */}
             <div className="pt-2">
               <button
                 type="submit"
                 disabled={pending}
                 className="flex w-full justify-center items-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 py-3.5 px-4 text-sm font-bold tracking-wide text-white shadow-md shadow-indigo-500/20 hover:from-indigo-600 hover:to-purple-600 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:scale-100"
               >
                 {pending ? (
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                 ) : sent ? (
                   "Resend Link"
                 ) : (
                   "Transmit Link"
                 )}
               </button>
             </div>
           </form>

           {/* 10. DIVIDER + STATUS */}
           <div className="w-full mt-10 mb-2 relative flex items-center justify-center">
             <div className="w-full h-px bg-gray-200"></div>
             <span className="absolute px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/0 mix-blend-normal">
               Identity Verified
             </span>
           </div>

        </div>

        {/* 11. FOOTER BADGE */}
        <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-gray-500 font-semibold bg-gray-100 px-4 py-2.5 rounded-full border border-gray-200/50 shadow-sm transition-colors hover:bg-gray-200 hover:text-gray-700 cursor-default">
           <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
           <span>End-to-End Encrypted Verification Layer</span>
        </div>
      </div>
    </main>
  );
}
