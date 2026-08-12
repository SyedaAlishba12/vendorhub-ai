"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Search,
  Bell,
  User,
  ShieldCheck,
  LayoutDashboard,
  Store,
  PackageCheck,
  FileText,
  ShoppingBag,
  MessageSquare,
  ShieldAlert,
  FolderArchive,
  Star,
  BarChart3,
  Settings,
  CreditCard,
  LogOut,
} from "lucide-react";

import { AuthProvider, useAuth } from "@/context/AuthContext";

import "./globals.css";

const menuItems = [
  {
    label: "Buyer Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    label: "AI Supplier Search",
    icon: Search,
    tag: "AI",
    href: "/vendors",
  },
  {
    label: "Vendor Directory",
    icon: Store,
    href: "/vendors",
  },
  {
    label: "Product Catalog",
    icon: PackageCheck,
    href: "/products",
  },
  {
    label: "RFQs",
    icon: FileText,
    href: "/rfq",
  },
  {
    label: "Quote Comparison",
    icon: FileText,
    href: "/quotes",
  },
  {
    label: "Order Management",
    icon: ShoppingBag,
    href: "/orders",
  },
  {
    label: "AI Assistant & Chat",
    icon: MessageSquare,
    href: "/messages",
  },
  {
    label: "Risk Analysis",
    icon: ShieldAlert,
    tag: "AI",
    href: "/risk-analysis",
  },
  {
    label: "Smart Documents",
    icon: FolderArchive,
    href: "/documents",
  },
  {
    label: "Ratings & Reviews",
    icon: Star,
    href: "/reviews",
  },
  {
    id: "analytics",
    label: "Platform Analytics",
    icon: BarChart3,
    href: "/analytics",
  },
  {
    label: "Pricing & Plans",
    icon: CreditCard,
    href: "/pricing",
  },
];

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
    pathname === "/signup";

  // Admin, landing, login and signup pages
  // should not show the dashboard UI.
  if (isAdmin || isLanding || isAuthPage) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans antialiased">
        {children}
      </div>
    );
  }

  // Wait until AuthContext checks localStorage / /auth/me.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-sm font-semibold text-slate-500">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        {/* Logo / Title */}
        <div>
          <h1 className="text-lg font-black text-slate-900">
            VendorHub AI
          </h1>

          <p className="text-[10px] text-slate-400 font-medium">
            Find the Right Supplier. Faster. Smarter.
          </p>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-1.5 w-80">
          <Search className="h-4 w-4 text-slate-400" />

          <input
            type="text"
            placeholder="Ask AI: e.g. ISO Steel Mfr in Turkey..."
            className="bg-transparent text-xs text-slate-700 outline-none w-full placeholder:text-slate-400 font-medium"
          />
        </div>

        {/* User Section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button
            type="button"
            className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
          >
            <Bell className="h-5 w-5" />

            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white" />
          </button>

          {/* User Info */}
          <div className="flex items-center gap-2.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            {/* User Icon */}
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg font-bold text-xs flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>

            {/* Name + Role */}
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

          {/* Logout Button */}
          <button
            type="button"
            onClick={logout}
            title="Logout"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
          >
            <LogOut className="h-4 w-4" />

            <span className="hidden sm:inline">
              Logout
            </span>
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 shrink-0 hidden lg:flex text-slate-700">
          <div className="space-y-6">
            <div>
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Platform Modules
              </p>

              <nav className="space-y-1">
                {menuItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-indigo-50 text-indigo-600 font-bold border border-indigo-100 shadow-sm"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`h-4 w-4 ${
                            isActive
                              ? "text-indigo-600"
                              : "text-slate-400"
                          }`}
                        />

                        <span>{item.label}</span>
                      </div>

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

          {/* Settings */}
          <div className="border-t border-slate-200 pt-3">
            <Link
              href="/settings"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <Settings className="h-4 w-4 text-slate-400" />

              <span>System Settings</span>
            </Link>
          </div>
        </aside>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-slate-50 overflow-x-hidden">
          {children}
        </main>
      </div>
    </>
  );
}

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