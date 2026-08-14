"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  ArrowLeft,
  Save,
  FileText,
  Boxes,
  Truck,
} from "lucide-react";

import { Card } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import { Input } from "@/components/UI/Input";
import {
  Select,
  FormSection,
} from "@/components/UI/FormControls";

export default function NewProductPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    price_min: "",
    price_max: "",
    moq: "",
    lead_time_days: "",
    stock_available: "",
  });

  // ============================================================
  // HANDLE INPUT CHANGES
  // ============================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // GET AUTH TOKEN
  // ============================================================

  const getAuthToken = (): string | null => {
    // Your authentication system stores the JWT as:
    // vendorhub_token

    const localToken = localStorage.getItem("vendorhub_token");

    const sessionToken =
      sessionStorage.getItem("vendorhub_token");

    const token = localToken || sessionToken;

    console.log("PRODUCT TOKEN:", token);

    return token;
  };

  // ============================================================
  // HANDLE FORM SUBMISSION
  // ============================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    // ----------------------------------------------------------
    // BASIC VALIDATION
    // ----------------------------------------------------------

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!form.category) {
      setError("Please select a category.");
      return;
    }

    try {
      setLoading(true);

      // --------------------------------------------------------
      // GET JWT TOKEN
      // --------------------------------------------------------

      const token = getAuthToken();

      if (!token) {
        setError(
          "You are not logged in. Please login again before adding a product."
        );

        setLoading(false);

        return;
      }

      // --------------------------------------------------------
      // API URL
      // --------------------------------------------------------

      const apiUrl = `${
        process.env.NEXT_PUBLIC_API_URL ||
        "http://127.0.0.1:8000"
      }/products/`;

      console.log("PRODUCT API URL:", apiUrl);

      // --------------------------------------------------------
      // PRODUCT DATA
      // --------------------------------------------------------

      const productData = {
        name: form.name.trim(),

        category: form.category,

        description: form.description.trim(),

        price_min: form.price_min
          ? Number(form.price_min)
          : null,

        price_max: form.price_max
          ? Number(form.price_max)
          : null,

        moq: form.moq
          ? Number(form.moq)
          : null,

        lead_time_days: form.lead_time_days
          ? Number(form.lead_time_days)
          : null,

        stock_available: form.stock_available
          ? Number(form.stock_available)
          : null,

        // Backend accepts null for category_id
        category_id: null,
      };

      console.log(
        "PRODUCT DATA:",
        productData
      );

      // --------------------------------------------------------
      // CREATE PRODUCT
      // --------------------------------------------------------

      const response = await fetch(apiUrl, {
        method: "POST",

        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",

          // IMPORTANT:
          // FastAPI expects:
          //
          // Authorization: Bearer <JWT>
          //
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(productData),
      });

      // --------------------------------------------------------
      // READ RESPONSE
      // --------------------------------------------------------

      const data = await response.json().catch(() => null);

      console.log(
        "PRODUCT RESPONSE STATUS:",
        response.status
      );

      console.log(
        "PRODUCT RESPONSE:",
        data
      );

      // --------------------------------------------------------
      // HANDLE HTTP ERRORS
      // --------------------------------------------------------

      if (!response.ok) {
        let message =
          "Failed to create product.";

        // 401
        if (response.status === 401) {
          message =
            data?.detail ||
            "Authentication failed. Please login again.";

          // Remove invalid token so the next login
          // can store a fresh one.
          localStorage.removeItem(
            "vendorhub_token"
          );

          sessionStorage.removeItem(
            "vendorhub_token"
          );
        }

        // 403
        else if (response.status === 403) {
          message =
            data?.detail ||
            "You do not have permission to create a product.";
        }

        // 404
        else if (response.status === 404) {
          message =
            data?.detail ||
            "Vendor profile not found.";
        }

        // 422 Validation Error
        else if (
          response.status === 422 &&
          Array.isArray(data?.detail)
        ) {
          message = data.detail
            .map((err: any) => {
              const field =
                Array.isArray(err?.loc) &&
                err.loc.length > 0
                  ? err.loc[err.loc.length - 1]
                  : "field";

              return `${field}: ${
                err?.msg || "Invalid value"
              }`;
            })
            .join(", ");
        }

        // Other errors
        else if (
          typeof data?.detail === "string"
        ) {
          message = data.detail;
        }

        throw new Error(message);
      }

      // --------------------------------------------------------
      // SUCCESS
      // --------------------------------------------------------

      console.log(
        "Product created successfully:",
        data
      );

      // Redirect to vendor products page
      router.push("/vendor/products");

    } catch (err) {
      console.error(
        "CREATE PRODUCT ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create product."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        <div className="flex items-center gap-3">

          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div>

            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
              Vendor Portal
            </p>

            <h2 className="text-2xl font-black text-slate-900">
              Add Product
            </h2>

            <p className="text-sm text-slate-500 font-medium mt-1">
              Add a new product to your vendor catalog.
            </p>

          </div>

        </div>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700">

          <p className="text-xs font-bold">
            {error}
          </p>

        </div>
      )}

      {/* =====================================================
          FORM
      ===================================================== */}

      <form onSubmit={handleSubmit}>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* =================================================
              MAIN DETAILS
          ================================================= */}

          <div className="xl:col-span-2">

            <Card
              title="Product Information"
              subtitle="Provide the basic information buyers will see."
            >

              <div className="space-y-5">

                <FormSection title="Basic Details">

                  <Input
                    label="Product Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Industrial Steel Sheets"
                    icon={
                      <Package className="h-4 w-4" />
                    }
                  />

                  <Select
                    label="Category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    options={[
                      {
                        label: "Select Category",
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

                </FormSection>

                {/* DESCRIPTION */}

                <div className="space-y-1.5">

                  <label className="block text-xs font-bold text-slate-700 tracking-wide uppercase">
                    Description
                  </label>

                  <div className="relative">

                    <div className="absolute left-3.5 top-3 text-slate-400">
                      <FileText className="h-4 w-4" />
                    </div>

                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Describe your product, specifications, materials, quality standards, etc."
                      rows={5}
                      className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
                    />

                  </div>

                </div>

                {/* PRICING */}

                <FormSection title="Pricing & Quantity">

                  <Input
                    label="Minimum Price"
                    name="price_min"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price_min}
                    onChange={handleChange}
                    placeholder="e.g. 120"
                  />

                  <Input
                    label="Maximum Price"
                    name="price_max"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price_max}
                    onChange={handleChange}
                    placeholder="e.g. 150"
                  />

                  <Input
                    label="Minimum Order Quantity"
                    name="moq"
                    type="number"
                    min="1"
                    value={form.moq}
                    onChange={handleChange}
                    placeholder="e.g. 100"
                    icon={
                      <Boxes className="h-4 w-4" />
                    }
                  />

                  <Input
                    label="Available Stock"
                    name="stock_available"
                    type="number"
                    min="0"
                    value={form.stock_available}
                    onChange={handleChange}
                    placeholder="e.g. 5000"
                  />

                </FormSection>

                {/* DELIVERY */}

                <FormSection title="Delivery">

                  <Input
                    label="Lead Time"
                    name="lead_time_days"
                    type="number"
                    min="0"
                    value={form.lead_time_days}
                    onChange={handleChange}
                    placeholder="Number of days"
                    icon={
                      <Truck className="h-4 w-4" />
                    }
                  />

                </FormSection>

              </div>

            </Card>

          </div>

          {/* =================================================
              SIDE PANEL
          ================================================= */}

          <div className="space-y-6">

            <Card
              title="Product Listing"
              subtitle="Review before publishing"
            >

              <div className="space-y-4">

                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">

                  <div className="flex items-center gap-3">

                    <div className="p-2.5 rounded-xl bg-white text-indigo-600">
                      <Package className="h-5 w-5" />
                    </div>

                    <div>

                      <p className="text-xs font-black text-slate-900">
                        Vendor Product
                      </p>

                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        Your product will be visible to buyers.
                      </p>

                    </div>

                  </div>

                </div>

                <div className="space-y-2">

                  <div className="flex items-center justify-between">

                    <span className="text-xs font-medium text-slate-500">
                      Product
                    </span>

                    <span className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
                      {form.name || "Not specified"}
                    </span>

                  </div>

                  <div className="flex items-center justify-between">

                    <span className="text-xs font-medium text-slate-500">
                      Category
                    </span>

                    <span className="text-xs font-bold text-slate-900">
                      {form.category || "Not specified"}
                    </span>

                  </div>

                  <div className="flex items-center justify-between">

                    <span className="text-xs font-medium text-slate-500">
                      MOQ
                    </span>

                    <span className="text-xs font-bold text-slate-900">
                      {form.moq || "Not specified"}
                    </span>

                  </div>

                </div>

              </div>

            </Card>

            {/* PUBLISH */}

            <Card
              title="Publish Product"
              subtitle="Save this product to your catalog."
            >

              <div className="space-y-3">

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  className="w-full"
                >
                  <Save className="h-4 w-4" />

                  {loading
                    ? "Saving Product..."
                    : "Save Product"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="w-full"
                  onClick={() =>
                    router.push("/vendor/products")
                  }
                >
                  Cancel
                </Button>

              </div>

            </Card>

          </div>

        </div>

      </form>

    </div>
  );
}