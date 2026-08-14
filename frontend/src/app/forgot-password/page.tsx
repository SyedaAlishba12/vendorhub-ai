"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Send, CheckCircle } from "lucide-react";

import apiClient from "@/utils/api/apiClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post(
        "/auth/forgot-password",
        {
          email: email.trim(),
        }
      );

      setSuccess(
        response.data?.message ||
          "If an account exists with this email, a password reset link has been sent."
      );

    } catch (err: any) {
      console.error(
        "Forgot password error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to process your request."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans px-4 py-8">

      <div className="w-full max-w-sm bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">

        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Login
        </Link>

        <div className="flex flex-col items-center text-center gap-2">

          <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-md shadow-indigo-200">
            <Mail className="h-6 w-6" />
          </div>

          <h1 className="font-black text-slate-900 text-lg tracking-tight">
            Forgot Password?
          </h1>

          <p className="text-xs text-slate-500 font-medium">
            Enter your email and we'll send you a
            password reset link.
          </p>

        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl text-xs font-semibold flex gap-2">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl py-2.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >

            <Send className="h-4 w-4" />

            {loading
              ? "Sending..."
              : "Send Reset Link"}

          </button>

        </form>

        <p className="text-center text-xs text-slate-500 font-medium">
          Remember your password?{" "}

          <Link
            href="/login"
            className="text-indigo-600 font-bold hover:text-indigo-700"
          >
            Log in
          </Link>
        </p>

      </div>

    </div>
  );
}