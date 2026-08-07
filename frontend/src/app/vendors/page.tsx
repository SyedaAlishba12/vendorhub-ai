"use client";

import { useEffect, useState } from "react";
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
  SlidersHorizontal,
  X,
  Zap,
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
  languages: string | null;
  rating: number;
  response_time_hours: number | null;
  is_verified: boolean;
  match_score: number | null;
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

const COUNTRIES = ["Pakistan", "Turkey", "China", "UAE", "Bangladesh", "Vietnam", "India", "Germany"];

function getMatchColor(score: number) {
  if (score >= 85) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (score >= 70) return "bg-indigo-50 text-indigo-700 border-indigo-200";
  if (score >= 50) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [country, setCountry] = useState("");
  const [certification, setCertification] = useState("");
  const [minRating, setMinRating] = useState("");

  const fetchVendors = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (country) params.append("country", country);
    if (certification) params.append("certification", certification);
    if (minRating) params.append("min_rating", minRating);

    fetch(`http://localhost:8000/vendors/?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch vendors");
        return res.json();
      })
      .then((data) => {
        const sorted = [...data].sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
        setVendors(sorted);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, certification, minRating]);

  const clearFilters = () => {
    setCountry("");
    setCertification("");
    setMinRating("");
  };

  const hasActiveFilters = country || certification || minRating;

  const filteredVendors = vendors.filter((v) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      v.company_name.toLowerCase().includes(term) ||
      v.country.toLowerCase().includes(term) ||
      (v.industry || "").toLowerCase().includes(term) ||
      (v.certification || "").toLowerCase().includes(term)
    );
  });

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

        <div className="hidden md:flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-1.5 w-80 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search vendors by name, country, certification..."
            className="bg-transparent text-xs text-slate-700 outline-none w-full placeholder:text-slate-400 font-medium"
          />
        </div>

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
        {/* LEFT SIDEBAR — sticky/static */}
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
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Verified Vendors</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Browse suppliers and manufacturers on VendorHub AI — sorted by AI Match Score
            </p>
          </div>

          {/* FILTER BAR */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-700">Filters</span>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700"
                >
                  <X className="h-3 w-3" />
                  Clear filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Country
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="">All Countries</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Certification
                </label>
                <input
                  type="text"
                  value={certification}
                  onChange={(e) => setCertification(e.target.value)}
                  placeholder="e.g. ISO 9001"
                  className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Minimum Rating
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                </select>
              </div>
            </div>
          </div>

          {loading && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-xs text-slate-500 font-medium">
              Loading vendors...
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-semibold">
              Error: {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <p className="text-[11px] text-slate-400 font-semibold">
                Showing {filteredVendors.length} of {vendors.length} vendors
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredVendors.map((vendor) => (
                  <Link
                    key={vendor.id}
                    href={`/vendors/${vendor.id}`}
                    className="block bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 hover:shadow-md hover:border-indigo-200 transition-all relative"
                  >
                    {vendor.match_score !== null && (
                      <div
                        className={`absolute -top-2.5 -right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border shadow-sm ${getMatchColor(
                          vendor.match_score
                        )}`}
                      >
                        <Zap className="h-3 w-3" />
                        {vendor.match_score}% Match
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-extrabold text-slate-900">{vendor.company_name}</h3>
                      {vendor.is_verified && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          Verified
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      {vendor.business_description || "No description provided."}
                    </p>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-semibold">
                      <MapPin className="h-3.5 w-3.5 text-indigo-600" />
                      {vendor.country}
                      {vendor.industry && <span className="text-slate-400 font-medium"> · {vendor.industry}</span>}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {vendor.certification && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {vendor.certification}
                        </span>
                      )}
                      {vendor.production_capacity && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {vendor.production_capacity}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-600">
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-500" />
                        {vendor.rating.toFixed(1)}
                      </span>
                      {vendor.response_time_hours && (
                        <span className="flex items-center gap-1 text-slate-500 font-medium">
                          <Clock className="h-3.5 w-3.5" />
                          ~{vendor.response_time_hours}h response
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              {filteredVendors.length === 0 && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-xs text-slate-500 font-medium text-center">
                  No vendors match your search.
                </div>
              )}
            </>
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