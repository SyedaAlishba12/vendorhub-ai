"use client";

import { useEffect, useState } from "react";
import { EyeOff, Eye, Star } from "lucide-react";
import AppShell from "@/components/UI/AppShell";

interface Vendor {
  id: number;
  company_name: string;
  is_hidden: boolean;
  is_featured: boolean;
}

interface ProductItem {
  id: number;
  name: string;
  vendor_name: string | null;
  is_hidden: boolean;
  is_featured: boolean;
}

export default function ModerationPanel() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"vendors" | "products">("vendors");

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      fetch("http://localhost:8000/vendors/").then((r) => r.json()),
      fetch("http://localhost:8000/products/").then((r) => r.json()),
    ]).then(([v, p]) => {
      setVendors(v);
      setProducts(p);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const toggleVendorHidden = async (id: number, current: boolean) => {
    await fetch(`http://localhost:8000/vendors/${id}/moderate?is_hidden=${!current}`, { method: "PUT" });
    fetchAll();
  };

  const toggleVendorFeatured = async (id: number, current: boolean) => {
    await fetch(`http://localhost:8000/vendors/${id}/feature?is_featured=${!current}`, { method: "PUT" });
    fetchAll();
  };

  const toggleProductHidden = async (id: number, current: boolean) => {
    await fetch(`http://localhost:8000/products/${id}/moderate?is_hidden=${!current}`, { method: "PUT" });
    fetchAll();
  };

  const toggleProductFeatured = async (id: number, current: boolean) => {
    await fetch(`http://localhost:8000/products/${id}/feature?is_featured=${!current}`, { method: "PUT" });
    fetchAll();
  };

  return (
    <AppShell activeHref="/admin/moderation">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Vendor & Product Moderation</h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Flag/hide listings and manage featured vendors & products (Admin — Module 18 Part 3)
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab("vendors")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === "vendors" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          Vendors
        </button>
        <button
          onClick={() => setTab("products")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === "products" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          Products
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-xs text-slate-500 font-medium">
          Loading...
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left font-bold text-slate-500 uppercase text-[10px] tracking-wide px-4 py-3">
                  {tab === "vendors" ? "Vendor" : "Product"}
                </th>
                {tab === "products" && (
                  <th className="text-left font-bold text-slate-500 uppercase text-[10px] tracking-wide px-4 py-3">
                    Vendor
                  </th>
                )}
                <th className="text-left font-bold text-slate-500 uppercase text-[10px] tracking-wide px-4 py-3">
                  Visibility
                </th>
                <th className="text-left font-bold text-slate-500 uppercase text-[10px] tracking-wide px-4 py-3">
                  Featured
                </th>
              </tr>
            </thead>
            <tbody>
              {tab === "vendors"
                ? vendors.map((v) => (
                    <tr key={v.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-bold text-slate-800">{v.company_name}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleVendorHidden(v.id, v.is_hidden)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            v.is_hidden
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {v.is_hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          {v.is_hidden ? "Hidden" : "Visible"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleVendorFeatured(v.id, v.is_featured)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            v.is_featured
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}
                        >
                          <Star className="h-3 w-3" />
                          {v.is_featured ? "Featured" : "Not Featured"}
                        </button>
                      </td>
                    </tr>
                  ))
                : products.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-bold text-slate-800">{p.name}</td>
                      <td className="px-4 py-3 text-slate-500 font-medium">{p.vendor_name || "-"}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleProductHidden(p.id, p.is_hidden)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            p.is_hidden
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {p.is_hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          {p.is_hidden ? "Hidden" : "Visible"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleProductFeatured(p.id, p.is_featured)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            p.is_featured
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}
                        >
                          <Star className="h-3 w-3" />
                          {p.is_featured ? "Featured" : "Not Featured"}
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
