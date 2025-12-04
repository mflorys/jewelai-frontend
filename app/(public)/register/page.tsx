"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { getToken } from "@/lib/auth-storage";
import { cn } from "@/lib/cn";

export default function RegisterPage() {
  const router = useRouter();
  const { saveToken, hydrated } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!hydrated) return;
    
    const token = getToken();
    if (token) {
      router.replace("/projects");
    }
  }, [hydrated, router]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation (optional but if provided, should be valid)
    if (name.trim() && name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long.";
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required.";
    } else {
      const hasMinLength = password.length >= 8;
      const hasUppercase = /(?=.*[A-Z])/.test(password);
      const hasLowercase = /(?=.*[a-z])/.test(password);
      const hasNumber = /(?=.*\d)/.test(password);
      
      if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber) {
        newErrors.password = "Must be at least 8 characters with uppercase, lowercase, and a number.";
      }
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await api.register(
        email.trim(),
        password,
        name.trim() || undefined,
      );
      
      if (res?.token) {
        saveToken(res.token, name.trim() || email);
        router.push("/projects");
      } else {
        setErrors({
          general: "Registration succeeded but token was not returned.",
        });
      }
    } catch (err) {
      console.error(err);
      const status = (err as { status?: number })?.status;
      
      if (status === 409) {
        setErrors({
          email: "An account with this email already exists.",
        });
      } else if (status === 400) {
        setErrors({
          general:
            (err as { message?: string })?.message ||
            "Please check your input and try again.",
        });
      } else {
        setErrors({
          general:
            (err as { message?: string })?.message ||
            "We could not create your account. Please try again.",
        });
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
            Create an account to start shaping bespoke jewelry projects. Your
            session token is stored locally until you sign out.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-coal">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.name;
                    return next;
                  });
                }
              }}
              className={cn(
                "rounded-2xl border px-4 py-3 text-sm text-coal shadow-inner shadow-black/5 outline-none transition-colors",
                errors.name
                  ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red/30"
                  : "border-black/10 bg-white focus:border-gold focus:ring-2 focus:ring-gold/30",
              )}
              placeholder="Your full name"
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-coal">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.email;
                    return next;
                  });
                }
              }}
              className={cn(
                "rounded-2xl border px-4 py-3 text-sm text-coal shadow-inner shadow-black/5 outline-none transition-colors",
                errors.email
                  ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red/30"
                  : "border-black/10 bg-white focus:border-gold focus:ring-2 focus:ring-gold/30",
              )}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-coal">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.password;
                      return next;
                    });
                  }
                  // Clear confirm password error if passwords now match
                  if (confirmPassword && e.target.value === confirmPassword) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.confirmPassword;
                      return next;
                    });
                  }
                }}
                className={cn(
                  "w-full rounded-2xl border px-4 py-3 pr-12 text-sm text-coal shadow-inner shadow-black/5 outline-none transition-colors",
                  errors.password
                    ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red/30"
                    : "border-black/10 bg-white focus:border-gold focus:ring-2 focus:ring-gold/30",
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
            {errors.password ? (
              <p className="text-xs text-red-600">{errors.password}</p>
            ) : (
              <p className="text-xs text-ash">
                Must be at least 8 characters with uppercase, lowercase, and a number.
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-coal">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.confirmPassword;
                      return next;
                    });
                  }
                }}
                className={cn(
                  "w-full rounded-2xl border px-4 py-3 pr-12 text-sm text-coal shadow-inner shadow-black/5 outline-none transition-colors",
                  errors.confirmPassword
                    ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red/30"
                    : "border-black/10 bg-white focus:border-gold focus:ring-2 focus:ring-gold/30",
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-1 right-1 inline-flex w-10 items-center justify-center rounded-xl text-ash transition hover:text-ink focus:outline-none focus:ring-2 focus:ring-gold/40"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          {errors.general && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors.general}
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
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <div className="border-t border-black/5 pt-6">
          <p className="mb-4 text-center text-sm text-ash">
            Already have an account?
          </p>
          <Link
            href="/login"
            className={cn(
              "inline-flex w-full items-center justify-center rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-coal shadow-sm transition",
              "hover:-translate-y-[1px] hover:shadow-md",
            )}
          >
            Sign in
          </Link>
        </div>
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

