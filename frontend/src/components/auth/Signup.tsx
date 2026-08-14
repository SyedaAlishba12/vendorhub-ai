"use client";

import { useState } from "react";
import Link from "next/link";

import {
  Sparkles,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

export default function Signup() {
  const { signup } = useAuth();


  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [role, setRole] = useState("buyer");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [submitting, setSubmitting] =
    useState(false);

  // ---------------------------------------
  // Password strength
  // ---------------------------------------

  const getPasswordStrength = (
    password: string
  ) => {
    let score = 0;

    if (password.length >= 6) {
      score++;
    }

    if (password.length >= 10) {
      score++;
    }

    if (/[A-Z]/.test(password)) {
      score++;
    }

    if (/[0-9]/.test(password)) {
      score++;
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score++;
    }

    if (score <= 2) {
      return {
        label: "Weak",
        width: "w-1/3",
      };
    }

    if (score <= 4) {
      return {
        label: "Medium",
        width: "w-2/3",
      };
    }

    return {
      label: "Strong",
      width: "w-full",
    };
  };

  const passwordStrength =
    getPasswordStrength(password);

  // ---------------------------------------
  // Submit
  // ---------------------------------------

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Name validation
    if (!name.trim()) {
      setError(
        "Please enter your full name."
      );
      return;
    }

    if (name.trim().length < 2) {
      setError(
        "Name must contain at least 2 characters."
      );
      return;
    }

    // Email validation
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

    // Password validation
    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    // Role validation
    if (
      role !== "buyer" &&
      role !== "vendor"
    ) {
      setError("Invalid account type.");
      return;
    }

    setSubmitting(true);

    const result = await signup(
      name.trim(),
      email.trim(),
      password,
      role
    );

    setSubmitting(false);

    if (result.success) {
      setSuccess(
        "Account created successfully! Please verify your email before logging in."
      );

    } else {
      setError(
        result.error || "Signup failed."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans px-4 py-8">

      <div className="w-full max-w-sm bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">

        {/* Header */}
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
            Create your account
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl text-xs font-semibold">
            <CheckCircle className="h-4 w-4" />
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* Name */}
          <div>

            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
              Full Name
            </label>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500/30">

              <UserIcon className="h-4 w-4 text-slate-400" />

              <input
                type="text"
                required
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Your name"
                className="w-full text-xs font-medium text-slate-700 bg-transparent outline-none placeholder:text-slate-400"
              />

            </div>

          </div>

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
                minLength={8}
                maxLength={32}
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="At least 8 characters"
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

            {/* Password strength */}
            {password && (
              <div className="mt-2">

                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">

                  <div
                    className={`h-full ${passwordStrength.width} bg-indigo-500 transition-all`}
                  />

                </div>

                <p className="text-[10px] text-slate-500 mt-1">
                  Password strength:{" "}
                  <span className="font-bold">
                    {passwordStrength.label}
                  </span>
                </p>

              </div>
            )}

          </div>

          {/* Confirm Password */}
          <div>

            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
              Confirm Password
            </label>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500/30">

              <Lock className="h-4 w-4 text-slate-400" />

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                required
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                placeholder="Repeat your password"
                className="w-full text-xs font-medium text-slate-700 bg-transparent outline-none placeholder:text-slate-400"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                className="text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>

            </div>

          </div>

          {/* Role */}
          <div>

            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
              I am a
            </label>

            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
              className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="buyer">
                Buyer
              </option>

              <option value="vendor">
                Vendor
              </option>
            </select>

          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl py-2.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting
              ? "Creating account..."
              : "Sign Up"}
          </button>

        </form>

        {/* Login */}
        <p className="text-center text-xs text-slate-500 font-medium">

          Already have an account?{" "}

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