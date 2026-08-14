"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

import {
  Package,
  ClipboardList,
  FileText,
  ShoppingBag,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Eye,
  Clock,
  CheckCircle2,
  DollarSign,
  Users,
  BarChart3,
  Truck,
  XCircle,
} from "lucide-react";

import { Card } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import { getStoredToken } from "@/context/AuthContext";

interface Product {
  id: number;
  name: string;
  category: string;
  description?: string;
  price_min?: number | null;
  price_max?: number | null;
  moq?: number | null;
  lead_time_days?: number | null;
  stock_available?: number | null;
  vendor_id: number;
  category_id?: number | null;
  created_at?: string;
  vendor_name?: string;
  is_hidden?: boolean;
  is_featured?: boolean;
}

interface RevenueData {
  month: string;
  revenue: number;
}

interface ActivityItem {
  id: number;
  title: string;
  description: string;
  time: string;
  type: "order" | "quote" | "product" | "message";
}

interface Review {
  id: string | number;
  vendor_id?: number | string;
  buyer_id?: number | string;
  buyer_name?: string;
  comment?: string;
  created_at?: string;

  helpful_votes?: number;

  ratings?: {
    overall_rating?: number | null;
    product_rating?: number | null;
    communication_rating?: number | null;
    delivery_rating?: number | null;
    quality_rating?: number | null;
    service_rating?: number | null;
  } | null;

  overall_rating?: number | null;
  rating_overall?: number | null;
}

interface ReviewStatistics {
  average_rating?: number | null;
  avg_rating?: number | null;
  overall_rating?: number | null;
  rating?: number | null;
  total_reviews?: number | null;
  review_count?: number | null;
  count?: number | null;
}

