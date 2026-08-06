"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
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
  MapPin,
  Clock,
  Mail,
  Languages,
  Factory,
  Globe2,
  ArrowLeft,
} from "lucide-react";

interface Vendor {
  id: number;
  company_name: string;
  business_description: string | null;
  country: string;
  industry: string | null;
  certification: string | null;
  production_capacity: string | null;
  export_countries: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  languages: string | null;
  rating: number;
  response_time_hours: number | null;
  is_verified: boolean;
}

const menuItems = [
  { label: "Buyer Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "AI Supplier Search", icon: Search, tag: "AI", href: "#" },
  { label: "Vendor Directory", icon: Store, href: "/vendors", active: true },
  { label: "Product Catalog", icon: PackageCheck, href: "/products" },
  { label: "RFQs & Quotes", icon: FileText, href: "#" },
  { label: "Order Management", icon: ShoppingBag, href: "#" },
  { label: "AI Assistant & Chat", icon: MessageSquare, href: "#" },
  { label: "Risk Analysis", icon: ShieldAlert, tag: "AI", href: "#" },
  { label: "Smart Documents", icon: FolderArchive, href: "#" },
  { label: "Ratings & Reviews", icon: Star, href: "#" },
  { label: "Platform Analytics", icon: BarChart3, href: "#" },
];

export default function VendorDetailPage() {
  const params = useParams();
  const vendorId = params?.id;

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!vendorId) return;
    fetch(`http://localhost:8000/vendors/${vendorId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Vendor not found");
        return res.json();
      })
      .then((data) => {
        setVendor(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [vendorId]);

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
          <div className="flex items-center gap-2.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg font-bold text-xs flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <div className="text-left hidden sm:block pr-2">
              <div className="flex items-center gap-1">
                <p className="text-xs font-bold text-slate-900 leading-none">Fatima</p>
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
              </div>
              <p className="text-[10px] text-indigo-600 font-semibold mt-0.5 leading-none">Buyer</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* LEFT SIDEBAR */}
        <aside className="w-64 bg-white border-r border-slate-200 h-[calc(100vh-4rem)] sticky top-16 flex flex-col justify-between p-4 shrink-0 hidden lg:flex text-slate-700 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Platform Modules
              </p>
              <nav className="space-y-1">
                {menuItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        item.active
                          ? "bg-indigo-50 text-indigo-600 font-bold border border-indigo-100 shadow-sm"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`h-4 w-4 ${item.active ? "text-indigo-600" : "text-slate-400"}`} />
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
          <div className="border-t border-slate-200 pt-3">
            <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all">
              <Settings className="h-4 w-4 text-slate-400" />
              <span>System Settings</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6 space-y-6 bg-slate-50 overflow-x-hidden">
          <Link
            href="/vendors"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Vendor Directory
          </Link>

          {loading && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-xs text-slate-500 font-medium">
              Loading vendor profile...
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-semibold">
              {error}
            </div>
          )}

          {!loading && !error && vendor && (
            <div className="space-y-6">
              {/* Profile header card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        {vendor.company_name}
                      </h2>
                      {vendor.is_verified && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-2 max-w-xl leading-relaxed">
                      {vendor.business_description || "No description provided."}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <Star className="h-4 w-4 text-amber-500" />
                        <span className="text-lg font-black text-slate-900">
                          {vendor.rating.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Rating</p>
                    </div>
                    {vendor.response_time_hours && (
                      <>
                        <div className="h-8 w-[1px] bg-slate-200"></div>
                        <div className="text-center">
                          <div className="flex items-center gap-1 justify-center">
                            <Clock className="h-4 w-4 text-indigo-600" />
                            <span className="text-lg font-black text-slate-900">
                              {vendor.response_time_hours}h
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Response</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Company Details
                  </h3>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-indigo-600 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Country</p>
                      <p className="text-sm font-semibold text-slate-800">{vendor.country}</p>
                    </div>
                  </div>

                  {vendor.industry && (
                    <div className="flex items-start gap-3">
                      <Factory className="h-4 w-4 text-indigo-600 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Industry</p>
                        <p className="text-sm font-semibold text-slate-800">{vendor.industry}</p>
                      </div>
                    </div>
                  )}

                  {vendor.production_capacity && (
                    <div className="flex items-start gap-3">
                      <PackageCheck className="h-4 w-4 text-indigo-600 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">
                          Production Capacity
                        </p>
                        <p className="text-sm font-semibold text-slate-800">
                          {vendor.production_capacity}
                        </p>
                      </div>
                    </div>
                  )}

                  {vendor.export_countries && (
                    <div className="flex items-start gap-3">
                      <Globe2 className="h-4 w-4 text-indigo-600 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">
                          Export Countries
                        </p>
                        <p className="text-sm font-semibold text-slate-800">
                          {vendor.export_countries}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Contact & Certification
                  </h3>

                  {vendor.certification && (
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="h-4 w-4 text-indigo-600 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">
                          Certification
                        </p>
                        <p className="text-sm font-semibold text-slate-800">
                          {vendor.certification}
                        </p>
                      </div>
                    </div>
                  )}

                  {vendor.contact_email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 text-indigo-600 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Email</p>
                        <p className="text-sm font-semibold text-slate-800">
                          {vendor.contact_email}
                        </p>
                      </div>
                    </div>
                  )}

                  {vendor.languages && (
                    <div className="flex items-start gap-3">
                      <Languages className="h-4 w-4 text-indigo-600 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">
                          Languages
                        </p>
                        <p className="text-sm font-semibold text-slate-800">{vendor.languages}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
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
