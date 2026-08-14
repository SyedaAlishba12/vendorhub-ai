"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Eye,
  Package,
  Search,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";

import { Card } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import { getStoredToken, useAuth } from "@/context/AuthContext";

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

type StatusFilter =
  | "ALL"
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export default function VendorOrdersPage() {
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000";

  // =========================================================
  // FETCH ORDERS
  // =========================================================

  useEffect(() => {
    if (authLoading) {
      return;
    }

    const fetchOrders = async () => {
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
          `${API_URL}/api/orders`,
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
          "VENDOR ORDERS STATUS:",
          response.status
        );

        console.log(
          "VENDOR ORDERS RESPONSE:",
          data
        );

        if (!response.ok) {
          throw new Error(
            typeof data?.detail === "string"
              ? data.detail
              : "Failed to load orders."
          );
        }

        const allOrders: Order[] =
          Array.isArray(data) ? data : [];

        // -----------------------------------------------------
        // Only show orders belonging to the logged-in vendor.
        // -----------------------------------------------------

       const vendorId = user?.id
  ? `VEN-${String(user.id).padStart(3, "0")}`
  : "";

const vendorOrders = vendorId
  ? allOrders.filter(
      (order) =>
        String(order.vendor_id).toUpperCase() ===
        vendorId.toUpperCase()
    )
  : [];
        setOrders(vendorOrders);
      } catch (err) {
        console.error(
          "FETCH VENDOR ORDERS ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load orders."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [API_URL, user?.id, authLoading]);

  // =========================================================
  // FILTER ORDERS
  // =========================================================

  const filteredOrders = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        order.status?.toUpperCase() ===
          statusFilter;

      const matchesSearch =
        !search ||
        order.id
          ?.toLowerCase()
          .includes(search) ||
        order.buyer_id
          ?.toLowerCase()
          .includes(search) ||
        order.status
          ?.toLowerCase()
          .includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [
    orders,
    searchTerm,
    statusFilter,
  ]);

  // =========================================================
  // ORDER STATISTICS
  // =========================================================

  const statistics = useMemo(() => {
    const total = orders.length;

    const pending = orders.filter(
      (order) =>
        order.status?.toUpperCase() ===
        "PENDING"
    ).length;

    const processing = orders.filter(
      (order) =>
        order.status?.toUpperCase() ===
        "PROCESSING"
    ).length;

    const shipped = orders.filter(
      (order) =>
        order.status?.toUpperCase() ===
        "SHIPPED"
    ).length;

    const delivered = orders.filter(
      (order) =>
        order.status?.toUpperCase() ===
        "DELIVERED"
    ).length;

    const cancelled = orders.filter(
      (order) =>
        order.status?.toUpperCase() ===
        "CANCELLED"
    ).length;

    const totalRevenue = orders
      .filter(
        (order) =>
          order.status?.toUpperCase() !==
          "CANCELLED"
      )
      .reduce(
        (sum, order) =>
          sum +
          Number(order.total_amount || 0),
        0
      );

    return {
      total,
      pending,
      processing,
      shipped,
      delivered,
      cancelled,
      totalRevenue,
    };
  }, [orders]);

  // =========================================================
  // FORMATTERS
  // =========================================================

  const formatCurrency = (
    amount: number
  ) => {
    return new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }
    ).format(amount || 0);
  };

  const formatDate = (
    dateString: string
  ) => {
    if (!dateString) {
      return "Unknown date";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            Vendor Portal
          </p>

          <h2 className="text-2xl font-black text-slate-900">
            Orders
          </h2>

          <p className="text-sm text-slate-500 font-medium mt-1">
            Loading your orders...
          </p>
        </div>

        <Card>
          <div className="py-16 text-center">
            <ShoppingBag className="h-8 w-8 mx-auto text-slate-300 mb-3 animate-pulse" />

            <p className="text-sm font-bold text-slate-500">
              Loading orders...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/vendor"
              className="text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Dashboard
            </Link>
          </div>

          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            Vendor Portal
          </p>

          <h2 className="text-2xl font-black text-slate-900">
            Orders
          </h2>

          <p className="text-sm text-slate-500 font-medium mt-1">
            Manage and track orders from your buyers.
          </p>
        </div>

        <Link href="/vendor">
          <Button
            variant="outline"
            size="sm"
          >
            Back to Dashboard
          </Button>
        </Link>

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
          ORDER STATISTICS
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          title="Total Orders"
          value={statistics.total}
          icon={
            <ShoppingBag className="h-5 w-5" />
          }
          iconClass="bg-indigo-50 text-indigo-600"
        />

        <StatCard
          title="Pending"
          value={statistics.pending}
          icon={
            <Clock className="h-5 w-5" />
          }
          iconClass="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="Processing"
          value={statistics.processing}
          icon={
            <Package className="h-5 w-5" />
          }
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Delivered"
          value={statistics.delivered}
          icon={
            <CheckCircle2 className="h-5 w-5" />
          }
          iconClass="bg-emerald-50 text-emerald-600"
        />

      </div>

      {/* =====================================================
          REVENUE SUMMARY
      ===================================================== */}

      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Order Revenue
            </p>

            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {formatCurrency(
                statistics.totalRevenue
              )}
            </h3>

            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Total value of non-cancelled orders
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

            <MiniStat
              label="Shipped"
              value={statistics.shipped}
              icon={
                <Truck className="h-3.5 w-3.5" />
              }
            />

            <MiniStat
              label="Cancelled"
              value={statistics.cancelled}
              icon={
                <XCircle className="h-3.5 w-3.5" />
              }
            />

            <MiniStat
              label="Delivered"
              value={statistics.delivered}
              icon={
                <CheckCircle2 className="h-3.5 w-3.5" />
              }
            />

          </div>

        </div>
      </Card>

      {/* =====================================================
          ORDERS
      ===================================================== */}

      <Card
        title="All Orders"
        subtitle={`${filteredOrders.length} order${
          filteredOrders.length === 1
            ? ""
            : "s"
        } found`}
      >

        {/* SEARCH + FILTER */}

        <div className="flex flex-col md:flex-row gap-3 mb-5">

          <div className="relative flex-1">

            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Search orders..."
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />

          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target
                  .value as StatusFilter
              )
            }
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="ALL">
              All Statuses
            </option>

            <option value="PENDING">
              Pending
            </option>

            <option value="PROCESSING">
              Processing
            </option>

            <option value="SHIPPED">
              Shipped
            </option>

            <option value="DELIVERED">
              Delivered
            </option>

            <option value="CANCELLED">
              Cancelled
            </option>
          </select>

        </div>

        {/* ORDER LIST */}

        {filteredOrders.length === 0 ? (

          <div className="py-14 text-center">

            <ShoppingBag className="h-9 w-9 mx-auto text-slate-300 mb-3" />

            <p className="text-sm font-bold text-slate-600">
              No orders found
            </p>

            <p className="text-[11px] text-slate-400 mt-1">
              {orders.length === 0
                ? "You do not have any orders yet."
                : "Try changing your search or status filter."}
            </p>

          </div>

        ) : (

          <div className="space-y-3">

            {filteredOrders.map(
              (order) => (
                <VendorOrderRow
                  key={order.id}
                  order={order}
                  formatCurrency={
                    formatCurrency
                  }
                  formatDate={
                    formatDate
                  }
                />
              )
            )}

          </div>

        )}

      </Card>

    </div>
  );
}

