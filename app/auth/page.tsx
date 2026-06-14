"use client";
import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/app/components/Checkbox";
import { useAuth } from "@/context/AuthContext";
import { GlobalLoader } from "@/components/global-loader";
import { Spinner } from "@/components/ui/spinner";
import { useGlobalTheme } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { authClient } from "@/lib/auth/client";

function Input({
  className,
  type,
  isDark,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { type?: string; isDark: boolean }) {
  return (
    <input
      {...props}
      type={type}
      className={cn(
        "w-full border rounded-xl px-4 py-3 outline-none transition-all focus:border-[#FFC107] font-semibold",
        isDark
          ? "bg-[#09090b] text-white border-[#27272a] placeholder:text-zinc-600"
          : "bg-[#fafafa] text-black border-[#d4d4d8] placeholder:text-zinc-400",
        className
      )}
    />
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
  isDark,
  autoComplete,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  isDark: boolean;
  autoComplete?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pr-12"
        isDark={isDark}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className={cn(
          "absolute right-3 top-1/2 -translate-y-1/2 transition-colors",
          isDark ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-500 hover:text-zinc-900"
        )}
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
  isDark,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FFC107]/40",
        active
          ? "bg-[#FFC107] text-zinc-950 shadow-md"
          : isDark
            ? "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50"
            : "bg-zinc-200/60 text-black hover:bg-zinc-200"
      )}
    >
      {children}
    </button>
  );
}

function getErrorMessage(err: unknown): string {
  const message =
    err && typeof err === "object" && "message" in err
      ? String((err as { message?: unknown }).message).toLowerCase()
      : "";
  if (message.includes("failed to fetch")) {
    return "Network connection lost. Please check your internet connection or server configurations.";
  }
  if (message.includes("invalid login credentials")) {
    return "Incorrect email or password. Please try again.";
  }
  if (message.includes("user already exists") || message.includes("already registered")) {
    return "An account with this email address already exists.";
  }
  return message || "An unexpected error occurred. Please try again.";
}

