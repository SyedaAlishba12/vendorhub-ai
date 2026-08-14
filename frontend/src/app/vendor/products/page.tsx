"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
} from "lucide-react";

import { Card } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import { Input } from "@/components/UI/Input";
import { Select } from "@/components/UI/FormControls";

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
  vendor_name?: string;
}

export default function VendorProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // FETCH MY PRODUCTS
  // =====================================================

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getStoredToken();

      console.log("PRODUCT PAGE TOKEN:", token);

      if (!token) {
        setError(
          "You are not logged in. Please login again."
        );
        return;
      }

      const params = new URLSearchParams();

      if (category) {
        params.append("category", category);
      }

      const apiUrl =
        `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}` +
        `/products/my`;

      console.log("PRODUCT PAGE API:", apiUrl);

      const response = await fetch(
        `${apiUrl}?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => null);

      console.log(
        "PRODUCT PAGE STATUS:",
        response.status
      );

      console.log(
        "PRODUCT PAGE RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          typeof data?.detail === "string"
            ? data.detail
            : "Failed to fetch products."
        );
      }

      setProducts(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "FETCH PRODUCTS ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD PRODUCTS
  // =====================================================

  useEffect(() => {
    fetchProducts();
  }, [category]);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredProducts = products.filter(
    (product) =>
      product.name
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  // =====================================================
  // DELETE PRODUCT
  // =====================================================

  const deleteProduct = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      const token = getStoredToken();

      console.log(
        "DELETE PRODUCT TOKEN:",
        token
      );

      if (!token) {
        alert(
          "Authentication token not found. Please login again."
        );
        return;
      }

      const apiUrl =
        `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}` +
        `/products/${id}`;

      const response = await fetch(apiUrl, {
        method: "DELETE",

        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      console.log(
        "DELETE PRODUCT STATUS:",
        response.status
      );

      console.log(
        "DELETE PRODUCT RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          typeof data?.detail === "string"
            ? data.detail
            : "Failed to delete product."
        );
      }

      // Remove from UI immediately
      setProducts((prev) =>
        prev.filter(
          (product) => product.id !== id
        )
      );
    } catch (err) {
      console.error(
        "DELETE PRODUCT ERROR:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Failed to delete product."
      );
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        <div>
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            Vendor Portal
          </p>

          <h2 className="text-2xl font-black text-slate-900">
            My Products
          </h2>

          <p className="text-sm text-slate-500 font-medium mt-1">
            Manage the products you offer to buyers.
          </p>
        </div>

        <Link href="/vendor/products/new">
          <Button
            variant="primary"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </Link>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700">

          <AlertCircle className="h-4 w-4" />

          <p className="text-xs font-semibold">
            {error}
          </p>

        </div>
      )}

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="md:col-span-2">

            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              icon={
                <Search className="h-4 w-4" />
              }
            />

          </div>

          <Select
            label="Category"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            options={[
              {
                label: "All Categories",
                value: "",
              },
              {
                label: "Raw Materials",
                value: "Raw Materials",
              },
              {
                label: "Textiles",
                value: "Textiles",
              },
              {
                label: "Packaging",
                value: "Packaging",
              },
              {
                label: "Electronics",
                value: "Electronics",
              },
              {
                label: "Machinery",
                value: "Machinery",
              },
            ]}
          />

        </div>

      </Card>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <Card>

          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Total Products
          </p>

          <h3 className="text-2xl font-black text-slate-900 mt-2">
            {products.length}
          </h3>

        </Card>

        <Card>

          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Active Products
          </p>

          <h3 className="text-2xl font-black text-emerald-600 mt-2">
            {
              products.filter(
                (p) => !p.is_hidden
              ).length
            }
          </h3>

        </Card>

        <Card>

          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Featured Products
          </p>

          <h3 className="text-2xl font-black text-indigo-600 mt-2">
            {
              products.filter(
                (p) => p.is_featured
              ).length
            }
          </h3>

        </Card>

      </div>

      {/* =====================================================
          PRODUCT CATALOG
      ===================================================== */}

      <Card
        title="Product Catalog"
        subtitle="Products currently listed on VendorHub AI"
        badge={`${filteredProducts.length} Products`}
      >

        {loading ? (

          <div className="py-12 text-center">

            <p className="text-xs font-semibold text-slate-400">
              Loading products...
            </p>

          </div>

        ) : filteredProducts.length === 0 ? (

          <div className="py-12 text-center">

            <div className="mx-auto w-fit p-3 rounded-xl bg-slate-100 text-slate-400">

              <Package className="h-6 w-6" />

            </div>

            <h3 className="text-sm font-bold text-slate-700 mt-3">
              No products found
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              Try changing your search or add a new product.
            </p>

            <div className="mt-4">

              <Link href="/vendor/products/new">

                <Button
                  variant="primary"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>

              </Link>

            </div>

          </div>

        ) : (

          <div className="space-y-3">

            {filteredProducts.map(
              (product) => (

                <div
                  key={product.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
                >

                  {/* PRODUCT INFO */}

                  <div className="flex items-start gap-3 min-w-0">

                    <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">

                      <Package className="h-5 w-5" />

                    </div>

                    <div className="min-w-0">

                      <div className="flex items-center gap-2 flex-wrap">

                        <h4 className="text-sm font-extrabold text-slate-900">
                          {product.name}
                        </h4>

                        {product.is_featured && (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-[9px] font-bold">
                            Featured
                          </span>
                        )}

                        {product.is_hidden && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100 text-[9px] font-bold">
                            Hidden
                          </span>
                        )}

                      </div>

                      <p className="text-[11px] text-slate-400 font-medium mt-1">
                        {product.category ||
                          "Uncategorized"}
                      </p>

                      {product.description && (
                        <p className="text-xs text-slate-500 mt-1 max-w-xl truncate">
                          {product.description}
                        </p>
                      )}

                    </div>

                  </div>

                  {/* PRODUCT DETAILS */}

                  <div className="grid grid-cols-3 gap-5 lg:gap-8">

                    <div>

                      <p className="text-[9px] font-bold text-slate-400 uppercase">
                        Price
                      </p>

                      <p className="text-xs font-black text-slate-900 mt-1">

                        {product.price_min != null
                          ? `$${product.price_min}`
                          : "-"}

                        {product.price_max != null &&
                          ` - $${product.price_max}`}

                      </p>

                    </div>

                    <div>

                      <p className="text-[9px] font-bold text-slate-400 uppercase">
                        MOQ
                      </p>

                      <p className="text-xs font-black text-slate-900 mt-1">
                        {product.moq ?? "-"}
                      </p>

                    </div>

                    <div>

                      <p className="text-[9px] font-bold text-slate-400 uppercase">
                        Stock
                      </p>

                      <p className="text-xs font-black text-slate-900 mt-1">
                        {product.stock_available ?? "-"}
                      </p>

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="flex items-center gap-2">

                    <Link
                      href={`/vendor/products/${product.id}`}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Button>
                    </Link>

                    <Link
                      href={`/vendor/products/${product.id}/edit`}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </Link>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        deleteProduct(
                          product.id
                        )
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </Card>

    </div>
  );
}