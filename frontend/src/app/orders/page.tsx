"use client";

import React, { useEffect, useState } from "react";
import OrderMetrics from "../../components/Orders/OrderMetrics";
import OrderModal from "../../components/Orders/OrderModal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchOrders = () => {
    fetch(`${API_BASE_URL}/orders`)
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching orders:", err));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, { method: "PUT" });
      showNotification(`Order ${orderId} has been cancelled successfully.`);
      fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReorder = async (orderId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/reorder`, { method: "POST" });
      const data = await res.json();
      showNotification(`Reorder successful! New Order ID created: ${data.new_order_id}`);
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadInvoice = (orderId: string) => {
    window.open(`${API_BASE_URL}/pdf/invoice/${orderId}`, "_blank");
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      (o.id && o.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.buyer_id && o.buyer_id.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const activeProcessing = orders.filter((o) => o.status === "PROCESSING" || o.status === "PENDING").length;

  return (
    <div className="space-y-6">
      {notification && (
        <div className="bg-indigo-600 text-white px-4 py-3 rounded-xl shadow-lg flex justify-between items-center text-xs font-bold transition-all">
          <span>🔔 {notification}</span>
          <button onClick={() => setNotification(null)} className="font-bold text-white ml-4 text-base leading-none">&times;</button>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Order Management</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Track, manage, view timeline, shipment status, and download invoices.</p>
      </div>

      <OrderMetrics totalOrders={totalOrders} totalRevenue={totalRevenue} activeProcessing={activeProcessing} />

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <input
          type="text"
          placeholder="Search by Order ID or Buyer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-80 px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto px-3.5 py-2 border border-slate-200 rounded-xl text-xs bg-white outline-none font-semibold text-slate-700"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-slate-200/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                <th className="p-4">Order ID</th>
                <th className="p-4">Buyer ID</th>
                <th className="p-4">Vendor ID</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 font-medium">
                    No orders found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-bold text-indigo-600">{order.id}</td>
                    <td className="p-4 text-slate-600 font-medium">{order.buyer_id}</td>
                    <td className="p-4 text-slate-600 font-medium">{order.vendor_id}</td>
                    <td className="p-4 font-black text-slate-900">${(order.total_amount || 0).toFixed(2)}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                          order.status === "CANCELLED"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-all"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleReorder(order.id)}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-indigo-200 transition-all"
                      >
                        Reorder
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderModal
        selectedOrder={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onDownloadInvoice={handleDownloadInvoice}
        onCancelOrder={handleCancel}
      />
    </div>
  );
}