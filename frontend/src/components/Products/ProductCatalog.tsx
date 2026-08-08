"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tag, Boxes, SlidersHorizontal, X, Heart } from "lucide-react";
import AppShell from "@/components/UI/AppShell";

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

const CATEGORIES = [
  "Apparel", "Textile", "Leather & Apparel", "Metal & Steel", "Renewable Energy",
  "Electronics", "Household Goods", "Furniture", "Food & Agriculture",
];

const PAGE_SIZE = 6;
const WISHLIST_KEY = "vendorhub_wishlist_products";

export default function ProductCatalog() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [wishlist, setWishlist] = useState<number[]>([]);

  const [category, setCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [maxMoq, setMaxMoq] = useState("");
  const [page, setPage] = useState(1);
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
    setWishlist(stored);
  }, []);

  const toggleWishlist = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = wishlist.includes(productId)
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];
    setWishlist(updated);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
  };

  const fetchProducts = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (maxPrice) params.append("max_price", maxPrice);
    if (maxMoq) params.append("max_moq", maxMoq);

    fetch(`http://localhost:8000/products/?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setPage(1);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, maxPrice, maxMoq]);

  const clearFilters = () => {
    setCategory("");
    setMaxPrice("");
    setMaxMoq("");
  };

  const hasActiveFilters = category || maxPrice || maxMoq;

  const filteredProducts = products
    .filter((p) => {
      const term = searchTerm.toLowerCase().trim();
      if (!term) return true;
      return (
        p.name.toLowerCase().includes(term) ||
        (p.category || "").toLowerCase().includes(term) ||
        (p.description || "").toLowerCase().includes(term)
      );
    })
    .filter((p) => (showWishlistOnly ? wishlist.includes(p.id) : true));

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const pagedProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AppShell
      activeHref="/products"
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Search products by name or category..."
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Product Catalog</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Browse products available from verified vendors
          </p>
        </div>
        <button
          onClick={() => {
            setShowWishlistOnly((v) => !v);
            setPage(1);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            showWishlistOnly
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${showWishlistOnly ? "fill-rose-600" : ""}`} />
          Wishlist ({wishlist.length})
        </button>
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
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
              Max Price ($)
            </label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="e.g. 50"
              className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
              Max MOQ
            </label>
            <input
              type="number"
              value={maxMoq}
              onChange={(e) => setMaxMoq(e.target.value)}
              placeholder="e.g. 1000"
              className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder:text-slate-400"
            />
          </div>
        </div>
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
            Showing {pagedProducts.length} of {filteredProducts.length} products
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {pagedProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="block bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 hover:shadow-md hover:border-indigo-200 transition-all relative"
              >
                <button
                  onClick={(e) => toggleWishlist(e, product.id)}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 transition-colors z-10"
                >
                  <Heart
                    className={`h-3.5 w-3.5 ${
                      wishlist.includes(product.id) ? "fill-rose-600 text-rose-600" : "text-slate-400"
                    }`}
                  />
                </button>

                <div className="flex items-start justify-between gap-2 pr-6">
                  <h3 className="text-sm font-extrabold text-slate-900">{product.name}</h3>
                </div>

                {product.category && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    <Tag className="h-3 w-3" />
                    {product.category}
                  </span>
                )}

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
                </div>
              </Link>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-xs text-slate-500 font-medium text-center">
              {showWishlistOnly ? "No products in your wishlist yet." : "No products match your search."}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    page === p ? "bg-indigo-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