export default function AuthPage() {
  const router = useRouter();
  const { loading, authError } = useAuth();
  const { theme } = useGlobalTheme();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [openTermsModal, setOpenTermsModal] = useState(false);
  const termsTitleId = useId();

  const isDark = theme === "dark";

  if (loading) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center relative p-4 transition-colors duration-300",
        isDark ? "bg-[#09090b] text-white" : "bg-[#f4f4f5] text-black"
      )}>
        <GlobalLoader active={true} />
        <div className={cn(
          "w-full max-w-md p-8 border rounded-2xl shadow-xl font-bold text-center",
          isDark ? "bg-[#18181b] border-[#27272a]" : "bg-white border-[#e4e4e7]"
        )}>
          Checking session...
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center relative p-4 transition-colors duration-300",
        isDark ? "bg-[#09090b] text-white" : "bg-[#f4f4f5] text-black"
      )}>
        <div className={cn(
          "w-full max-w-md p-8 border rounded-2xl shadow-xl font-bold text-center space-y-4",
          isDark ? "bg-[#18181b] border-[#27272a]" : "bg-white border-[#e4e4e7]"
        )}>
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
            {authError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#FFC107] text-zinc-950 rounded-xl text-sm font-bold hover:bg-[#e5a500] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await authClient.signIn.email({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      router.push("/dashboard");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (activeTab === 'signup' && !isChecked) {
      toast.error("You must agree to the Data Privacy & Confidentiality terms to proceed.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please verify your credentials and try again.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await authClient.signUp.email({
        email: email.trim(),
        password,
        name: fullName.trim(),
      });
      if (error) throw error;
      router.push("/dashboard");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/dashboard',
    });
  }

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center transition-colors duration-300 relative p-4",
      isDark ? "bg-[#09090b]" : "bg-[#f4f4f5]"
    )}>
      <GlobalLoader active={submitting || loading} />
      <style dangerouslySetInnerHTML={{__html: `
        input:-webkit-autofill {
          -webkit-text-fill-color: ${isDark ? '#ffffff' : '#000000'} !important;
          -webkit-box-shadow: 0 0 0px 1000px ${isDark ? '#09090b' : '#ffffff'} inset !important;
        }
      `}} />

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
            {activeTab === "login" ? "Welcome back" : "Join us"}
          </h2>
          <p className={cn("text-sm text-center mb-6 font-semibold max-w-[95%]", isDark ? "text-zinc-300" : "text-slate-900")}>
            {activeTab === "login"
              ? "Login to manage your projects, tracking, and expenses in real-time."
              : "Discover how Arcadia elevates your construction and project management journey."}
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          <TabButton active={activeTab === "login"} onClick={() => setActiveTab("login")} isDark={isDark}>
            Login
          </TabButton>
          <TabButton active={activeTab === "signup"} onClick={() => setActiveTab("signup")} isDark={isDark}>
            Sign Up
          </TabButton>
        </div>

        <form onSubmit={activeTab === "login" ? handleLogin : handleSignUp} className="space-y-4">
          {activeTab === "signup" && (
            <div>
              <label className={cn("text-sm font-extrabold block mb-1", isDark ? "text-zinc-200" : "text-black")}>
                Full Name
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                autoComplete="name"
                isDark={isDark}
              />
            </div>
          )}

          <div>
            <label className={cn("text-sm font-extrabold block mb-1", isDark ? "text-zinc-200" : "text-black")}>
              Email Address
            </label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              type="email"
              autoComplete="email"
              isDark={isDark}
            />
          </div>

          {activeTab === "signup" && (
            <div>
              <label className={cn("text-sm font-extrabold block mb-1", isDark ? "text-zinc-200" : "text-black")}>
                Phone Number
              </label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 555 123 456"
                autoComplete="tel"
                isDark={isDark}
              />
            </div>
          )}

          <div>
            <label className={cn("text-sm font-extrabold block mb-1", isDark ? "text-zinc-200" : "text-black")}>
              Password
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              isDark={isDark}
              autoComplete={activeTab === "login" ? "current-password" : "new-password"}
            />
          </div>

          {activeTab === "login" && (
            <div className="flex justify-end -mt-2">
              <Link
                href="/auth/forgot-password"
                className={cn(
                  "text-xs font-bold transition-colors",
                  isDark ? "text-zinc-400 hover:text-[#FFC107]" : "text-zinc-600 hover:text-[#F9A825]"
                )}
              >
                Forgot Password?
              </Link>
            </div>
          )}

          {activeTab === "signup" && (
            <div>
              <label className={cn("text-sm font-extrabold block mb-1", isDark ? "text-zinc-200" : "text-black")}>
                Confirm Password
              </label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                isDark={isDark}
                autoComplete="new-password"
              />
            </div>
          )}

          {activeTab === 'signup' && (
            <div className="flex items-start space-x-3 py-2 mb-2 select-none">
              <div className="flex items-center h-5">
                <Checkbox
                  id="terms-conditions"
                  checked={isChecked}
                  onCheckedChange={(checked) => setIsChecked(checked === true)}
                  className={cn(
                    "h-5 w-5 rounded border bg-transparent transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FFC107] data-[state=checked]:bg-[#FFC107] data-[state=checked]:border-[#FFC107] data-[state=checked]:text-zinc-950",
                    isDark ? "border-zinc-500" : "border-zinc-400"
                  )}
                />
              </div>
              <label htmlFor="terms-conditions" className={cn("text-sm font-extrabold leading-normal cursor-pointer", isDark ? "text-zinc-300" : "text-black")}>
                I agree to the{" "}
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenTermsModal(true);
                  }}
                  className="underline cursor-pointer text-[#F9A825] hover:text-[#FFC107] font-black"
                >
                  Data Privacy & Confidentiality terms
                </span>
              </label>
            </div>
          )}

          <button
            type="submit"
            className={cn(
              "w-full py-3 px-4 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 text-white",
              activeTab === 'login' || isChecked
                ? "bg-[#F9A825] hover:bg-[#FFC107]"
                : "bg-[#FFAB00] text-white/90"
            )}
          >
            {submitting ? (
              <Spinner />
            ) : (
              activeTab === "login" ? "Login" : "Create Account"
            )}
          </button>

          <p className={cn("text-xs pt-2 text-center font-bold", isDark ? "text-zinc-400" : "text-slate-900")}>
            By continuing, you agree to our Terms & Privacy policy
          </p>

          <div className="relative my-4 flex items-center justify-center">
            <div className={cn("absolute inset-0 border-t", isDark ? "border-zinc-800" : "border-zinc-200")} />
            <span className={cn("relative px-3 text-xs font-bold uppercase tracking-wider", isDark ? "bg-[#18181b] text-zinc-500" : "bg-white text-zinc-400")}>
              Or continue with
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className={cn(
              "w-full py-3 px-4 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-3 border",
              isDark
                ? "bg-[#09090b] border-[#27272a] text-white hover:bg-zinc-800/50"
                : "bg-[#fafafa] border-zinc-300 text-black hover:bg-zinc-100"
            )}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {activeTab === "login" ? "Login with Google" : "Sign in with Google"}
          </button>
        </form>

        <button
          onClick={() => router.push("/onboarding")}
          className={cn("w-full mt-4 text-sm font-bold transition-colors flex items-center justify-center gap-1", isDark ? "text-zinc-400 hover:text-[#FFC107]" : "text-slate-900 hover:text-[#F9A825]")}
        >
          ← Back to Onboarding
        </button>
      </div>

      {openTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 dark:bg-black/80"
            onClick={() => setOpenTermsModal(false)}
            aria-hidden="true"
          />
          <div className={cn(
            "relative w-full max-w-lg rounded-2xl border shadow-2xl transition-colors duration-300",
            isDark ? "bg-[#18181b] border-[#27272a]" : "bg-white border-[#e4e4e7]"
          )}>
            <div className={cn("flex items-center justify-between px-5 py-4 border-b", isDark ? "border-[#27272a]" : "border-[#e4e4e7]")}>
              <h2 id={termsTitleId} className={cn("text-lg font-black", isDark ? "text-white" : "text-black")}>
                Data Privacy & Confidentiality
              </h2>
              <button
                type="button"
                onClick={() => setOpenTermsModal(false)}
                className={cn("transition-colors font-black text-xl", isDark ? "text-zinc-400 hover:text-zinc-200" : "text-black hover:text-zinc-600")}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="px-5 py-4 max-h-[55vh] overflow-y-auto text-sm">
              <div className={cn("text-left leading-relaxed space-y-4 font-bold", isDark ? "text-zinc-200" : "text-black")}>
                <p>
                  By using Arcadia, you acknowledge and agree that certain personal, project-related,
                  and financial information may be collected, processed, and securely stored to deliver
                  the core functionalities of the platform.
                </p>
                <p>
                  Arcadia is committed to maintaining the confidentiality, integrity, and security of all
                  user data. Any information submitted through the platform - including personal details,
                  project documentation, financial records, communications, and uploaded files - will be
                  treated as strictly confidential. This data will not be sold, rented, disclosed, or shared
                  with unauthorized third parties, except as required by law or necessary for the direct operation
                  of the service.
                </p>
                <p>
                  All data is processed in compliance with applicable data protection and privacy regulations,
                  including the GDPR where applicable. We implement appropriate technical and organizational safeguards
                  designed to protect user data against unauthorized access, modification, disclosure, or misuse.
                </p>
                <p>
                  Users retain ownership of the information they submit to Arcadia and may request access to,
                  correction of, export of, or deletion of their personal data in accordance with our internal privacy
                  procedures.
                </p>
                <p>
                  While Arcadia applies industry-standard security practices to shield its infrastructure, users
                  acknowledge that no online platform or electronic storage method can guarantee absolute security.
                  Arcadia reserves the right to update its privacy practices and data handling policies at any time to
                  align with legal, technical, or operational requirements.
                </p>
              </div>
            </div>
            <div className={cn("px-5 py-4 border-t flex items-center justify-end", isDark ? "border-[#27272a]" : "border-[#e4e4e7]")}>
              <button
                type="button"
                onClick={() => setOpenTermsModal(false)}
                className="h-10 rounded-xl font-black text-zinc-950 px-6 bg-[#FFC107] hover:bg-[#e5a500] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#FFC107]/40 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
