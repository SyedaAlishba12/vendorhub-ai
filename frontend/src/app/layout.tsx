"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { buyerMenu } from "@/constants/buyerMenu";
import { vendorMenu } from "@/constants/vendorMenu";

import {
  Search,
  Bell,
  User,
  ShieldCheck,
  Settings,
  LogOut,
} from "lucide-react";

import { AuthProvider, useAuth } from "@/context/AuthContext";

import "./globals.css";

function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  const isAdmin = pathname?.startsWith("/admin");
  const isLanding = pathname === "/landing";

const isAuthPage =
  pathname === "/login" ||
  pathname === "/signup" ||
  pathname === "/forgot-password" ||
  pathname === "/reset-password" ||
  pathname === "/verify-email";
  /*
   * -------------------------------------------------------
   * PUBLIC / AUTH / ADMIN PAGES
   * -------------------------------------------------------
   */

 if (isAdmin || isLanding || isAuthPage) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased">
      {children}
    </div>
  );
}

  /*
   * -------------------------------------------------------
   * AUTH LOADING
   * -------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />

          <p className="text-sm font-semibold text-slate-500">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  /*
   * -------------------------------------------------------
   * DETERMINE USER ROLE
   * -------------------------------------------------------
   */

  const role = user?.role?.toLowerCase();

  const isVendor = role === "vendor";

  /*
   * Buyer gets buyer menu.
   * Vendor gets vendor menu.
   */

  const activeMenu = isVendor ? vendorMenu : buyerMenu;

  /*
   * -------------------------------------------------------
   * HEADER
   * -------------------------------------------------------
   */

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shrink-0 sticky top-0 z-40">

        {/* --------------------------------------------- */}
        {/* LOGO */}
        {/* --------------------------------------------- */}

        <div className="shrink-0">
          <h1 className="text-lg font-black text-slate-900">
            VendorHub AI
          </h1>

          <p className="text-[10px] text-slate-400 font-medium">
            Find the Right Supplier. Faster. Smarter.
          </p>
        </div>

        {/* --------------------------------------------- */}
        {/* SEARCH */}
        {/* --------------------------------------------- */}

        <div className="hidden md:flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-1.5 w-80 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">

          <Search className="h-4 w-4 text-slate-400 shrink-0" />

          <input
            type="text"
            placeholder="Ask AI: e.g. ISO Steel Mfr in Turkey..."
            className="bg-transparent text-xs text-slate-700 outline-none w-full placeholder:text-slate-400 font-medium"
          />

        </div>

        {/* --------------------------------------------- */}
        {/* USER SECTION */}
        {/* --------------------------------------------- */}

        <div className="flex items-center gap-2 md:gap-3">

          {/* Notifications */}

          <button
            type="button"
            className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />

            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white" />
          </button>

          {/* Divider */}

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* User */}

          <div className="flex items-center gap-2.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">

            {/* User Icon */}

            <div className="bg-indigo-600 text-white p-1.5 rounded-lg font-bold text-xs flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>

            {/* User Information */}

            <div className="text-left hidden sm:block pr-2">

              <div className="flex items-center gap-1">

                <p className="text-xs font-bold text-slate-900 leading-none">
                  {user?.name || "User"}
                </p>

                <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />

              </div>

              <p className="text-[10px] text-indigo-600 font-semibold mt-0.5 leading-none capitalize">
                {user?.role || "User"}
              </p>

            </div>
          </div>

          {/* Logout */}

          <button
            type="button"
            onClick={logout}
            title="Logout"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
          >

            <LogOut className="h-4 w-4" />

            <span className="hidden sm:inline">
              Logout
            </span>

          </button>

        </div>
      </header>

      {/* --------------------------------------------- */}
      {/* MAIN LAYOUT */}
      {/* --------------------------------------------- */}

      <div className="flex min-h-[calc(100vh-4rem)]">

        {/* ------------------------------------------- */}
        {/* SIDEBAR */}
        {/* ------------------------------------------- */}

        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 shrink-0 hidden lg:flex text-slate-700">

          <div className="space-y-6">

            {/* Section Heading */}

            <div>

              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {isVendor
                  ? "Vendor Workspace"
                  : "Platform Modules"}
              </p>

              {/* Navigation */}

              <nav className="space-y-1">

                {activeMenu.map((item: any, idx: number) => {

                  const Icon = item.icon;

                  /*
                   * Supports nested routes.
                   *
                   * Example:
                   * /vendor/products
                   * should keep "Products" active.
                   */

                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" &&
                      pathname?.startsWith(`${item.href}/`));

                  return (
                    <Link
                      key={item.id || idx}
                      href={item.href}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                        isActive
                          ? "bg-indigo-50 text-indigo-600 font-bold border border-indigo-100 shadow-sm"
                          : "text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >

                      {/* Icon + Label */}

                      <div className="flex items-center gap-2.5">

                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            isActive
                              ? "text-indigo-600"
                              : "text-slate-400"
                          }`}
                        />

                        <span>
                          {item.label}
                        </span>

                      </div>

                      {/* Optional AI Tag */}

                      {item.tag && (
                        <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-indigo-100 text-indigo-700">
                          {item.tag}
                        </span>
                      )}

                    </Link>
                  );
                })}

              </nav>
            </div>
          </div>

          {/* ----------------------------------------- */}
          {/* SETTINGS */}
          {/* ----------------------------------------- */}

          <div className="border-t border-slate-200 pt-3">

            <Link
              href="/settings"
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                pathname === "/settings"
                  ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >

              <Settings
                className={`h-4 w-4 ${
                  pathname === "/settings"
                    ? "text-indigo-600"
                    : "text-slate-400"
                }`}
              />

              <span>
                System Settings
              </span>

            </Link>

          </div>
        </aside>

        {/* ------------------------------------------- */}
        {/* PAGE CONTENT */}
        {/* ------------------------------------------- */}

        <main className="flex-1 p-4 md:p-6 bg-slate-50 overflow-x-hidden min-w-0">
          {children}
        </main>

      </div>
    </>
  );
}

/*
 * =======================================================
 * ROOT LAYOUT
 * =======================================================
 */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">

      <body className="bg-slate-50 text-slate-900">

        <AuthProvider>

          <DashboardLayout>
            {children}
          </DashboardLayout>

        </AuthProvider>

      </body>

    </html>
  );
}