/*
 * =========================================================
 * STAT CARD
 * =========================================================
 */

function StatCard({
  title,
  value,
  icon,
  iconClass,
}: {
  title: string;
  value: number;
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

/*
 * =========================================================
 * MINI STAT
 * =========================================================
 */

function MiniStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="px-4 py-3 rounded-xl border border-slate-200">

      <div className="flex items-center gap-1.5 text-slate-400">
        {icon}

        <span className="text-[9px] font-bold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="text-lg font-black text-slate-900 mt-1">
        {value}
      </p>

    </div>
  );
}

/*
 * =========================================================
 * VENDOR ORDER ROW
 * =========================================================
 */

function VendorOrderRow({
  order,
  formatCurrency,
  formatDate,
}: {
  order: Order;
  formatCurrency: (
    amount: number
  ) => string;
  formatDate: (
    date: string
  ) => string;
}) {
  const status =
    order.status?.toUpperCase() ||
    "UNKNOWN";

  const statusStyles: Record<
    string,
    string
  > = {
    PENDING:
      "bg-amber-50 text-amber-700 border-amber-100",

    PROCESSING:
      "bg-blue-50 text-blue-700 border-blue-100",

    SHIPPED:
      "bg-indigo-50 text-indigo-700 border-indigo-100",

    DELIVERED:
      "bg-emerald-50 text-emerald-700 border-emerald-100",

    CANCELLED:
      "bg-rose-50 text-rose-700 border-rose-100",
  };

  const statusIcons: Record<
    string,
    React.ReactNode
  > = {
    PENDING: (
      <Clock className="h-3 w-3" />
    ),

    PROCESSING: (
      <Package className="h-3 w-3" />
    ),

    SHIPPED: (
      <Truck className="h-3 w-3" />
    ),

    DELIVERED: (
      <CheckCircle2 className="h-3 w-3" />
    ),

    CANCELLED: (
      <XCircle className="h-3 w-3" />
    ),
  };

  const itemCount =
    order.items?.reduce(
      (sum, item) =>
        sum + Number(item.qty || 0),
      0
    ) || 0;

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all">

      {/* ORDER INFO */}

      <div className="flex items-start gap-3 min-w-0">

        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
          <ShoppingBag className="h-4 w-4" />
        </div>

        <div className="min-w-0">

          <div className="flex items-center gap-2 flex-wrap">

            <h4 className="text-xs font-extrabold text-slate-900">
              {order.id}
            </h4>

            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold ${
                statusStyles[status] ||
                "bg-slate-50 text-slate-600 border-slate-200"
              }`}
            >
              {statusIcons[status]}
              {status}
            </span>

          </div>

          <p className="text-[10px] text-slate-400 font-medium mt-1">
            Buyer ID: {order.buyer_id}
          </p>

          <div className="flex items-center gap-3 mt-1">

            <p className="text-[10px] text-slate-500 font-semibold">
              {itemCount} item
              {itemCount === 1
                ? ""
                : "s"}
            </p>

            <span className="text-slate-300">
              ·
            </span>

            <p className="text-[10px] text-slate-400 font-medium">
              {formatDate(
                order.created_at
              )}
            </p>

          </div>

        </div>

      </div>

      {/* ORDER VALUE */}

      <div className="flex items-center justify-between lg:justify-end gap-5">

        <div className="text-right">

          <p className="text-sm font-black text-slate-900">
            {formatCurrency(
              Number(
                order.total_amount || 0
              )
            )}
          </p>

          <p className="text-[9px] text-slate-400 font-medium mt-0.5">
            Payment:{" "}
            {order.payment_status ||
              "Unknown"}
          </p>

        </div>

        <Link
          href={`/vendor/orders/${order.id}`}
        >
          <Button
            variant="outline"
            size="sm"
          >
            <Eye className="h-3.5 w-3.5" />
            View
            <ArrowUpRight className="h-3 w-3" />
          </Button>
        </Link>

      </div>

    </div>
  );
}