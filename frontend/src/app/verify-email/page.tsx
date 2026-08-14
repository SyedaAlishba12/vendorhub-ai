"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import {
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { verifyAndLogin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const verificationStarted =
    useRef(false);

  useEffect(() => {
    if (verificationStarted.current) {
      return;
    }

    verificationStarted.current = true;

    if (!searchParams) {
  setError("Unable to read verification link.");
  setLoading(false);
  return;
}

const token = searchParams.get("token");

    if (!token) {
      setError(
        "Invalid or missing verification token."
      );
      setLoading(false);
      return;
    }

    const verifyEmail = async () => {
      const result =
        await verifyAndLogin(token);

      if (!result.success) {
        setError(
          result.error ||
            "Unable to verify your email."
        );

        setLoading(false);
        return;
      }

      // Email verified + user authenticated.
      // Go directly to dashboard.
      router.replace("/");
    };

    verifyEmail();
  }, [searchParams, verifyAndLogin, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">

      <div className="w-full max-w-sm bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">

        {loading && (
          <>
            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mx-auto" />

            <h1 className="text-lg font-bold text-slate-900 mt-4">
              Verifying your email...
            </h1>

            <p className="text-xs text-slate-500 mt-2">
              Please wait while we verify your account.
            </p>
          </>
        )}

        {!loading && error && (
          <>
            <XCircle className="h-12 w-12 text-rose-500 mx-auto" />

            <h1 className="text-lg font-bold text-slate-900 mt-4">
              Verification Failed
            </h1>

            <p className="text-xs text-slate-500 mt-2">
              {error}
            </p>
          </>
        )}

      </div>

    </div>
  );
}