"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Tag, Boxes, Clock, Store, Package, Heart } from "lucide-react";
import AppShell from "@/components/UI/AppShell";

interface ProductItem {
  id: number;
  vendor_id: number;
  vendor_name: string | null;
  name: string;
  category: string | null;
  description: string | null;
  price_min: number | null;
  price_max: number | null;
  moq: number | null;
  lead_time_days: number | null;
  stock_available: number | null;
}

const WISHLIST_KEY = "vendorhub_wishlist_products";

export default function ProductDetail() {
  const params = useParams();
  const productId = params?.id;

  const [product, setProduct] = useState<ProductItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    if (!productId) return;
    fetch(`http://localhost:8000/products/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    const stored: number[] = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
    setInWishlist(stored.includes(Number(productId)));
  }, [productId]);

  const toggleWishlist = () => {
    const stored: number[] = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
    const id = Number(productId);
    const updated = stored.includes(id) ? stored.filter((v) => v !== id) : [...stored, id];
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
    setInWishlist(!inWishlist);
  };

  return (
    <AppShell activeHref="/products">
      <div className="flex items-center justify-between">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Product Catalog
        </Link>

        {product && (
          <button
            onClick={toggleWishlist}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              inWishlist
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${inWishlist ? "fill-rose-600" : ""}`} />
            {inWishlist ? "In Wishlist" : "Add to Wishlist"}
          </button>
        )}
      </div>

      {loading && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-xs text-slate-500 font-medium">
          Loading product...
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-semibold">
          {error}
        </div>
      )}

      {!loading && !error && product && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{product.name}</h2>
                  {product.category && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {product.category}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-2 max-w-xl leading-relaxed">
                  {product.description || "No description provided."}
                </p>
                {product.vendor_name && (
                  <Link
                    href={`/vendors/${product.vendor_id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 mt-3"
                  >
                    <Store className="h-3.5 w-3.5" />
                    Supplied by {product.vendor_name}
                  </Link>
                )}
              </div>

              {product.price_min !== null && product.price_max !== null && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-center">
                  <p className="text-lg font-black text-indigo-600">
                    ${product.price_min.toFixed(2)} - ${product.price_max.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Price Range (per unit)</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm text-center">
              <Boxes className="h-5 w-5 text-indigo-600 mx-auto mb-2" />
              <p className="text-lg font-black text-slate-900">
                {product.moq !== null ? product.moq.toLocaleString() : "-"}
              </p>
              <p className="text-[10px] text-slate-500 font-semibold uppercase mt-1">Minimum Order Qty</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm text-center">
              <Clock className="h-5 w-5 text-indigo-600 mx-auto mb-2" />
              <p className="text-lg font-black text-slate-900">
                {product.lead_time_days !== null ? `${product.lead_time_days} days` : "-"}
              </p>
              <p className="text-[10px] text-slate-500 font-semibold uppercase mt-1">Lead Time</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm text-center">
              <Package className="h-5 w-5 text-indigo-600 mx-auto mb-2" />
              <p className="text-lg font-black text-slate-900">
                {product.stock_available !== null ? product.stock_available.toLocaleString() : "-"}
              </p>
              <p className="text-[10px] text-slate-500 font-semibold uppercase mt-1">Stock Available</p>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
