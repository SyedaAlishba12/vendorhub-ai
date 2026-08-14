"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Clock,
  Boxes,
  Truck,
} from "lucide-react";

import { Card } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import { getStoredToken } from "@/context/AuthContext";

interface Product {
  id: number;
  vendor_id: number;
  name: string;
  category?: string;
  description?: string;
  price_min?: number;
  price_max?: number;
  moq?: number;
  lead_time_days?: number;
  stock_available?: number;
  is_hidden?: boolean;
  is_featured?: boolean;
}

export default function ProductViewPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const productId = params.id;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getStoredToken();

        if (!token) {
          setError(
            "You are not logged in. Please login again."
          );
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/products/${productId}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            typeof data?.detail === "string"
              ? data.detail
              : "Failed to load product."
          );
        }

        setProduct(data);
      } catch (err) {
        console.error("VIEW PRODUCT ERROR:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load product."
        );
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-xs font-semibold text-slate-400">
          Loading product...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700">
          <p className="text-xs font-bold">
            {error || "Product not found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div>
            <p className="text-xs font-bold text-indigo-600 uppercase">
              Vendor Portal
            </p>

            <h2 className="text-2xl font-black text-slate-900">
              Product Details
            </h2>
          </div>

        </div>

        <Link
          href={`/vendor/products/${product.id}/edit`}
        >
          <Button variant="primary" size="sm">
            <Edit className="h-4 w-4" />
            Edit Product
          </Button>
        </Link>

      </div>

      <Card
        title={product.name}
        subtitle={product.category || "Uncategorized"}
      >

        <div className="space-y-6">

          <div className="p-5 rounded-xl bg-indigo-50 border border-indigo-100">
            <Package className="h-8 w-8 text-indigo-600 mb-3" />

            <h3 className="text-lg font-black text-slate-900">
              {product.name}
            </h3>

            <p className="text-sm text-slate-500 mt-2">
              {product.description ||
                "No description provided."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            <div className="p-4 rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Price
              </p>
              <p className="text-sm font-black text-slate-900 mt-2">
                {product.price_min != null
                  ? `$${product.price_min}`
                  : "-"}
                {product.price_max != null &&
                  ` - $${product.price_max}`}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200">
              <Boxes className="h-4 w-4 text-indigo-600" />
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">
                MOQ
              </p>
              <p className="text-sm font-black text-slate-900 mt-1">
                {product.moq ?? "-"}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200">
              <Truck className="h-4 w-4 text-indigo-600" />
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">
                Lead Time
              </p>
              <p className="text-sm font-black text-slate-900 mt-1">
                {product.lead_time_days != null
                  ? `${product.lead_time_days} days`
                  : "-"}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Stock
              </p>
              <p className="text-sm font-black text-slate-900 mt-2">
                {product.stock_available ?? "-"}
              </p>
            </div>

          </div>

          <div className="flex gap-3">

            <Link
              href={`/vendor/products/${product.id}/edit`}
            >
              <Button variant="primary" size="sm">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push("/vendor/products")
              }
            >
              Back to Products
            </Button>

          </div>

        </div>

      </Card>
    </div>
  );
}