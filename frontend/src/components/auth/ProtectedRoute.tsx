"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const {
    user,
    loading,
    hasRole,
  } = useAuth();

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) {
      return;
    }

    // ---------------------------------------
    // User is not logged in
    // ---------------------------------------

    if (!user) {
      const redirectPath = pathname || "/";

      router.replace(
        `/login?redirect=${encodeURIComponent(
          redirectPath
        )}`
      );

      return;
    }

    // ---------------------------------------
    // User has wrong role
    // ---------------------------------------

    if (
      allowedRoles &&
      allowedRoles.length > 0 &&
      !hasRole(...allowedRoles)
    ) {
      router.replace("/unauthorized");

      return;
    }
  }, [
    user,
    loading,
    pathname,
    router,
    hasRole,
    allowedRoles,
  ]);

  // ---------------------------------------
  // Loading
  // ---------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />

          <p className="mt-3 text-sm text-slate-500">
            Checking your session...
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------------------
  // Not authenticated
  // ---------------------------------------

  if (!user) {
    return null;
  }

  // ---------------------------------------
  // Wrong role
  // ---------------------------------------

  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !hasRole(...allowedRoles)
  ) {
    return null;
  }

  return <>{children}</>;
}