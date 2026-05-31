"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useGlobalTheme } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Spinner } from "@/components/ui/spinner";
import { getSupabase } from "@/app/lib/supabase";

export default function ForgotPasswordPage() {
  const { theme } = useGlobalTheme();
  const isDark = theme === "dark";
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await getSupabase().auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Reset link sent! Check your inbox.");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Something went wrong. Try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center transition-colors duration-300 relative p-4",
      isDark ? "bg-[#09090b]" : "bg-[#f4f4f5]"
    )}>
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className={cn(
        "w-full max-w-md p-8 border rounded-2xl shadow-xl transition-colors duration-300 relative",
        isDark ? "bg-[#18181b] border-[#27272a]" : "bg-white border-[#e4e4e7]"
      )}>
        <div className="flex flex-col items-center mb-8">
          <img
            src="/logo.png"
            alt="Arcadia Logo"
            className="h-12 w-auto mb-4"
          />
          <h2 className={cn("text-2xl font-extrabold text-center tracking-tight mb-2", isDark ? "text-white" : "text-black")}>
            Forgot Password
          </h2>
          <p className={cn("text-sm text-center mb-6 font-semibold max-w-[95%]", isDark ? "text-zinc-300" : "text-slate-900")}>
            {sent
              ? "Check your email for the reset link."
              : "Enter your email address and we'll send you a link to reset your password."}
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <svg className="h-7 w-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <Link
              href="/auth"
              className={cn(
                "inline-flex items-center justify-center w-full py-3 px-4 rounded-xl font-bold transition-all duration-200",
                "bg-[#F9A825] hover:bg-[#FFC107] text-zinc-950"
              )}
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={cn("text-sm font-extrabold block mb-1", isDark ? "text-zinc-200" : "text-black")}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                required
                className={cn(
                  "w-full border rounded-xl px-4 py-3 outline-none transition-all focus:border-[#FFC107] font-semibold",
                  isDark
                    ? "bg-[#09090b] text-white border-[#27272a] placeholder:text-zinc-600"
                    : "bg-[#fafafa] text-black border-[#d4d4d8] placeholder:text-zinc-400"
                )}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={cn(
                "w-full py-3 px-4 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2",
                submitting
                  ? "bg-[#FFAB00] text-white/90 cursor-not-allowed"
                  : "bg-[#F9A825] hover:bg-[#FFC107] text-zinc-950"
              )}
            >
              {submitting ? <Spinner /> : "Reset Password"}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/auth"
            className={cn(
              "inline-flex items-center justify-center gap-1 text-sm font-bold transition-colors",
              isDark ? "text-zinc-400 hover:text-[#FFC107]" : "text-slate-900 hover:text-[#F9A825]"
            )}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
