"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  BarChart3,
  ClipboardList,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Star,
  CheckCircle2,
  Clock,
  Package,
} from "lucide-react";

import { Card } from "@/components/UI/Card";
import { getStoredToken } from "@/context/AuthContext";

interface RFQAnalytics {
  total: number;
  responded: number;
  response_rate: number;
  status: Record<string, number>;
}

interface OrderAnalytics {
  total: number;
  revenue: number;
  average_order_value: number;
}

interface RatingBreakdown {
  overall: number;
  product: number;
  communication: number;
  delivery: number;
  quality: number;
  service: number;
}

interface ReviewAnalytics {
  total: number;
  average_rating: number;
  rating_breakdown: RatingBreakdown;
}

interface VendorAnalytics {
  vendor: {
    id: number;
    company_name: string;
  };
  rfqs: RFQAnalytics;
  orders: OrderAnalytics;
  reviews: ReviewAnalytics;
}

export default function VendorAnalyticsPage() {
  const [analytics, setAnalytics] =
    useState<VendorAnalytics | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchAnalytics = async () => {
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
          `${API_URL}/api/vendor/dashboard/analytics`,
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
          "VENDOR ANALYTICS STATUS:",
          response.status
        );

        console.log(
          "VENDOR ANALYTICS DATA:",
          data
        );

        if (!response.ok) {
          throw new Error(
            typeof data?.detail === "string"
              ? data.detail
              : "Failed to load vendor analytics."
          );
        }

        setAnalytics(data);
      } catch (error) {
        console.error(
          "FETCH VENDOR ANALYTICS ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load vendor analytics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [API_URL]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            Vendor Portal
          </p>

          <h2 className="text-2xl font-black text-slate-900">
            Business Analytics
          </h2>

          <p className="text-sm text-slate-500 font-medium mt-1">
            Loading your business performance...
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <Card key={item}>
              <div className="animate-pulse">
                <div className="h-3 w-24 bg-slate-200 rounded mb-4" />
                <div className="h-8 w-20 bg-slate-200 rounded" />
                <div className="h-3 w-28 bg-slate-200 rounded mt-3" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            Vendor Portal
          </p>

          <h2 className="text-2xl font-black text-slate-900">
            Business Analytics
          </h2>
        </div>

        <Card>
          <div className="py-10 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6" />
            </div>

            <h3 className="text-sm font-black text-slate-900">
              Unable to load analytics
            </h3>

            <p className="text-xs text-rose-600 font-semibold mt-2">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const rfqPending =
    Math.max(
      analytics.rfqs.total - analytics.rfqs.responded,
      0
    );

  const ratingBreakdown = [
    {
      label: "Overall",
      value: analytics.reviews.rating_breakdown.overall,
    },
    {
      label: "Product",
      value: analytics.reviews.rating_breakdown.product,
    },
    {
      label: "Communication",
      value: analytics.reviews.rating_breakdown.communication,
    },
    {
      label: "Delivery",
      value: analytics.reviews.rating_breakdown.delivery,
    },
    {
      label: "Quality",
      value: analytics.reviews.rating_breakdown.quality,
    },
    {
      label: "Service",
      value: analytics.reviews.rating_breakdown.service,
    },
  ];

  return (
    <div className="space-y-6">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        <div>
          <Link
            href="/vendor"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>

          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            Vendor Portal
          </p>

          <h2 className="text-2xl font-black text-slate-900">
            Business Analytics
          </h2>

          <p className="text-sm text-slate-500 font-medium mt-1">
            Performance overview for{" "}
            <span className="font-bold text-slate-700">
              {analytics.vendor.company_name}
            </span>
          </p>
        </div>

        <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
          <BarChart3 className="h-6 w-6" />
        </div>
      </div>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        <AnalyticsCard
          label="Total RFQs"
          value={analytics.rfqs.total}
          description={`${analytics.rfqs.responded} responded`}
          icon={<ClipboardList className="h-5 w-5" />}
          iconStyle="bg-indigo-50 text-indigo-600"
        />

        <AnalyticsCard
          label="Response Rate"
          value={`${analytics.rfqs.response_rate}%`}
          description={`${rfqPending} pending response`}
          icon={<MessageSquare className="h-5 w-5" />}
          iconStyle="bg-amber-50 text-amber-600"
        />

        <AnalyticsCard
          label="Total Orders"
          value={analytics.orders.total}
          description="Orders received"
          icon={<ShoppingBag className="h-5 w-5" />}
          iconStyle="bg-emerald-50 text-emerald-600"
        />

        <AnalyticsCard
          label="Total Revenue"
          value={formatCurrency(analytics.orders.revenue)}
          description={`Avg. order ${formatCurrency(
            analytics.orders.average_order_value
          )}`}
          icon={<DollarSign className="h-5 w-5" />}
          iconStyle="bg-violet-50 text-violet-600"
        />

      </div>

      {/* =====================================================
          RFQ PERFORMANCE + STATUS
      ===================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* RFQ PERFORMANCE */}

        <Card
          title="RFQ Performance"
          subtitle="Your response activity for buyer requests"
        >
          <div className="space-y-5">

            <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide">
                    Response Rate
                  </p>

                  <h3 className="text-3xl font-black text-slate-900 mt-1">
                    {analytics.rfqs.response_rate}%
                  </h3>
                </div>

                <div className="p-3 rounded-xl bg-white text-indigo-600">
                  <TrendingUp className="h-5 w-5" />
                </div>

              </div>

              <div className="mt-5 h-2 rounded-full bg-white overflow-hidden">

                <div
                  className="h-full rounded-full bg-indigo-500 transition-all"
                  style={{
                    width: `${Math.min(
                      Math.max(
                        analytics.rfqs.response_rate,
                        0
                      ),
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>

            <div className="grid grid-cols-2 gap-3">

              <MetricBox
                label="Total RFQs"
                value={analytics.rfqs.total}
                icon={
                  <ClipboardList className="h-4 w-4" />
                }
              />

              <MetricBox
                label="Responded"
                value={analytics.rfqs.responded}
                icon={
                  <CheckCircle2 className="h-4 w-4" />
                }
                valueClass="text-emerald-600"
              />

              <MetricBox
                label="Pending"
                value={rfqPending}
                icon={
                  <Clock className="h-4 w-4" />
                }
                valueClass="text-amber-600"
              />

              <MetricBox
                label="Response Rate"
                value={`${analytics.rfqs.response_rate}%`}
                icon={
                  <TrendingUp className="h-4 w-4" />
                }
                valueClass="text-indigo-600"
              />

            </div>

          </div>
        </Card>

        {/* RFQ STATUS */}

        <Card
          title="RFQ Status Breakdown"
          subtitle="Distribution of your assigned RFQs"
        >
          <div className="space-y-4">

            {Object.keys(analytics.rfqs.status).length === 0 ? (
              <div className="py-8 text-center">
                <ClipboardList className="h-8 w-8 mx-auto text-slate-300" />

                <p className="text-xs font-bold text-slate-600 mt-2">
                  No RFQ status data
                </p>
              </div>
            ) : (
              Object.entries(analytics.rfqs.status).map(
                ([status, count]) => {

                  const percentage =
                    analytics.rfqs.total > 0
                      ? (count / analytics.rfqs.total) * 100
                      : 0;

                  return (
                    <div key={status}>

                      <div className="flex items-center justify-between mb-2">

                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-indigo-500" />

                          <span className="text-xs font-bold text-slate-700">
                            {formatStatus(status)}
                          </span>
                        </div>

                        <span className="text-xs font-black text-slate-900">
                          {count}
                        </span>

                      </div>

                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">

                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                      <p className="text-[9px] text-slate-400 font-medium mt-1">
                        {percentage.toFixed(1)}% of RFQs
                      </p>

                    </div>
                  );
                }
              )
            )}

          </div>
        </Card>

      </div>

      {/* =====================================================
          ORDER PERFORMANCE
      ===================================================== */}

      <Card
        title="Order Performance"
        subtitle="Revenue and order value overview"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <PerformanceBox
            icon={<ShoppingBag className="h-5 w-5" />}
            label="Total Orders"
            value={analytics.orders.total.toString()}
            description="Orders received"
            iconStyle="bg-indigo-50 text-indigo-600"
          />

          <PerformanceBox
            icon={<DollarSign className="h-5 w-5" />}
            label="Total Revenue"
            value={formatCurrency(analytics.orders.revenue)}
            description="Revenue generated from orders"
            iconStyle="bg-emerald-50 text-emerald-600"
          />

          <PerformanceBox
            icon={<TrendingUp className="h-5 w-5" />}
            label="Average Order Value"
            value={formatCurrency(
              analytics.orders.average_order_value
            )}
            description="Average revenue per order"
            iconStyle="bg-violet-50 text-violet-600"
          />

        </div>

        {analytics.orders.total === 0 && (
          <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-slate-400" />

              <div>
                <p className="text-xs font-bold text-slate-700">
                  No orders yet
                </p>

                <p className="text-[10px] text-slate-400 mt-0.5">
                  Order performance will appear here once buyers place orders with your company.
                </p>
              </div>
            </div>
          </div>
        )}

      </Card>

      {/* =====================================================
          REVIEWS & RATINGS
      ===================================================== */}

      <Card
        title="Reviews & Ratings"
        subtitle="Buyer feedback across different performance areas"
        headerAction={
          <Link
            href="/vendor/reviews"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View Reviews
          </Link>
        }
      >
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* MAIN RATING */}

          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">
                  Average Rating
                </p>

                <div className="flex items-center gap-2 mt-2">

                  <h3 className="text-4xl font-black text-slate-900">
                    {Number(
                      analytics.reviews.average_rating || 0
                    ).toFixed(2)}
                  </h3>

                  <span className="text-sm font-bold text-slate-400">
                    / 5
                  </span>

                </div>

              </div>

              <div className="p-3 rounded-xl bg-white text-amber-500">
                <Star className="h-5 w-5 fill-current" />
              </div>

            </div>

            <p className="text-xs text-slate-500 font-semibold mt-4">
              Based on {analytics.reviews.total}{" "}
              {analytics.reviews.total === 1
                ? "buyer review"
                : "buyer reviews"}
            </p>

          </div>

          {/* RATING BREAKDOWN */}

          <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">

            {ratingBreakdown.map((rating) => (
              <RatingRow
                key={rating.label}
                label={rating.label}
                value={rating.value}
              />
            ))}

          </div>

        </div>
      </Card>

      {/* =====================================================
          ANALYTICS NOTE
      ===================================================== */}

      <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">

        <div className="flex items-start gap-3">

          <BarChart3 className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" />

          <div>

            <p className="text-xs font-black text-indigo-900">
              Analytics data
            </p>

            <p className="text-[10px] text-indigo-700 font-medium mt-1 leading-relaxed">
              The figures shown on this page are fetched directly from your
              vendor analytics API. Monthly revenue trends will be added once
              historical order aggregation is available from the backend.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   ANALYTICS CARD
========================================================= */

function AnalyticsCard({
  label,
  value,
  description,
  icon,
  iconStyle,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  iconStyle: string;
}) {
  return (
    <Card className="relative overflow-hidden">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            {label}
          </p>

          <h3 className="text-2xl font-black text-slate-900 mt-2">
            {value}
          </h3>

          <p className="text-[10px] font-semibold text-slate-400 mt-2">
            {description}
          </p>

        </div>

        <div className={`p-3 rounded-xl ${iconStyle}`}>
          {icon}
        </div>

      </div>

    </Card>
  );
}

/* =========================================================
   METRIC BOX
========================================================= */

function MetricBox({
  label,
  value,
  icon,
  valueClass = "text-slate-900",
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white">

      <div className="flex items-center justify-between">

        <div className="p-2 rounded-lg bg-slate-50 text-slate-500">
          {icon}
        </div>

      </div>

      <p
        className={`text-xl font-black mt-3 ${valueClass}`}
      >
        {value}
      </p>

      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">
        {label}
      </p>

    </div>
  );
}

/* =========================================================
   PERFORMANCE BOX
========================================================= */

function PerformanceBox({
  icon,
  label,
  value,
  description,
  iconStyle,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  iconStyle: string;
}) {
  return (
    <div className="p-5 rounded-2xl border border-slate-200">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            {label}
          </p>

          <h3 className="text-2xl font-black text-slate-900 mt-2">
            {value}
          </h3>

          <p className="text-[10px] text-slate-400 font-medium mt-2">
            {description}
          </p>
        </div>

        <div className={`p-3 rounded-xl ${iconStyle}`}>
          {icon}
        </div>

      </div>

    </div>
  );
}

/* =========================================================
   RATING ROW
========================================================= */

function RatingRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const rating = Number(value || 0);

  const percentage = Math.min(
    Math.max((rating / 5) * 100, 0),
    100
  );

  return (
    <div className="p-3 rounded-xl border border-slate-200">

      <div className="flex items-center justify-between mb-2">

        <div className="flex items-center gap-2">

          <Star className="h-3.5 w-3.5 text-amber-400 fill-current" />

          <span className="text-xs font-bold text-slate-700">
            {label}
          </span>

        </div>

        <span className="text-xs font-black text-slate-900">
          {rating.toFixed(2)}
        </span>

      </div>

      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">

        <div
          className="h-full rounded-full bg-amber-400 transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function formatCurrency(value: number) {
  const amount = Number(value || 0);

  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