export default function VendorDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productError, setProductError] = useState("");

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewError, setReviewError] = useState("");

  const [reviewStatistics, setReviewStatistics] =
    useState<ReviewStatistics | null>(null);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // =========================================================
  // DASHBOARD DATA
  // =========================================================

  const monthlyRevenue: RevenueData[] = [
    { month: "Mar", revenue: 28400 },
    { month: "Apr", revenue: 32100 },
    { month: "May", revenue: 36750 },
    { month: "Jun", revenue: 41200 },
    { month: "Jul", revenue: 42150 },
    { month: "Aug", revenue: 48250 },
  ];

  const orderStatistics = {
    total: 24,
    processing: 5,
    shipping: 3,
    delivered: 14,
    cancelled: 2,
  };

  const pendingQuotations = [
    {
      id: "RFQ-9021",
      product: "Industrial Steel Sheets",
      quantity: "10,000 units",
      buyer: "Global Manufacturing Ltd.",
      deadline: "Sep 15, 2026",
      status: "New",
      statusType: "new" as const,
    },
    {
      id: "RFQ-9017",
      product: "Cotton T-Shirts",
      quantity: "5,000 units",
      buyer: "PakTech Industries",
      deadline: "Oct 2, 2026",
      status: "Reviewing",
      statusType: "reviewing" as const,
    },
    {
      id: "RFQ-9012",
      product: "Packaging Materials",
      quantity: "20,000 units",
      buyer: "Atlas Trading Co.",
      deadline: "Aug 28, 2026",
      status: "Urgent",
      statusType: "urgent" as const,
    },
  ];

  const recentActivities: ActivityItem[] = [
    {
      id: 1,
      title: "New RFQ received",
      description: "Industrial Steel Sheets · RFQ-9021",
      time: "10 minutes ago",
      type: "quote",
    },
    {
      id: 2,
      title: "Order status updated",
      description: "ORD-8392 changed to Processing",
      time: "1 hour ago",
      type: "order",
    },
    {
      id: 3,
      title: "Product added",
      description: "New product added to your catalog",
      time: "3 hours ago",
      type: "product",
    },
    {
      id: 4,
      title: "New buyer message",
      description: "Global Manufacturing Ltd. sent a message",
      time: "5 hours ago",
      type: "message",
    },
    {
      id: 5,
      title: "Quote accepted",
      description: "Your quotation for RFQ-8998 was accepted",
      time: "Yesterday",
      type: "quote",
    },
  ];

  // =========================================================
  // FETCH VENDOR PRODUCTS
  // =========================================================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        setProductError("");

        const token = getStoredToken();

        console.log("DASHBOARD PRODUCT TOKEN:", token);

        if (!token) {
          setProductError(
            "Authentication token not found. Please login again."
          );
          setProductsLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/products/my`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json().catch(() => null);

        console.log("DASHBOARD PRODUCTS STATUS:", response.status);
        console.log("DASHBOARD PRODUCTS:", data);

        if (!response.ok) {
          throw new Error(
            typeof data?.detail === "string"
              ? data.detail
              : "Failed to load products."
          );
        }

        const productList = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];

        setProducts(productList);
      } catch (error) {
        console.error("FETCH PRODUCTS ERROR:", error);

        setProductError(
          error instanceof Error
            ? error.message
            : "Failed to load products."
        );
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [API_URL]);

  // =========================================================
  // FETCH VENDOR REVIEWS
  // =========================================================

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        setReviewError("");

        const token = getStoredToken();

        if (!token) {
          setReviewError(
            "Authentication token not found. Please login again."
          );
          setReviewsLoading(false);
          return;
        }

        /*
         * We get vendor_id from the vendor's own products.
         * The /products/my endpoint already returns vendor_id.
         */
        if (productsLoading) {
          return;
        }

        if (products.length === 0) {
          setReviews([]);
          setReviewStatistics(null);
          setReviewsLoading(false);
          return;
        }

        const vendorId = products[0]?.vendor_id;

        if (!vendorId) {
          setReviewError("Vendor ID could not be determined.");
          setReviewsLoading(false);
          return;
        }

        console.log("DASHBOARD VENDOR ID:", vendorId);

        const reviewsUrl = `${API_URL}/api/reviews?vendor_id=${vendorId}`;
        const statisticsUrl = `${API_URL}/api/reviews/statistics?vendor_id=${vendorId}`;

        const [reviewsResponse, statisticsResponse] = await Promise.all([
          fetch(reviewsUrl, {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(statisticsUrl, {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const reviewsData = await reviewsResponse.json().catch(() => null);
        const statisticsData = await statisticsResponse
          .json()
          .catch(() => null);

        console.log(
          "DASHBOARD REVIEWS STATUS:",
          reviewsResponse.status
        );
        console.log("DASHBOARD REVIEWS:", reviewsData);

        console.log(
          "DASHBOARD REVIEW STATISTICS STATUS:",
          statisticsResponse.status
        );
        console.log(
          "DASHBOARD REVIEW STATISTICS:",
          statisticsData
        );

        if (!reviewsResponse.ok) {
          throw new Error(
            typeof reviewsData?.detail === "string"
              ? reviewsData.detail
              : "Failed to load vendor reviews."
          );
        }

        const reviewList = Array.isArray(reviewsData)
          ? reviewsData
          : Array.isArray(reviewsData?.data)
          ? reviewsData.data
          : [];

        setReviews(reviewList);

        if (statisticsResponse.ok) {
          const stats =
            statisticsData?.data ?? statisticsData ?? null;

          setReviewStatistics(stats);
        } else {
          setReviewStatistics(null);
        }
      } catch (error) {
        console.error("FETCH REVIEWS ERROR:", error);

        setReviewError(
          error instanceof Error
            ? error.message
            : "Failed to load vendor reviews."
        );

        setReviews([]);
        setReviewStatistics(null);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [API_URL, products, productsLoading]);

  // =========================================================
  // PRODUCT STATS
  // =========================================================

  const totalProducts = products.length;

  const visibleProducts = products.filter(
    (product) => !product.is_hidden
  );

  // =========================================================
  // REVIEW STATISTICS
  // =========================================================

  const getReviewRating = (review: Review): number | null => {
    const rating =
      review.overall_rating ??
      review.rating_overall ??
      review.ratings?.overall_rating ??
      null;

    if (rating === null || rating === undefined) {
      return null;
    }

    const numericRating = Number(rating);

    if (Number.isNaN(numericRating)) {
      return null;
    }

    return numericRating;
  };

  const calculatedAverageRating = (() => {
    const ratings = reviews
      .map(getReviewRating)
      .filter(
        (rating): rating is number =>
          rating !== null && rating > 0
      );

    if (ratings.length === 0) {
      return 0;
    }

    const total = ratings.reduce(
      (sum, rating) => sum + rating,
      0
    );

    return total / ratings.length;
  })();

  const statisticsAverageRating = Number(
    reviewStatistics?.average_rating ??
      reviewStatistics?.avg_rating ??
      reviewStatistics?.overall_rating ??
      reviewStatistics?.rating ??
      0
  );

  const averageRating =
    statisticsAverageRating > 0
      ? statisticsAverageRating
      : calculatedAverageRating;

  const statisticsReviewCount = Number(
    reviewStatistics?.total_reviews ??
      reviewStatistics?.review_count ??
      reviewStatistics?.count ??
      0
  );

  const totalReviews =
    statisticsReviewCount > 0
      ? statisticsReviewCount
      : reviews.length;

  // =========================================================
  // REVENUE CHART
  // =========================================================

  const maxRevenue = Math.max(
    ...monthlyRevenue.map((item) => item.revenue)
  );

  return (
    <div className="space-y-6">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            Vendor Portal
          </p>

          <h2 className="text-2xl font-black text-slate-900">
            Vendor Dashboard
          </h2>

          <p className="text-sm text-slate-500 font-medium mt-1">
            Manage your products, RFQs, orders and business performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/vendor/products">
            <Button variant="outline" size="sm">
              <Package className="h-4 w-4" />
              My Products
            </Button>
          </Link>

          <Link href="/vendor/products/new">
            <Button variant="primary" size="sm">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* PRODUCTS */}

        <Card className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Total Products
              </p>

              <h3 className="text-2xl font-black text-slate-900 mt-2">
                {productsLoading ? "..." : totalProducts}
              </h3>

              <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-600">
                <TrendingUp className="h-3.5 w-3.5" />

                {productsLoading
                  ? "Loading..."
                  : `${visibleProducts.length} visible`}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
              <Package className="h-5 w-5" />
            </div>
          </div>
        </Card>

        {/* RFQs */}

        <Card className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Incoming RFQs
              </p>

              <h3 className="text-2xl font-black text-slate-900 mt-2">
                12
              </h3>

              <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-amber-600">
                <Clock className="h-3.5 w-3.5" />
                4 need response
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
              <ClipboardList className="h-5 w-5" />
            </div>
          </div>
        </Card>

        {/* PENDING QUOTATIONS */}

        <Card className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Pending Quotations
              </p>

              <h3 className="text-2xl font-black text-slate-900 mt-2">
                {pendingQuotations.length}
              </h3>

              <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-amber-600">
                <Clock className="h-3.5 w-3.5" />
                Need response
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
              <FileText className="h-5 w-5" />
            </div>
          </div>
        </Card>

        {/* ORDERS */}

        <Card className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Active Orders
              </p>

              <h3 className="text-2xl font-black text-slate-900 mt-2">
                {orderStatistics.processing +
                  orderStatistics.shipping}
              </h3>

              <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-indigo-600">
                <ShoppingBag className="h-3.5 w-3.5" />
                {orderStatistics.shipping} shipping
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* =====================================================
          INCOMING RFQS + BUSINESS OVERVIEW
      ===================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* INCOMING RFQS */}

        <div className="xl:col-span-2">
          <Card
            title="Incoming RFQs"
            subtitle="Recent sourcing requests from buyers"
            badge="12 Total"
            headerAction={
              <Link
                href="/vendor/rfqs"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                View All
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            <div className="space-y-3">
              <RFQRow
                product="Industrial Steel Sheets"
                rfq="RFQ-9021"
                quantity="10,000 units"
                country="Turkey"
                deadline="September 15, 2026"
                status="New"
                statusType="new"
                submit
              />

              <RFQRow
                product="Cotton T-Shirts"
                rfq="RFQ-9017"
                quantity="5,000 units"
                country="Pakistan"
                deadline="October 2, 2026"
                status="Reviewing"
                statusType="reviewing"
              />

              <RFQRow
                product="Packaging Materials"
                rfq="RFQ-9012"
                quantity="20,000 units"
                country="UAE"
                deadline="August 28, 2026"
                status="Urgent"
                statusType="urgent"
                submit
              />
            </div>
          </Card>
        </div>

        {/* BUSINESS OVERVIEW */}

        <Card
          title="Business Overview"
          subtitle="Your vendor performance"
        >
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide">
                    Monthly Revenue
                  </p>

                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    $48,250
                  </h3>
                </div>

                <div className="p-2.5 bg-white rounded-xl text-indigo-600">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>

              <div className="flex items-center gap-1 mt-2 text-xs font-bold text-emerald-600">
                <TrendingUp className="h-3.5 w-3.5" />
                14.5% from last month
              </div>
            </div>

            <OverviewRow
              icon={<Users className="h-4 w-4" />}
              title="Active Buyers"
              description="Buyers engaging with your products"
              value="37"
            />

            <OverviewRow
              icon={<CheckCircle2 className="h-4 w-4" />}
              title="Quote Success"
              description="Accepted quotes"
              value="68%"
              valueClass="text-emerald-600"
            />

            <OverviewRow
              icon={<StarIcon />}
              title="Vendor Rating"
              description={
                reviewsLoading
                  ? "Loading buyer reviews..."
                  : `${totalReviews} buyer ${
                      totalReviews === 1 ? "review" : "reviews"
                    }`
              }
              value={
                reviewsLoading
                  ? "..."
                  : averageRating > 0
                  ? `${averageRating.toFixed(1)} / 5`
                  : "No rating"
              }
              valueClass={
                averageRating > 0
                  ? "text-amber-600"
                  : "text-slate-400"
              }
            />
          </div>
        </Card>
      </div>

      {/* =====================================================
          SALES OVERVIEW
      ===================================================== */}

      <Card
        title="Sales Overview"
        subtitle="Revenue performance for the last 6 months"
        headerAction={
          <Link
            href="/vendor/analytics"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View Analytics
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        }
      >
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* REVENUE SUMMARY */}

          <div className="xl:col-span-1">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 h-full">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Total Sales
              </p>

              <h3 className="text-3xl font-black text-slate-900 mt-2">
                $222,850
              </h3>

              <div className="flex items-center gap-1 mt-2 text-xs font-bold text-emerald-600">
                <TrendingUp className="h-3.5 w-3.5" />
                18.2% increase
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400">
                    Orders
                  </p>

                  <p className="text-lg font-black text-slate-900 mt-1">
                    {orderStatistics.total}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400">
                    Avg. Order
                  </p>

                  <p className="text-lg font-black text-slate-900 mt-1">
                    $9.3K
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* MONTHLY REVENUE CHART */}

          <div className="xl:col-span-2">
            <div className="h-full min-h-[260px] p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm font-extrabold text-slate-900">
                    Monthly Revenue
                  </p>

                  <p className="text-[10px] text-slate-400 font-medium mt-1">
                    Revenue generated from completed orders
                  </p>
                </div>

                <BarChart3 className="h-5 w-5 text-indigo-500" />
              </div>

              <div className="flex items-end justify-between gap-3 h-[175px]">
                {monthlyRevenue.map((item) => {
                  const height =
                    (item.revenue / maxRevenue) * 100;

                  return (
                    <div
                      key={item.month}
                      className="flex-1 h-full flex flex-col items-center justify-end gap-2"
                    >
                      <div className="relative w-full max-w-[48px] h-full flex items-end">
                        <div
                          className="w-full rounded-t-lg bg-indigo-500 hover:bg-indigo-600 transition-all group relative"
                          style={{
                            height: `${height}%`,
                          }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap px-2 py-1 rounded-md bg-slate-900 text-white text-[9px] font-bold">
                            ${item.revenue.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-slate-400">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* =====================================================
          ORDER STATISTICS
      ===================================================== */}

      <Card
        title="Order Statistics"
        subtitle="Current order distribution"
        headerAction={
          <Link
            href="/vendor/orders"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View Orders
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <OrderStat
            label="Total Orders"
            value={orderStatistics.total}
            icon={<ShoppingBag className="h-4 w-4" />}
          />

          <OrderStat
            label="Processing"
            value={orderStatistics.processing}
            icon={<Clock className="h-4 w-4" />}
            color="amber"
          />

          <OrderStat
            label="Shipping"
            value={orderStatistics.shipping}
            icon={<Truck className="h-4 w-4" />}
            color="indigo"
          />

          <OrderStat
            label="Delivered"
            value={orderStatistics.delivered}
            icon={<CheckCircle2 className="h-4 w-4" />}
            color="emerald"
          />

          <OrderStat
            label="Cancelled"
            value={orderStatistics.cancelled}
            icon={<XCircle className="h-4 w-4" />}
            color="rose"
          />
        </div>
      </Card>

      {/* =====================================================
          PRODUCTS + ORDERS
      ===================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* PRODUCTS */}

        <Card
          title="My Products"
          subtitle="Your recently added products"
          headerAction={
            <Link
              href="/vendor/products"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              Manage Products
            </Link>
          }
        >
          {productError && (
            <div className="p-3 mb-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700">
              <p className="text-xs font-bold">{productError}</p>
            </div>
          )}

          {productsLoading ? (
            <div className="py-8 text-center">
              <p className="text-xs font-semibold text-slate-400">
                Loading products...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-8 text-center">
              <Package className="h-8 w-8 mx-auto text-slate-300 mb-2" />

              <p className="text-xs font-bold text-slate-600">
                No products yet
              </p>

              <p className="text-[10px] text-slate-400 mt-1">
                Add your first product to your catalog.
              </p>

              <Link
                href="/vendor/products/new"
                className="inline-flex items-center gap-1 mt-4 text-xs font-bold text-indigo-600"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Product
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {products.slice(0, 5).map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          )}
        </Card>

        {/* ORDERS */}

        <Card
          title="Recent Orders"
          subtitle="Latest orders from buyers"
          headerAction={
            <Link
              href="/vendor/orders"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              View Orders
            </Link>
          }
        >
          <div className="space-y-3">
            <OrderRow
              id="ORD-8392"
              buyer="Global Manufacturing Ltd."
              amount="$12,500"
              status="Processing"
              statusType="processing"
            />

            <OrderRow
              id="ORD-8387"
              buyer="PakTech Industries"
              amount="$8,750"
              status="Shipped"
              statusType="shipped"
            />

            <OrderRow
              id="ORD-8379"
              buyer="Atlas Trading Co."
              amount="$5,200"
              status="Delivered"
              statusType="delivered"
            />
          </div>
        </Card>
      </div>

      {/* =====================================================
          RECENT REVIEWS
      ===================================================== */}

      <Card
        title="Recent Buyer Reviews"
        subtitle="Latest feedback from buyers"
        badge={
          reviewsLoading
            ? "Loading..."
            : `${totalReviews} ${
                totalReviews === 1 ? "Review" : "Reviews"
              }`
        }
        headerAction={
          <Link
            href="/vendor/reviews"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View All
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        }
      >
        {reviewError && (
          <div className="p-3 mb-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700">
            <p className="text-xs font-bold">{reviewError}</p>
          </div>
        )}

        {reviewsLoading ? (
          <div className="py-8 text-center">
            <p className="text-xs font-semibold text-slate-400">
              Loading reviews...
            </p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-8 text-center">
            <StarIcon />

            <p className="text-xs font-bold text-slate-600 mt-2">
              No reviews yet
            </p>

            <p className="text-[10px] text-slate-400 mt-1">
              Buyer reviews will appear here once customers rate your products.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.slice(0, 3).map((review) => (
              <ReviewRow
                key={review.id}
                review={review}
                getRating={getReviewRating}
              />
            ))}
          </div>
        )}
      </Card>

      {/* =====================================================
          PENDING QUOTATIONS + RECENT ACTIVITIES
      ===================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* PENDING QUOTATIONS */}

        <Card
          title="Pending Quotations"
          subtitle="RFQs that need your response"
          badge={`${pendingQuotations.length} Pending`}
          headerAction={
            <Link
              href="/vendor/rfqs"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View RFQs
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          <div className="space-y-3">
            {pendingQuotations.map((quotation) => (
              <div
                key={quotation.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-extrabold text-slate-900 truncate">
                        {quotation.product}
                      </h4>

                      <QuotationStatus
                        status={quotation.status}
                        type={quotation.statusType}
                      />
                    </div>

                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                      {quotation.id} · {quotation.quantity}
                    </p>

                    <p className="text-[10px] text-slate-500 font-semibold mt-1">
                      Buyer: {quotation.buyer}
                    </p>

                    <p className="text-[10px] text-slate-500 font-semibold mt-1">
                      Required by {quotation.deadline}
                    </p>
                  </div>

                  <Link href="/vendor/rfqs">
                    <Button variant="outline" size="sm">
                      <Eye className="h-3.5 w-3.5" />
                      Review
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* RECENT ACTIVITIES */}

        <Card
          title="Recent Activities"
          subtitle="Latest activity on your vendor account"
        >
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <ActivityRow
                key={activity.id}
                activity={activity}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <Card
        title="Quick Actions"
        subtitle="Frequently used vendor tools"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickAction
            href="/vendor/products/new"
            icon={<Plus className="h-4 w-4" />}
            title="Add Product"
            description="List a new product"
          />

          <QuickAction
            href="/vendor/rfqs"
            icon={<ClipboardList className="h-4 w-4" />}
            title="Review RFQs"
            description="Respond to buyer requests"
          />

          <QuickAction
            href="/vendor/rfqs"
            icon={<FileText className="h-4 w-4" />}
            title="Pending Quotations"
            description="Respond to pending RFQs"
          />

          <QuickAction
            href="/vendor/orders"
            icon={<ShoppingBag className="h-4 w-4" />}
            title="Track Orders"
            description="Manage active orders"
          />
        </div>
      </Card>
    </div>
  );
}

/*
 * =========================================================
 * RFQ ROW
 * =========================================================
 */

function RFQRow({
  product,
  rfq,
  quantity,
  country,
  deadline,
  status,
  statusType,
  submit = false,
}: {
  product: string;
  rfq: string;
  quantity: string;
  country: string;
  deadline: string;
  status: string;
  statusType: "new" | "reviewing" | "urgent";
  submit?: boolean;
}) {
  const statusStyles = {
    new: "bg-amber-50 text-amber-700 border-amber-100",
    reviewing: "bg-indigo-50 text-indigo-700 border-indigo-100",
    urgent: "bg-rose-50 text-rose-700 border-rose-100",
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
          <ClipboardList className="h-4 w-4" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-extrabold text-slate-900">
              {product}
            </h4>

            <span
              className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${statusStyles[statusType]}`}
            >
              {status}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 font-medium mt-1">
            {rfq} · {quantity} · {country}
          </p>

          <p className="text-[11px] text-slate-500 font-semibold mt-1">
            Required by {deadline}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/vendor/rfqs">
          <Button variant="outline" size="sm">
            <Eye className="h-3.5 w-3.5" />
            View
          </Button>
        </Link>

        {submit && (
          <Link href="/vendor/rfqs">
            <Button variant="primary" size="sm">
              Submit Quote
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

/*
 * =========================================================
 * OVERVIEW ROW
 * =========================================================
 */

function OverviewRow({
  icon,
  title,
  description,
  value,
  valueClass = "text-slate-900",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
          {icon}
        </div>

        <div>
          <p className="text-xs font-bold text-slate-900">
            {title}
          </p>

          <p className="text-[10px] text-slate-400 font-medium">
            {description}
          </p>
        </div>
      </div>

      <span className={`text-sm font-black ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

/*
 * =========================================================
 * ORDER STAT
 * =========================================================
 */

function OrderStat({
  label,
  value,
  icon,
  color = "slate",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: "slate" | "amber" | "indigo" | "emerald" | "rose";
}) {
  const styles = {
    slate: "bg-slate-50 text-slate-600 border-slate-200",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
  };

  return (
    <div
      className={`p-4 rounded-xl border ${styles[color]}`}
    >
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-lg bg-white/80">
          {icon}
        </div>
      </div>

      <p className="text-2xl font-black text-slate-900 mt-3">
        {value}
      </p>

      <p className="text-[10px] font-bold uppercase tracking-wide mt-1">
        {label}
      </p>
    </div>
  );
}

/*
 * =========================================================
 * QUOTATION STATUS
 * =========================================================
 */

function QuotationStatus({
  status,
  type,
}: {
  status: string;
  type: "new" | "reviewing" | "urgent";
}) {
  const styles: Record<string, string> = {
    new: "bg-amber-50 text-amber-700 border-amber-100",
    reviewing: "bg-indigo-50 text-indigo-700 border-indigo-100",
    urgent: "bg-rose-50 text-rose-700 border-rose-100",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full border text-[8px] font-bold ${
        styles[type] || styles.new
      }`}
    >
      {status}
    </span>
  );
}

/*
 * =========================================================
 * ACTIVITY ROW
 * =========================================================
 */

function ActivityRow({
  activity,
}: {
  activity: ActivityItem;
}) {
  const activityIcons = {
    order: <ShoppingBag className="h-4 w-4" />,
    quote: <FileText className="h-4 w-4" />,
    product: <Package className="h-4 w-4" />,
    message: <Users className="h-4 w-4" />,
  };

  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
        {activityIcons[activity.type]}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold text-slate-900">
            {activity.title}
          </p>

          <span className="text-[9px] font-medium text-slate-400 whitespace-nowrap">
            {activity.time}
          </span>
        </div>

        <p className="text-[10px] text-slate-400 font-medium mt-1">
          {activity.description}
        </p>
      </div>
    </div>
  );
}

/*
 * =========================================================
 * PRODUCT ROW
 * =========================================================
 */

function ProductRow({
  product,
}: {
  product: Product;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
          <Package className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-slate-900 truncate">
              {product.name}
            </p>

            {product.is_featured && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[8px] font-bold">
                Featured
              </span>
            )}
          </div>

          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
            {product.category}
          </p>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="text-xs font-bold text-slate-700">
          {product.stock_available ?? 0} units
        </p>

        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
          {product.price_min != null &&
          product.price_max != null
            ? `$${product.price_min} - $${product.price_max}`
            : "Price not set"}
        </p>
      </div>
    </div>
  );
}

