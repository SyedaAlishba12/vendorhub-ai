"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Package,
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

import { getStoredToken } from "@/context/AuthContext";

interface ProductForm {
  name: string;
  category: string;
  description: string;
  price_min: string;
  price_max: string;
  moq: string;
  lead_time_days: string;
  stock_available: string;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<ProductForm>({
    name: "",
    category: "",
    description: "",
    price_min: "",
    price_max: "",
    moq: "",
    lead_time_days: "",
    stock_available: "",
  });

  // =====================================================
  // LOAD PRODUCT
  // =====================================================

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);

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

        setForm({
          name: data.name || "",
          category: data.category || "",
          description: data.description || "",
          price_min:
            data.price_min != null
              ? String(data.price_min)
              : "",
          price_max:
            data.price_max != null
              ? String(data.price_max)
              : "",
          moq:
            data.moq != null
              ? String(data.moq)
              : "",
          lead_time_days:
            data.lead_time_days != null
              ? String(data.lead_time_days)
              : "",
          stock_available:
            data.stock_available != null
              ? String(data.stock_available)
              : "",
        });
      } catch (err) {
        console.error(
          "LOAD PRODUCT ERROR:",
          err
        );

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
      loadProduct();
    }
  }, [productId]);

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // UPDATE PRODUCT
  // =====================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!form.category) {
      setError("Please select a category.");
      return;
    }

    try {
      setSaving(true);

      const token = getStoredToken();

      if (!token) {
        setError(
          "Authentication token not found. Please login again."
        );
        return;
      }

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
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/products/${productId}`,
        {
          method: "PUT",

          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(productData),
        }
      );

      const data = await response.json().catch(() => null);

      console.log(
        "UPDATE PRODUCT STATUS:",
        response.status
      );

      console.log(
        "UPDATE PRODUCT RESPONSE:",
        data
      );

      if (!response.ok) {
        let message =
          "Failed to update product.";

        if (typeof data?.detail === "string") {
          message = data.detail;
        } else if (
          Array.isArray(data?.detail)
        ) {
          message = data.detail
            .map(
              (err: any) =>
                `${err?.loc?.at(-1) || "field"}: ${
                  err?.msg || "Invalid value"
                }`
            )
            .join(", ");
        }

        throw new Error(message);
      }

      router.push("/vendor/products");
      router.refresh();

    } catch (err) {
      console.error(
        "UPDATE PRODUCT ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update product."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-xs font-semibold text-slate-400">
          Loading product...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex items-center gap-3">

        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div>

          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Vendor Portal
          </p>

          <h2 className="text-2xl font-black text-slate-900">
            Edit Product
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Update your product information.
          </p>

        </div>

      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700">
          <p className="text-xs font-bold">
            {error}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>

        <Card
          title="Product Information"
          subtitle="Update the details of your product."
        >

          <div className="space-y-5">

            <FormSection title="Basic Details">

              <Input
                label="Product Name"
                name="name"
                value={form.name}
                onChange={handleChange}
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

            <div className="space-y-1.5">

              <label className="block text-xs font-bold text-slate-700 uppercase">
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
                  rows={5}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
                />

              </div>

            </div>

            <FormSection title="Pricing & Quantity">

              <Input
                label="Minimum Price"
                name="price_min"
                type="number"
                min="0"
                step="0.01"
                value={form.price_min}
                onChange={handleChange}
              />

              <Input
                label="Maximum Price"
                name="price_max"
                type="number"
                min="0"
                step="0.01"
                value={form.price_max}
                onChange={handleChange}
              />

              <Input
                label="Minimum Order Quantity"
                name="moq"
                type="number"
                min="1"
                value={form.moq}
                onChange={handleChange}
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
              />

            </FormSection>

            <FormSection title="Delivery">

              <Input
                label="Lead Time"
                name="lead_time_days"
                type="number"
                min="0"
                value={form.lead_time_days}
                onChange={handleChange}
                icon={
                  <Truck className="h-4 w-4" />
                }
              />

            </FormSection>

            <div className="flex justify-end gap-3 pt-3">

              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() =>
                  router.push(
                    "/vendor/products"
                  )
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={saving}
              >
                <Save className="h-4 w-4" />
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </Button>

            </div>

          </div>

        </Card>

      </form>

    </div>
  );
}