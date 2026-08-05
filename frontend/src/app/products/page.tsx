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
  Tag,
  Boxes,
} from "lucide-react";

interface ProductItem {
  id: number;
  vendor_id: number;
  name: string;
  category: string | null;
  description: string | null;
  price_min: number | null;
  price_max: number | null;
  moq: number | null;
  lead_time_days: number | null;
  stock_available: number | null;
}

const menuItems = [
  { label: "Buyer Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "AI Supplier Search", icon: Search, tag: "AI", href: "#" },
  { label: "Vendor Directory", icon: Store, href: "/vendors" },
  { label: "Product Catalog", icon: PackageCheck, href: "/products", active: true },
  { label: "RFQs & Quotes", icon: FileText, href: "#" },
  { label: "Order Management", icon: ShoppingBag, href: "#" },
  { label: "AI Assistant & Chat", icon: MessageSquare, href: "#" },
  { label: "Risk Analysis", icon: ShieldAlert, tag: "AI", href: "#" },
  { label: "Smart Documents", icon: FolderArchive, href: "#" },
  { label: "Ratings & Reviews", icon: Star, href: "#" },
  { label: "Platform Analytics", icon: BarChart3, href: "#" },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/products/")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      p.name.toLowerCase().includes(term) ||
      (p.category || "").toLowerCase().includes(term) ||
      (p.description || "").toLowerCase().includes(term)
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
            placeholder="Search products by name or category..."
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
        {/* LEFT SIDEBAR — sticky/static, does not scroll away */}
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
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Product Catalog</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Browse products available from verified vendors
            </p>
          </div>

          {loading && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-xs text-slate-500 font-medium">
              Loading products...
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
              Showing {filteredProducts.length} of {products.length} products
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900">{product.name}</h3>
                    {product.category && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0 flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {product.category}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {product.description || "No description provided."}
                  </p>

                  <div className="flex items-baseline gap-2">
                    {product.price_min !== null && product.price_max !== null && (
                      <span className="text-lg font-black text-indigo-600">
                        ${product.price_min.toFixed(2)} - ${product.price_max.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-600">
                    {product.moq !== null && (
                      <span className="flex items-center gap-1">
                        <Boxes className="h-3.5 w-3.5 text-slate-400" />
                        MOQ: {product.moq.toLocaleString()}
                      </span>
                    )}
                    {product.lead_time_days !== null && (
                      <span className="text-slate-500 font-medium">
                        Lead time: {product.lead_time_days}d
                      </span>
                    )}
                    {product.stock_available !== null && (
                      <span className="col-span-2 text-slate-500 font-medium">
                        Stock available: {product.stock_available.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-xs text-slate-500 font-medium text-center">
                No products match your search.
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
