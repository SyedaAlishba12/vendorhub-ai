"use client";

import Link from "next/link";

import { ShieldAlert } from "lucide-react";

import { useAuth } from "@/context/AuthContext";

export default function UnauthorizedPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center">

        <div className="flex justify-center mb-4">
          <div className="bg-rose-100 text-rose-600 p-3 rounded-xl">
            <ShieldAlert className="h-7 w-7" />
          </div>
        </div>

        <h1 className="text-xl font-bold text-slate-900">
          Access Denied
        </h1>

        <p className="text-sm text-slate-500 mt-2">
          You do not have permission to access this page.
        </p>

        {user && (
          <p className="text-xs text-slate-400 mt-3">
            Current role:{" "}
            <span className="font-semibold text-slate-600">
              {user.role}
            </span>
          </p>
        )}

        <div className="flex justify-center gap-3 mt-6">

          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
          >
            Go Home
          </Link>

          <Link
            href="/login"
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
          >
            Login
          </Link>

        </div>

      </div>
    </div>
  );
}