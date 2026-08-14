"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ClipboardList,
  Calendar,
  Package,
  Truck,
  CreditCard,
  FileText,
  RefreshCw,
  Send,
  CheckCircle2,
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

export default function VendorRFQDetailsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [rfq, setRfq] = useState<VendorRFQ | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState("");

  const [price, setPrice] = useState("");
  const [moq, setMoq] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [warrantyMonths, setWarrantyMonths] = useState("");
  const [notes, setNotes] = useState("");

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchRFQ = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getStoredToken();

        if (!token) {
          setError(
            "Authentication token not found. Please login again."
          );
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

        console.log("RFQ DETAILS STATUS:", response.status);
        console.log("RFQ DETAILS RESPONSE:", data);

        if (!response.ok) {
          throw new Error(
            typeof data?.detail === "string"
              ? data.detail
              : "Failed to load RFQ."
          );
        }

        const foundRFQ = Array.isArray(data)
          ? data.find(
              (item: VendorRFQ) =>
                String(item.rfq_id) === String(id)
            )
          : null;

        if (!foundRFQ) {
          setError(
            "RFQ not found or it was not sent to your vendor account."
          );
          return;
        }

        setRfq(foundRFQ);

        if (foundRFQ.payment_terms) {
          setPaymentTerms(foundRFQ.payment_terms);
        }

      } catch (err) {
        console.error(
          "FETCH RFQ DETAILS ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load RFQ."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRFQ();
    }
  }, [id, API_URL]);

  const handleSubmitQuote = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!rfq) {
      return;
    }

    setQuoteSuccess("");
    setError("");

    const token = getStoredToken();

    if (!token) {
      setError(
        "Authentication token not found. Please login again."
      );
      return;
    }

    if (!price || Number(price) <= 0) {
      setError("Please enter a valid quotation price.");
      return;
    }

    try {
      setSubmittingQuote(true);

      /*
       * Get logged-in user ID from JWT.
       */
      let userId: number | null = null;

      try {
        const tokenParts = token.split(".");

        if (tokenParts.length >= 2) {
          const payload = JSON.parse(
            atob(tokenParts[1])
          );

          userId = Number(payload.sub);
        }
      } catch (decodeError) {
        console.error(
          "JWT DECODE ERROR:",
          decodeError
        );
      }

      if (!userId) {
        throw new Error(
          "Unable to identify the logged-in user."
        );
      }

      /*
       * Get vendor profile.
       */
      const vendorResponse = await fetch(
        `${API_URL}/vendors/me`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const vendorData =
        await vendorResponse.json().catch(() => null);

      console.log(
        "VENDOR PROFILE STATUS:",
        vendorResponse.status
      );

      console.log(
        "VENDOR PROFILE:",
        vendorData
      );

      if (!vendorResponse.ok) {
        throw new Error(
          typeof vendorData?.detail === "string"
            ? vendorData.detail
            : "Failed to load vendor information."
        );
      }

      const vendorId =
        vendorData?.id ??
        vendorData?.vendor_id;

      if (!vendorId) {
        throw new Error(
          "Vendor ID could not be found."
        );
      }

      /*
       * Create quotation.
       */
      const quotePayload = {
        vendor_id: Number(vendorId),
        product_id: null,
        rfq_reference: rfq.rfq_ref,
        price: Number(price),
        moq: moq ? Number(moq) : null,
        delivery_days: deliveryDays
          ? Number(deliveryDays)
          : null,
        payment_terms:
          paymentTerms.trim() || null,
        warranty_months: warrantyMonths
          ? Number(warrantyMonths)
          : null,
        notes: notes.trim() || null,
      };

      console.log(
        "SUBMITTING QUOTE:",
        quotePayload
      );

      const response = await fetch(
        `${API_URL}/quotes/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(quotePayload),
        }
      );

      const data =
        await response.json().catch(() => null);

      console.log(
        "CREATE QUOTE STATUS:",
        response.status
      );

      console.log(
        "CREATE QUOTE RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          typeof data?.detail === "string"
            ? data.detail
            : "Failed to submit quotation."
        );
      }

      setQuoteSuccess(
        "Your quotation has been submitted successfully."
      );

      setShowQuoteForm(false);

      setRfq((previous) =>
        previous
          ? {
              ...previous,
              vendor_status: "RESPONDED",
              responded_at:
                new Date().toISOString(),
            }
          : previous
      );

    } catch (err) {
      console.error(
        "SUBMIT QUOTE ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit quotation."
      );
    } finally {
      setSubmittingQuote(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <RefreshCw className="h-7 w-7 mx-auto text-indigo-500 animate-spin" />

        <p className="text-sm font-semibold text-slate-400 mt-3">
          Loading RFQ...
        </p>
      </div>
    );
  }

  if (error || !rfq) {
    return (
      <div className="space-y-6">

        <Link
          href="/vendor/rfqs"
          className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to RFQs
        </Link>

        <div className="p-5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
          <p className="text-sm font-bold">
            {error || "RFQ not found."}
          </p>
        </div>

      </div>
    );
  }

  const hasResponded =
    Boolean(rfq.responded_at) ||
    rfq.vendor_status === "RESPONDED";

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        <div>

          <Link
            href="/vendor/rfqs"
            className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to RFQs
          </Link>

          <div className="flex items-center gap-3 flex-wrap">

            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
              <ClipboardList className="h-5 w-5" />
            </div>

            <div>

              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                {rfq.rfq_ref}
              </p>

              <h1 className="text-2xl font-black text-slate-900">
                {rfq.product_name}
              </h1>

            </div>

            <span
              className={`px-3 py-1 rounded-full border text-xs font-bold ${
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

        </div>

      </div>

      {/* SUCCESS MESSAGE */}
      {quoteSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-3">

          <CheckCircle2 className="h-5 w-5 shrink-0" />

          <p className="text-sm font-bold">
            {quoteSuccess}
          </p>

        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">

          <p className="text-sm font-bold">
            {error}
          </p>

        </div>
      )}

      {/* MAIN INFORMATION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">

          {/* RFQ DETAILS */}
          <Card
            title="RFQ Details"
            subtitle="Requirements provided by the buyer"
          >

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <InfoItem
                icon={<Package className="h-4 w-4" />}
                label="Product"
                value={rfq.product_name}
              />

              <InfoItem
                icon={<ClipboardList className="h-4 w-4" />}
                label="Category"
                value={rfq.category}
              />

              <InfoItem
                icon={<Package className="h-4 w-4" />}
                label="Quantity"
                value={`${rfq.quantity} ${
                  rfq.unit || "units"
                }`}
              />

              <InfoItem
                icon={<Package className="h-4 w-4" />}
                label="Material"
                value={
                  rfq.material ||
                  "Not specified"
                }
              />

              <InfoItem
                icon={<CreditCard className="h-4 w-4" />}
                label="Budget"
                value={
                  rfq.budget != null
                    ? `$${rfq.budget.toLocaleString()}`
                    : "Not specified"
                }
              />

              <InfoItem
                icon={<Calendar className="h-4 w-4" />}
                label="Delivery Date"
                value={
                  rfq.delivery_date
                    ? new Date(
                        rfq.delivery_date
                      ).toLocaleDateString()
                    : "Not specified"
                }
              />

              <InfoItem
                icon={<CreditCard className="h-4 w-4" />}
                label="Payment Terms"
                value={
                  rfq.payment_terms ||
                  "Not specified"
                }
              />

              <InfoItem
                icon={<Truck className="h-4 w-4" />}
                label="Shipping Method"
                value={
                  rfq.shipping_method ||
                  "Not specified"
                }
              />

            </div>

          </Card>

          {/* DESCRIPTION */}
          <Card
            title="Buyer Requirements"
            subtitle="Additional information from the buyer"
          >

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">

              <p className="text-sm text-slate-600 leading-6 whitespace-pre-wrap">
                {rfq.description ||
                  "No additional description provided."}
              </p>

            </div>

          </Card>

        </div>

        {/* RIGHT */}
        <div className="space-y-6">

          {/* STATUS */}
          <Card
            title="RFQ Status"
            subtitle="Current request status"
          >

            <div className="space-y-4">

              <StatusRow
                label="RFQ Status"
                value={rfq.rfq_status}
              />

              <StatusRow
                label="Your Status"
                value={
                  hasResponded
                    ? "RESPONDED"
                    : rfq.vendor_status
                }
              />

              <StatusRow
                label="Sent At"
                value={
                  rfq.sent_at
                    ? new Date(
                        rfq.sent_at
                      ).toLocaleString()
                    : "N/A"
                }
              />

              <StatusRow
                label="Responded At"
                value={
                  rfq.responded_at
                    ? new Date(
                        rfq.responded_at
                      ).toLocaleString()
                    : "Not responded"
                }
              />

            </div>

          </Card>

          {/* RESPONSE */}
          <Card
            title="RFQ Response"
            subtitle="Submit your quotation to the buyer"
          >

            {!hasResponded &&
              !showQuoteForm && (

                <div className="space-y-4">

                  <p className="text-xs text-slate-500 leading-5">
                    Submit your price and delivery
                    terms for this buyer request.
                  </p>

                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setError("");
                      setQuoteSuccess("");
                      setShowQuoteForm(true);
                    }}
                  >
                    <FileText className="h-4 w-4" />
                    Submit Quote
                  </Button>

                </div>
              )}

            {showQuoteForm &&
              !hasResponded && (

                <form
                  onSubmit={handleSubmitQuote}
                  className="space-y-4"
                >

                  {/* PRICE */}
                  <div>

                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Price *
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) =>
                        setPrice(e.target.value)
                      }
                      placeholder="Enter quotation price"
                      required
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />

                  </div>

                  {/* MOQ */}
                  <div>

                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      MOQ
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={moq}
                      onChange={(e) =>
                        setMoq(e.target.value)
                      }
                      placeholder={`Buyer requested ${rfq.quantity} ${
                        rfq.unit || "units"
                      }`}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />

                  </div>

                  {/* DELIVERY DAYS */}
                  <div>

                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Delivery Days
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={deliveryDays}
                      onChange={(e) =>
                        setDeliveryDays(
                          e.target.value
                        )
                      }
                      placeholder="e.g. 30"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />

                  </div>

                  {/* PAYMENT TERMS */}
                  <div>

                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Payment Terms
                    </label>

                    <input
                      type="text"
                      value={paymentTerms}
                      onChange={(e) =>
                        setPaymentTerms(
                          e.target.value
                        )
                      }
                      placeholder="e.g. Net 30"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />

                  </div>

                  {/* WARRANTY */}
                  <div>

                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Warranty Months
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={warrantyMonths}
                      onChange={(e) =>
                        setWarrantyMonths(
                          e.target.value
                        )
                      }
                      placeholder="e.g. 12"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />

                  </div>

                  {/* NOTES */}
                  <div>

                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Notes
                    </label>

                    <textarea
                      value={notes}
                      onChange={(e) =>
                        setNotes(e.target.value)
                      }
                      placeholder="Add any additional information..."
                      rows={4}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />

                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-2">

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled={submittingQuote}
                      onClick={() =>
                        setShowQuoteForm(false)
                      }
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      disabled={submittingQuote}
                    >
                      {submittingQuote ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Submit Quote
                        </>
                      )}
                    </Button>

                  </div>

                </form>
              )}

            {hasResponded && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">

                <div className="flex items-center gap-2">

                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />

                  <p className="text-xs font-bold text-emerald-700">
                    You have responded to this RFQ.
                  </p>

                </div>

              </div>
            )}

          </Card>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="p-3 rounded-xl border border-slate-200">

      <div className="flex items-center gap-2 text-indigo-600 mb-2">

        {icon}

        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

      </div>

      <p className="text-sm font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   STATUS ROW
========================================================= */

function StatusRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-slate-100 last:border-0">

      <span className="text-xs font-semibold text-slate-400">
        {label}
      </span>

      <span className="text-xs font-bold text-slate-900 text-right">
        {value}
      </span>

    </div>
  );
}