import React from "react";

interface OrderMetricsProps {
  totalOrders: number;
  totalRevenue: number;
  activeProcessing: number;
}

export default function OrderMetrics({ totalOrders, totalRevenue, activeProcessing }: OrderMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <p className="text-xs font-bold text-gray-400 uppercase">Total Orders</p>
        <p className="text-3xl font-extrabold text-gray-900 mt-2">{totalOrders}</p>
      </div>
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <p className="text-xs font-bold text-gray-400 uppercase">Total Revenue</p>
        <p className="text-3xl font-extrabold text-green-600 mt-2">${totalRevenue.toFixed(2)}</p>
      </div>
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <p className="text-xs font-bold text-gray-400 uppercase">Active Processing</p>
        <p className="text-3xl font-extrabold text-amber-500 mt-2">{activeProcessing}</p>
      </div>
    </div>
  );
}