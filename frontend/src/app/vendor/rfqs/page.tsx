"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Eye,
  Clock,
  RefreshCw,
} from "lucide-react";

import { Card } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import { getStoredToken } from "@/context/AuthContext";

interface VendorRFQ {
  assignment_id: number;
  rfq_id: number;
  rfq_ref: string;
  product_name: string;
  category: string;
  quantity: number;
  unit?: string | null;
  material?: string | null;
  budget?: number | null;
  delivery_date?: string | null;
  payment_terms?: string | null;
  shipping_method?: string | null;
  description?: string | null;
  rfq_status: string;
  vendor_status: string;
  sent_at?: string | null;
  responded_at?: string | null;
}

export default function VendorRFQPage() {
  const [rfqs, setRfqs] = useState<VendorRFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const fetchRFQs = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getStoredToken();

      if (!token) {
        setError("Authentication token not found. Please login again.");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/rfq/vendor/my-rfqs`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => null);

      console.log("VENDOR RFQS STATUS:", response.status);
      console.log("VENDOR RFQS:", data);

      if (!response.ok) {
        throw new Error(
          typeof data?.detail === "string"
            ? data.detail
            : "Failed to load RFQs."
        );
      }

      setRfqs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("FETCH VENDOR RFQS ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load RFQs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQs();
  }, []);

  const pendingCount = rfqs.filter(
    (rfq) =>
      !rfq.responded_at &&
      rfq.vendor_status !== "RESPONDED"
  ).length;

  const respondedCount = rfqs.filter(
    (rfq) =>
      Boolean(rfq.responded_at) ||
      rfq.vendor_status === "RESPONDED"
  ).length;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            Vendor Portal
          </p>

          <h1 className="text-2xl font-black text-slate-900">
            Incoming RFQs
          </h1>

          <p className="text-sm text-slate-500 font-medium mt-1">
            Review RFQs sent to your company and respond to buyer requests.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchRFQs}
          disabled={loading}
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loading ? "animate-spin" : ""
            }`}
          />
          Refresh
        </Button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <Card>
          <p className="text-xs font-bold text-slate-400 uppercase">
            Total RFQs
          </p>

          <h2 className="text-2xl font-black text-slate-900 mt-2">
            {loading ? "..." : rfqs.length}
          </h2>
        </Card>

        <Card>
          <p className="text-xs font-bold text-slate-400 uppercase">
            Need Response
          </p>

          <h2 className="text-2xl font-black text-amber-600 mt-2">
            {loading ? "..." : pendingCount}
          </h2>
        </Card>

        <Card>
          <p className="text-xs font-bold text-slate-400 uppercase">
            Responded
          </p>

          <h2 className="text-2xl font-black text-emerald-600 mt-2">
            {loading ? "..." : respondedCount}
          </h2>
        </Card>

      </div>

      {/* ERROR */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
          <p className="text-sm font-bold">
            {error}
          </p>
        </div>
      )}

      {/* CONTENT */}
      <Card
        title="RFQ Requests"
        subtitle="Requests sent to your vendor account"
        badge={`${rfqs.length} RFQs`}
      >
        {loading ? (

          <div className="py-12 text-center">
            <RefreshCw className="h-6 w-6 mx-auto text-indigo-500 animate-spin" />

            <p className="text-sm font-semibold text-slate-400 mt-3">
              Loading RFQs...
            </p>
          </div>

        ) : rfqs.length === 0 ? (

          <div className="py-12 text-center">
            <ClipboardList className="h-10 w-10 mx-auto text-slate-300" />

            <p className="text-sm font-bold text-slate-600 mt-3">
              No RFQs received
            </p>

            <p className="text-xs text-slate-400 mt-1">
              RFQs sent by buyers will appear here.
            </p>
          </div>

        ) : (

          <div className="space-y-3">

            {rfqs.map((rfq) => {
              const hasResponded =
                Boolean(rfq.responded_at) ||
                rfq.vendor_status === "RESPONDED";

              return (
                <div
                  key={rfq.assignment_id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
                >

                  {/* RFQ INFORMATION */}
                  <div className="flex items-start gap-3 min-w-0">

                    <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                      <ClipboardList className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">

                      <div className="flex items-center gap-2 flex-wrap">

                        <h3 className="text-sm font-extrabold text-slate-900">
                          {rfq.product_name}
                        </h3>

                        <span
                          className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${
                            hasResponded
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-amber-50 text-amber-700 border-amber-100"
                          }`}
                        >
                          {hasResponded
                            ? "RESPONDED"
                            : rfq.vendor_status || "SENT"}
                        </span>

                      </div>

                      <p className="text-[11px] text-slate-400 font-medium mt-1">
                        {rfq.rfq_ref} · {rfq.quantity}{" "}
                        {rfq.unit || "units"} · {rfq.category}
                      </p>

                      {rfq.delivery_date && (
                        <p className="text-[11px] text-slate-500 font-semibold mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />

                          Required by{" "}
                          {new Date(
                            rfq.delivery_date
                          ).toLocaleDateString()}
                        </p>
                      )}

                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex items-center gap-2 shrink-0">

                    <Link href={`/vendor/rfqs/${rfq.rfq_id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Button>
                    </Link>

                    {!hasResponded && (
                      <Link href={`/vendor/rfqs/${rfq.rfq_id}`}>
                        <Button variant="primary" size="sm">
                          Respond
                        </Button>
                      </Link>
                    )}

                  </div>

                </div>
              );
            })}

          </div>
        )}
      </Card>

    </div>
  );
}