"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/cn";

export default function LoginPage() {
  const router = useRouter();
  const { saveToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.login(email, password);
      if (res?.token) {
        saveToken(res.token, email);
        router.push("/projects");
      } else {
        setError("Login succeeded but token was not returned.");
      }
    } catch (err) {
      console.error(err);
      const status = (err as { status?: number })?.status;
      if (status === 401) {
        setError("Provided email or password are incorrect.");
      } else {
        setError(
          (err as { message?: string })?.message ||
            "We could not sign you in. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-16">
      <div className="grid w-full max-w-4xl gap-12 rounded-3xl border border-black/10 bg-white/80 p-10 shadow-luxe">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="serif-heading text-3xl text-ink">JEWELAI</span>
            <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold text-ink">
              Studio Access
            </span>
          </div>
          <p className="max-w-xl text-sm text-ash">
            Sign in to continue shaping bespoke jewelry projects. Your session
            token is stored locally until you sign out.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-coal">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                "rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-coal shadow-inner shadow-black/5 outline-none",
                "focus:border-gold focus:ring-2 focus:ring-gold/30",
              )}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-coal">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "w-full rounded-2xl border border-black/10 bg-white px-4 py-3 pr-12 text-sm text-coal shadow-inner shadow-black/5 outline-none",
                  "focus:border-gold focus:ring-2 focus:ring-gold/30",
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-1 right-1 inline-flex w-10 items-center justify-center rounded-xl text-ash transition hover:text-ink focus:outline-none focus:ring-2 focus:ring-gold/40"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-black/70 bg-ink px-6 py-3 text-sm font-semibold text-ivory shadow-luxe-strong transition",
              "hover:-translate-y-[1px] hover:shadow-[0_20px_40px_rgba(0,0,0,0.18)]",
              loading && "opacity-70",
            )}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1.5 12s3.5-7 10.5-7 10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 3 18 18" />
      <path d="M10.6 10.6a3 3 0 0 0 4.8 3.4" />
      <path d="M9 4.5A9.5 9.5 0 0 1 21 12a9.4 9.4 0 0 1-1.6 2.6" />
      <path d="M6.4 6.4A9.5 9.5 0 0 0 3 12a9.4 9.4 0 0 0 9 5.5 9.6 9.6 0 0 0 2.9-.4" />
    </svg>
  );
}
