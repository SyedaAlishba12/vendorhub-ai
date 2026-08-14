"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  XCircle,
  ShoppingBag,
} from "lucide-react";

import { Card } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import { getStoredToken } from "@/context/AuthContext";

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Shipment {
  courier: string;
  tracking_number: string;
  status: string;
  estimated_delivery: string;
}

interface OrderTimeline {
  status: string;
  date: string;
  completed: boolean;
}

interface Order {
  id: string;
  buyer_id: string;
  vendor_id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  items: OrderItem[];
  shipment?: Shipment;
  timeline?: OrderTimeline[];
}

export default function VendorOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [orderId, setOrderId] = useState("");

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000";

  // Get order ID from URL
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setOrderId(resolvedParams.id);
    };

    getParams();
  }, [params]);

  // Fetch order details
  useEffect(() => {
    if (!orderId) {
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getStoredToken();

        if (!token) {
          setError(
            "Authentication token not found. Please login again."
          );
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${API_URL}/api/orders/${orderId}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response
          .json()
          .catch(() => null);

        console.log(
          "ORDER DETAILS STATUS:",
          response.status
        );

        console.log(
          "ORDER DETAILS RESPONSE:",
          data
        );

        if (!response.ok) {
          throw new Error(
            typeof data?.detail === "string"
              ? data.detail
              : "Failed to load order details."
          );
        }

        setOrder(data);
      } catch (err) {
        console.error(
          "FETCH ORDER DETAILS ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load order details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, API_URL]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) {
      return "Unknown date";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusClass = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-100";

      case "PROCESSING":
        return "bg-blue-50 text-blue-700 border-blue-100";

      case "SHIPPED":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";

      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";

      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-100";

      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            Vendor Portal
          </p>

          <h2 className="text-2xl font-black text-slate-900">
            Order Details
          </h2>

          <p className="text-sm text-slate-500 font-medium mt-1">
            Loading order details...
          </p>
        </div>

        <Card>
          <div className="py-16 text-center">
            <ShoppingBag className="h-8 w-8 mx-auto text-slate-300 mb-3 animate-pulse" />

            <p className="text-sm font-bold text-slate-500">
              Loading order...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">

        <Link
          href="/vendor/orders"
          className="text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Orders
        </Link>

        <Card>
          <div className="py-16 text-center">

            <XCircle className="h-10 w-10 mx-auto text-rose-300 mb-3" />

            <p className="text-sm font-bold text-slate-700">
              {error || "Order not found"}
            </p>

            <p className="text-[11px] text-slate-400 mt-1">
              Order ID: {orderId}
            </p>

          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>
        <Link
          href="/vendor/orders"
          className="text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1 mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Orders
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
              Vendor Portal
            </p>

            <div className="flex items-center gap-3 flex-wrap">

              <h2 className="text-2xl font-black text-slate-900">
                Order {order.id}
              </h2>

              <span
                className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${getStatusClass(
                  order.status
                )}`}
              >
                {order.status}
              </span>

            </div>

            <p className="text-sm text-slate-500 font-medium mt-1">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>

        </div>
      </div>

      {/* ORDER SUMMARY */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <Card>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Buyer
          </p>

          <p className="text-lg font-black text-slate-900 mt-2">
            {order.buyer_id}
          </p>
        </Card>

        <Card>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Payment
          </p>

          <p className="text-lg font-black text-slate-900 mt-2">
            {order.payment_status}
          </p>
        </Card>

        <Card>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Total Amount
          </p>

          <p className="text-lg font-black text-slate-900 mt-2">
            {formatCurrency(order.total_amount)}
          </p>
        </Card>

      </div>

      {/* ITEMS */}

      <Card
        title="Order Items"
        subtitle={`${order.items?.length || 0} product${
          order.items?.length === 1 ? "" : "s"
        }`}
      >

        <div className="space-y-3">

          {order.items?.map((item, index) => {

            const itemTotal =
              Number(item.qty || 0) *
              Number(item.price || 0);

            return (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200"
              >

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {item.name}
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Quantity: {item.qty}
                  </p>
                </div>

                <div className="text-right">

                  <p className="text-sm font-black text-slate-900">
                    {formatCurrency(itemTotal)}
                  </p>

                  <p className="text-[10px] text-slate-400">
                    {formatCurrency(item.price)} each
                  </p>

                </div>

              </div>
            );
          })}

        </div>

      </Card>

      {/* SHIPMENT */}

      {order.shipment && (
        <Card
          title="Shipment"
          subtitle="Shipping and delivery information"
        >

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <DetailItem
              label="Courier"
              value={order.shipment.courier}
            />

            <DetailItem
              label="Tracking Number"
              value={order.shipment.tracking_number}
            />

            <DetailItem
              label="Shipment Status"
              value={order.shipment.status}
            />

            <DetailItem
              label="Estimated Delivery"
              value={order.shipment.estimated_delivery}
            />

          </div>

        </Card>
      )}

      {/* TIMELINE */}

      <Card
        title="Order Timeline"
        subtitle="Track the progress of this order"
      >

        <div className="space-y-5">

          {order.timeline?.map(
            (step, index) => (

              <div
                key={index}
                className="flex items-start gap-3"
              >

                <div
                  className={`mt-0.5 p-2 rounded-full ${
                    step.completed
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                </div>

                <div>

                  <p
                    className={`text-sm font-bold ${
                      step.completed
                        ? "text-slate-900"
                        : "text-slate-400"
                    }`}
                  >
                    {step.status}
                  </p>

                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {step.date}
                  </p>

                </div>

              </div>
            )
          )}

        </div>

      </Card>

    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="p-3 rounded-xl border border-slate-200">

      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
        {label}
      </p>

      <p className="text-xs font-bold text-slate-800 mt-1 break-words">
        {value || "N/A"}
      </p>

    </div>
  );
}