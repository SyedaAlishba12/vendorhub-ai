"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Bell, User, ShieldCheck, Settings, LogOut } from "lucide-react";
import { menuItems, adminMenuItems } from "@/constants/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  // Don't wrap the login/signup pages in the dashboard chrome
  if (pathname === "/login" || pathname === "/signup") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased">
      {/* TOP NAVBAR */}
      <header className="h-16 border-b border-slate-200 bg-white text-slate-900 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md shadow-indigo-200">
            <Sparkles className="h-5 w-5 font-bold" />
          </div>
          <div>
            <h1 className="font-black text-slate-900 text-base tracking-tight leading-none">
              VendorHub <span className="text-indigo-600">AI</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide mt-0.5">
              Find the Right Supplier. Faster. Smarter.
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white"></span>
          </button>
          <div className="h-6 w-[1px] bg-slate-200 hidden sm:block"></div>

          {loading ? (
            <div className="w-32 h-9 bg-slate-100 rounded-xl animate-pulse"></div>
          ) : user ? (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-2.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                <div className="bg-indigo-600 text-white p-1.5 rounded-lg font-bold text-xs flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <div className="text-left hidden sm:block pr-2">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-slate-900 leading-none">{user.name}</p>
                    <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                  <p className="text-[10px] text-indigo-600 font-semibold mt-0.5 leading-none capitalize">
                    {user.role}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                title="Log out"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Log In
            </Link>
          )}
        </div>
      </header>

      <div className="flex flex-1">
        {/* LEFT SIDEBAR — active state auto-detected from current URL */}
        <aside className="w-64 bg-white border-r border-slate-200 h-[calc(100vh-4rem)] sticky top-16 flex flex-col justify-between p-4 shrink-0 hidden lg:flex text-slate-700 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Platform Modules
              </p>
              <nav className="space-y-1">
                {menuItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = item.href === pathname;
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
                        <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
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

            <div>
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Admin (temporary)
              </p>
              <nav className="space-y-1">
                {adminMenuItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = item.href === pathname;
                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-amber-50 text-amber-700 font-bold border border-amber-100 shadow-sm"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`h-4 w-4 ${isActive ? "text-amber-600" : "text-slate-400"}`} />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-3">
            <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all">
              <Settings className="h-4 w-4 text-slate-400" />
              <span>System Settings</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6 space-y-6 bg-slate-50 overflow-x-hidden">{children}</main>
      </div>

      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-xs text-slate-500 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span className="font-bold text-slate-800">VendorHub AI</span>
            <span>© 2026 — AI Smart B2B Sourcing System</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
