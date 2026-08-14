"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Star,
  MessageSquare,
  ThumbsUp,
  Flag,
  Trash2,
  Users,
  Truck,
  CheckCircle2,
  Clock,
} from "lucide-react";

import { Card } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import { getStoredToken } from "@/context/AuthContext";

interface ReviewRating {
  id?: string;
  review_id?: string;
  overall_rating: number;
  product_rating: number;
  communication_rating: number;
  delivery_rating: number;
  quality_rating: number;
  service_rating: number;
}

interface Review {
  id: string;
  vendor_id: string;
  buyer_id: string;
  buyer_name: string;
  product_id?: string | null;
  comment: string;
  helpful_votes: number;
  is_reported?: boolean;
  created_at: string;
  ratings?: ReviewRating | null;
}

interface ReviewStatistics {
  total_reviews: number;
  average_overall: number;
  breakdown: {
    product: number;
    communication: number;
    delivery: number;
    quality: number;
    service: number;
  };
}

interface Product {
  id: number;
  vendor_id: number;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

export default function VendorReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statistics, setStatistics] =
    useState<ReviewStatistics | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getStoredToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      // ---------------------------------------------------------
      // Get vendor ID from the vendor's products
      // ---------------------------------------------------------

      const productsResponse = await fetch(
        `${API_URL}/products/my`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const productsData =
        await productsResponse.json().catch(() => null);

      if (!productsResponse.ok) {
        throw new Error(
          typeof productsData?.detail === "string"
            ? productsData.detail
            : "Failed to load vendor information."
        );
      }

      const products: Product[] = Array.isArray(productsData)
        ? productsData
        : Array.isArray(productsData?.data)
        ? productsData.data
        : [];

      if (products.length === 0) {
        setReviews([]);

        setStatistics({
          total_reviews: 0,
          average_overall: 0,
          breakdown: {
            product: 0,
            communication: 0,
            delivery: 0,
            quality: 0,
            service: 0,
          },
        });

        return;
      }

      const vendorId = String(products[0].vendor_id);

      console.log("REVIEWS VENDOR ID:", vendorId);

      // ---------------------------------------------------------
      // Fetch real reviews
      // ---------------------------------------------------------

      const reviewsResponse = await fetch(
        `${API_URL}/api/reviews?vendor_id=${encodeURIComponent(
          vendorId
        )}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const reviewsData =
        await reviewsResponse.json().catch(() => null);

      console.log(
        "REVIEWS API STATUS:",
        reviewsResponse.status
      );

      console.log(
        "REVIEWS API RESPONSE:",
        reviewsData
      );

      if (!reviewsResponse.ok) {
        throw new Error(
          typeof reviewsData?.detail === "string"
            ? reviewsData.detail
            : "Failed to load reviews."
        );
      }

      // ---------------------------------------------------------
      // Support both:
      // [ ...reviews ]
      // and
      // { data: [ ...reviews ] }
      // ---------------------------------------------------------

      const rawReviews = Array.isArray(reviewsData)
        ? reviewsData
        : Array.isArray(reviewsData?.data)
        ? reviewsData.data
        : [];

      // ---------------------------------------------------------
      // Normalize review data
      // ---------------------------------------------------------

      const loadedReviews: Review[] = rawReviews.map(
        (review: any) => ({
          id: String(review.id),

          vendor_id: String(
            review.vendor_id ?? vendorId
          ),

          buyer_id: String(
            review.buyer_id ??
              review.reviewer_id ??
              ""
          ),

          buyer_name:
            review.buyer_name ??
            review.reviewer_name ??
            review.buyer?.name ??
            "Buyer",

          product_id:
            review.product_id ??
            review.product?.id ??
            null,

          comment:
            review.comment ??
            review.content ??
            review.text ??
            "",

          helpful_votes:
            Number(
              review.helpful_votes ??
                review.helpful_count ??
                0
            ),

          is_reported:
            Boolean(
              review.is_reported ??
                review.reported ??
                review.status === "reported"
            ),

          created_at:
            review.created_at ??
            review.createdAt ??
            new Date().toISOString(),

          ratings: review.ratings
            ? {
                id: review.ratings.id,

                review_id:
                  review.ratings.review_id,

                overall_rating: Number(
                  review.ratings.overall_rating ??
                    review.ratings.rating_overall ??
                    review.rating_overall ??
                    review.overall_rating ??
                    0
                ),

                product_rating: Number(
                  review.ratings.product_rating ??
                    review.ratings.rating_product ??
                    review.rating_product ??
                    review.product_rating ??
                    0
                ),

                communication_rating: Number(
                  review.ratings.communication_rating ??
                    review.ratings.rating_communication ??
                    review.rating_communication ??
                    review.communication_rating ??
                    0
                ),

                delivery_rating: Number(
                  review.ratings.delivery_rating ??
                    review.ratings.rating_delivery ??
                    review.rating_delivery ??
                    review.delivery_rating ??
                    0
                ),

                quality_rating: Number(
                  review.ratings.quality_rating ??
                    review.ratings.rating_quality ??
                    review.rating_quality ??
                    review.quality_rating ??
                    0
                ),

                service_rating: Number(
                  review.ratings.service_rating ??
                    review.ratings.rating_service ??
                    review.rating_service ??
                    review.service_rating ??
                    0
                ),
              }
            : {
                overall_rating: Number(
                  review.rating_overall ??
                    review.overall_rating ??
                    review.rating ??
                    0
                ),

                product_rating: Number(
                  review.rating_product ??
                    review.product_rating ??
                    0
                ),

                communication_rating: Number(
                  review.rating_communication ??
                    review.communication_rating ??
                    0
                ),

                delivery_rating: Number(
                  review.rating_delivery ??
                    review.delivery_rating ??
                    0
                ),

                quality_rating: Number(
                  review.rating_quality ??
                    review.quality_rating ??
                    0
                ),

                service_rating: Number(
                  review.rating_service ??
                    review.service_rating ??
                    0
                ),
              },
        })
      );

      // ---------------------------------------------------------
      // Sort newest first
      // ---------------------------------------------------------

      loadedReviews.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );

      setReviews(loadedReviews);

      // ---------------------------------------------------------
      // Calculate real statistics from reviews
      // ---------------------------------------------------------

      if (loadedReviews.length === 0) {
        setStatistics({
          total_reviews: 0,
          average_overall: 0,
          breakdown: {
            product: 0,
            communication: 0,
            delivery: 0,
            quality: 0,
            service: 0,
          },
        });

        return;
      }

      const total = loadedReviews.length;

      const getAverage = (
        getter: (review: Review) => number
      ) => {
        const values = loadedReviews
          .map(getter)
          .filter(
            (value) =>
              Number.isFinite(value) && value > 0
          );

        if (values.length === 0) {
          return 0;
        }

        return (
          values.reduce(
            (sum, value) => sum + value,
            0
          ) / values.length
        );
      };

      setStatistics({
        total_reviews: total,

        average_overall: getAverage(
          (review) =>
            review.ratings?.overall_rating ?? 0
        ),

        breakdown: {
          product: getAverage(
            (review) =>
              review.ratings?.product_rating ?? 0
          ),

          communication: getAverage(
            (review) =>
              review.ratings?.communication_rating ?? 0
          ),

          delivery: getAverage(
            (review) =>
              review.ratings?.delivery_rating ?? 0
          ),

          quality: getAverage(
            (review) =>
              review.ratings?.quality_rating ?? 0
          ),

          service: getAverage(
            (review) =>
              review.ratings?.service_rating ?? 0
          ),
        },
      });
    } catch (err) {
      console.error("FETCH REVIEWS ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load reviews."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return reviews;
    }

    return reviews.filter(
      (review) =>
        review.buyer_name
          ?.toLowerCase()
          .includes(value) ||
        review.comment
          ?.toLowerCase()
          .includes(value)
    );
  }, [reviews, search]);

  const handleHelpful = async (reviewId: string) => {
    try {
      const token = getStoredToken();

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      setActionLoading(`helpful-${reviewId}`);

      const response = await fetch(
        `${API_URL}/api/reviews/${reviewId}/helpful`,
        {
          method: "POST",
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
            : "Failed to update helpful count."
        );
      }

      setReviews((current) =>
        current.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                helpful_votes:
                  data?.helpful_votes ??
                  review.helpful_votes + 1,
              }
            : review
        )
      );
    } catch (err) {
      console.error("HELPFUL ERROR:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Failed to update helpful count."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReport = async (reviewId: string) => {
    const reason = window.prompt(
      "Why are you reporting this review?"
    );

    if (!reason) {
      return;
    }

    try {
      const token = getStoredToken();

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      setActionLoading(`report-${reviewId}`);

      const response = await fetch(
        `${API_URL}/api/reviews/${reviewId}/report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            reported_by: "VENDOR",
            reason,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          typeof data?.detail === "string"
            ? data.detail
            : "Failed to report review."
        );
      }

      setReviews((current) =>
        current.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                is_reported: true,
              }
            : review
        )
      );

      alert("Review reported successfully.");
    } catch (err) {
      console.error(
        "REPORT REVIEW ERROR:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Failed to report review."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = getStoredToken();

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      setActionLoading(`delete-${reviewId}`);

      const response = await fetch(
        `${API_URL}/api/reviews/${reviewId}`,
        {
          method: "DELETE",
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
            : "Failed to delete review."
        );
      }

      setReviews((current) =>
        current.filter(
          (review) => review.id !== reviewId
        )
      );

      // Refresh statistics after deleting a review.
      await fetchReviews();
    } catch (err) {
      console.error(
        "DELETE REVIEW ERROR:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Failed to delete review."
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href="/vendor"
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>

          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            Vendor Portal
          </p>

          <h2 className="text-2xl font-black text-slate-900">
            Customer Reviews
          </h2>

          <p className="text-sm text-slate-500 font-medium mt-1">
            View and manage feedback from your buyers.
          </p>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <Card>
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
            <p className="text-xs font-bold text-rose-700">
              {error}
            </p>
          </div>
        </Card>
      )}

      {/* STATISTICS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Average Rating"
          value={
            loading
              ? "..."
              : `${statistics?.average_overall?.toFixed(1) ?? "0.0"} / 5`
          }
          icon={<Star className="h-5 w-5" />}
          iconClass="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="Total Reviews"
          value={
            loading
              ? "..."
              : String(statistics?.total_reviews ?? 0)
          }
          icon={<MessageSquare className="h-5 w-5" />}
          iconClass="bg-indigo-50 text-indigo-600"
        />

        <StatCard
          title="Delivery Rating"
          value={
            loading
              ? "..."
              : `${statistics?.breakdown.delivery?.toFixed(1) ?? "0.0"} / 5`
          }
          icon={<Truck className="h-5 w-5" />}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Quality Rating"
          value={
            loading
              ? "..."
              : `${statistics?.breakdown.quality?.toFixed(1) ?? "0.0"} / 5`
          }
          icon={<CheckCircle2 className="h-5 w-5" />}
          iconClass="bg-indigo-50 text-indigo-600"
        />
      </div>

      {/* RATING BREAKDOWN */}

      <Card
        title="Rating Breakdown"
        subtitle="Average rating across different service areas"
      >
        {loading ? (
          <div className="py-8 text-center">
            <p className="text-xs font-semibold text-slate-400">
              Loading statistics...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <RatingBreakdown
              title="Product"
              value={statistics?.breakdown.product ?? 0}
            />

            <RatingBreakdown
              title="Communication"
              value={
                statistics?.breakdown.communication ?? 0
              }
            />

            <RatingBreakdown
              title="Delivery"
              value={
                statistics?.breakdown.delivery ?? 0
              }
            />

            <RatingBreakdown
              title="Quality"
              value={
                statistics?.breakdown.quality ?? 0
              }
            />

            <RatingBreakdown
              title="Service"
              value={
                statistics?.breakdown.service ?? 0
              }
            />
          </div>
        )}
      </Card>

      {/* REVIEWS */}

      <Card
        title="Buyer Reviews"
        subtitle={`${filteredReviews.length} review${
          filteredReviews.length === 1 ? "" : "s"
        }`}
        headerAction={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search reviews..."
              className="w-56 pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        }
      >
        {loading ? (
          <div className="py-10 text-center">
            <Clock className="h-7 w-7 mx-auto text-slate-300 mb-2" />

            <p className="text-xs font-semibold text-slate-400">
              Loading reviews...
            </p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-10 text-center">
            <MessageSquare className="h-9 w-9 mx-auto text-slate-300 mb-2" />

            <p className="text-sm font-bold text-slate-600">
              {search
                ? "No reviews match your search."
                : "No reviews yet."}
            </p>

            <p className="text-[10px] text-slate-400 mt-1">
              Buyer reviews will appear here once customers
              leave feedback.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                actionLoading={actionLoading}
                onHelpful={handleHelpful}
                onReport={handleReport}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  icon,
  iconClass,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            {title}
          </p>

          <h3 className="text-2xl font-black text-slate-900 mt-2">
            {value}
          </h3>
        </div>

        <div
          className={`p-3 rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   RATING BREAKDOWN
========================================================= */

function RatingBreakdown({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  const percentage = Math.min(
    Math.max((value / 5) * 100, 0),
    100
  );

  return (
    <div className="p-4 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-slate-700">
          {title}
        </p>

        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 text-amber-500 fill-current" />

          <span className="text-xs font-black text-slate-900">
            {value.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <p className="text-[9px] text-slate-400 mt-2">
        out of 5
      </p>
    </div>
  );
}

/* =========================================================
   REVIEW CARD
========================================================= */

function ReviewCard({
  review,
  actionLoading,
  onHelpful,
  onReport,
  onDelete,
}: {
  review: Review;
  actionLoading: string | null;
  onHelpful: (reviewId: string) => void;
  onReport: (reviewId: string) => void;
  onDelete: (reviewId: string) => void;
}) {
  const rating =
    review.ratings?.overall_rating ?? 0;

  return (
    <div className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/10 transition-all">
      {/* TOP */}

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="h-4 w-4" />
          </div>

          <div>
            <p className="text-sm font-extrabold text-slate-900">
              {review.buyer_name}
            </p>

            <p className="text-[10px] text-slate-400 mt-0.5">
              {new Date(
                review.created_at
              ).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* RATING */}

        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100">
          <Star className="h-3.5 w-3.5 text-amber-500 fill-current" />

          <span className="text-xs font-black text-amber-700">
            {rating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* COMMENT */}

      <p className="text-sm text-slate-600 leading-relaxed mt-4">
        {review.comment}
      </p>

      {/* RATING DETAILS */}

      {review.ratings && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4">
          <MiniRating
            label="Product"
            value={
              review.ratings.product_rating
            }
          />

          <MiniRating
            label="Communication"
            value={
              review.ratings.communication_rating
            }
          />

          <MiniRating
            label="Delivery"
            value={
              review.ratings.delivery_rating
            }
          />

          <MiniRating
            label="Quality"
            value={
              review.ratings.quality_rating
            }
          />

          <MiniRating
            label="Service"
            value={
              review.ratings.service_rating
            }
          />
        </div>
      )}

      {/* ACTIONS */}

      <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-100">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onHelpful(review.id)
          }
          disabled={
            actionLoading ===
            `helpful-${review.id}`
          }
        >
          <ThumbsUp className="h-3.5 w-3.5" />

          Helpful ({review.helpful_votes ?? 0})
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onReport(review.id)
          }
          disabled={
            actionLoading ===
              `report-${review.id}` ||
            review.is_reported
          }
        >
          <Flag className="h-3.5 w-3.5" />

          {review.is_reported
            ? "Reported"
            : "Report"}
        </Button>

        <button
          type="button"
          onClick={() =>
            onDelete(review.id)
          }
          disabled={
            actionLoading ===
            `delete-${review.id}`
          }
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />

          Delete
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   MINI RATING
========================================================= */

function MiniRating({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="px-2.5 py-2 rounded-lg bg-slate-50">
      <p className="text-[9px] font-bold text-slate-400">
        {label}
      </p>

      <div className="flex items-center gap-1 mt-1">
        <Star className="h-3 w-3 text-amber-500 fill-current" />

        <span className="text-[10px] font-black text-slate-700">
          {value.toFixed(1)}
        </span>
      </div>
    </div>
  );
}