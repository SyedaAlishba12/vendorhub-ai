
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const {
    login,
    resendVerificationEmail,
  } = useAuth();

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [rememberMe, setRememberMe] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [verificationError, setVerificationError] =
    useState("");

  const [resending, setResending] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  // ============================================
  // LOGIN
  // ============================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setVerificationError("");

    // Validation
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!email.includes("@")) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setSubmitting(true);

    try {
      // IMPORTANT:
      // login() is called exactly once.
      const result = await login(
        email.trim(),
        password,
        rememberMe
      );

      if (result.success) {
        setSuccess(
          "Login successful! Redirecting..."
        );

        setTimeout(() => {
          router.push("/");
        }, 2000);

        return;
      }

      const errorMessage =
        result.error || "Login failed.";

      setError(errorMessage);

      // Unverified email
      if (
        errorMessage
          .toLowerCase()
          .includes("verify your email")
      ) {
        setVerificationError(
          "Your email is not verified yet. Please check your inbox or spam folder."
        );
      }
    } catch (error) {
      console.error("Login page error:", error);

      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // RESEND VERIFICATION EMAIL
  // ============================================

  const handleResendVerification = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError(
        "Please enter your email address first."
      );
      return;
    }

    setResending(true);
    setError("");
    setSuccess("");

    try {
      const result =
        await resendVerificationEmail(
          trimmedEmail
        );

      if (result.success) {
        setVerificationError("");

        setSuccess(
          "Verification email sent! Please check your inbox or spam folder."
        );

        return;
      }

      setError(
        result.error ||
          "Failed to resend verification email."
      );
    } catch (error) {
      console.error(
        "Resend verification error:",
        error
      );

      setError(
        "Failed to resend verification email."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans px-4 py-8 relative">

      {/* Back to Landing Page */}

      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="w-full max-w-sm bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">

        {/* Logo */}

        <div className="flex flex-col items-center text-center gap-2">

          <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-md shadow-indigo-200">
            <Sparkles className="h-6 w-6" />
          </div>

          <h1 className="font-black text-slate-900 text-lg tracking-tight">
            VendorHub{" "}
            <span className="text-indigo-600">
              AI
            </span>
          </h1>

          <p className="text-xs text-slate-500 font-medium">
            Log in to your account
          </p>

        </div>

        {/* Error */}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Email Verification */}

        {verificationError && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">

            <div className="text-xs font-semibold text-amber-800">
              {verificationError}
            </div>

            <button
              type="button"
              onClick={
                handleResendVerification
              }
              disabled={resending}
              className="flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg py-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${
                  resending
                    ? "animate-spin"
                    : ""
                }`}
              />

              {resending
                ? "Sending..."
                : "Resend Verification Email"}
            </button>

          </div>
        )}

        {/* Success */}

        {success && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl text-xs font-semibold">

            <CheckCircle className="h-4 w-4" />

            {success}

          </div>
        )}

        {/* Login Form */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* Email */}

          <div>

            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
              Email
            </label>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500/30">

              <Mail className="h-4 w-4 text-slate-400" />

              <input
                type="email"
                required
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@company.com"
                className="w-full text-xs font-medium text-slate-700 bg-transparent outline-none placeholder:text-slate-400"
              />

            </div>

          </div>

          {/* Password */}

          <div>

            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
              Password
            </label>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500/30">

              <Lock className="h-4 w-4 text-slate-400" />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                required
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="••••••••"
                className="w-full text-xs font-medium text-slate-700 bg-transparent outline-none placeholder:text-slate-400"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>

            </div>

          </div>

          {/* Remember + Forgot */}

          <div className="flex items-center justify-between">

            <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">

              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(
                    e.target.checked
                  )
                }
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />

              Remember me

            </label>

            <Link
              href="/forgot-password"
              className="text-xs text-indigo-600 font-semibold hover:text-indigo-700"
            >
              Forgot password?
            </Link>

          </div>

          {/* Login Button */}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl py-2.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting
              ? "Logging in..."
              : "Log In"}
          </button>

        </form>

        {/* Signup */}

        <p className="text-center text-xs text-slate-500 font-medium">

          Don&apos;t have an account?{" "}

          <Link
            href="/signup"
            className="text-indigo-600 font-bold hover:text-indigo-700"
          >
            Sign up
          </Link>

        </p>

      </div>

    </div>
  );
}