/*
 * =========================================================
 * ORDER ROW
 * =========================================================
 */

function OrderRow({
  id,
  buyer,
  amount,
  status,
  statusType,
}: {
  id: string;
  buyer: string;
  amount: string;
  status: string;
  statusType: "processing" | "shipped" | "delivered";
}) {
  const statusStyles = {
    processing:
      "bg-amber-50 text-amber-700 border-amber-100",

    shipped:
      "bg-indigo-50 text-indigo-700 border-indigo-100",

    delivered:
      "bg-emerald-50 text-emerald-700 border-emerald-100",
  };

  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-2 rounded-lg bg-slate-100 text-slate-600 shrink-0">
          <ShoppingBag className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-900">
            {id}
          </p>

          <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
            {buyer}
          </p>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="text-xs font-black text-slate-900">
          {amount}
        </p>

        <span
          className={`inline-block mt-1 px-2 py-0.5 rounded-full border text-[9px] font-bold ${statusStyles[statusType]}`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}

/*
 * =========================================================
 * REVIEW ROW
 * =========================================================
 */

function ReviewRow({
  review,
  getRating,
}: {
  review: Review;
  getRating: (review: Review) => number | null;
}) {
  const rating = getRating(review);

  const buyerName =
    review.buyer_name ||
    (review.buyer_id
      ? `Buyer #${review.buyer_id}`
      : "Anonymous Buyer");

  const formattedDate = review.created_at
    ? new Date(review.created_at).toLocaleDateString()
    : "";

  return (
    <div className="p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-extrabold text-slate-900">
            {buyerName}
          </p>

          {formattedDate && (
            <p className="text-[9px] text-slate-400 font-medium mt-0.5">
              {formattedDate}
            </p>
          )}
        </div>

        {rating !== null && (
          <div className="flex items-center gap-1 shrink-0">
            <StarIcon />

            <span className="text-xs font-black text-amber-600">
              {rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {review.comment ? (
        <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-3">
          {review.comment}
        </p>
      ) : (
        <p className="text-[10px] text-slate-400 font-medium mt-3">
          No written comment provided.
        </p>
      )}
    </div>
  );
}

/*
 * =========================================================
 * QUICK ACTION
 * =========================================================
 */

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
    >
      <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
        {icon}
      </div>

      <div>
        <p className="text-xs font-extrabold text-slate-900">
          {title}
        </p>

        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
          {description}
        </p>
      </div>

      <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 ml-auto group-hover:text-indigo-500 transition-colors" />
    </Link>
  );
}

/*
 * =========================================================
 * STAR ICON
 * =========================================================
 */

function StarIcon() {
  return (
    <svg
      className="h-4 w-4 text-amber-400"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2.5l2.93 5.94 6.57.95-4.75 4.63 1.12 6.54-5.5-2.92-5.87 3.09 1.12-6.54L2.5 9.39l6.57-.95L12 2.5z" />
    </svg>
  );
}