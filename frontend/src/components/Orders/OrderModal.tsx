import React from "react";

interface OrderModalProps {
  selectedOrder: any;
  onClose: () => void;
  onDownloadInvoice: (id: string) => void;
  onCancelOrder: (id: string) => void;
}

export default function OrderModal({ selectedOrder, onClose, onDownloadInvoice, onCancelOrder }: OrderModalProps) {
  if (!selectedOrder) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Order Details — {selectedOrder.id}</h3>
            <p className="text-xs text-gray-500">Placed on {selectedOrder.created_at}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">
            &times;
          </button>
        </div>

        {/* Timeline Tracking */}
        <div>
          <h4 className="text-xs font-bold uppercase text-gray-500 mb-3">Order Status Tracking Timeline</h4>
          <div className="grid grid-cols-4 gap-2 text-center">
            {(selectedOrder.timeline && selectedOrder.timeline.length > 0
              ? selectedOrder.timeline
              : [
                  { status: "Order Placed", date: selectedOrder.created_at || "Done", completed: true },
                  { status: "Processing", date: "In Progress", completed: selectedOrder.status !== "CANCELLED" },
                  { status: "Shipped", date: "Pending", completed: selectedOrder.status === "SHIPPED" || selectedOrder.status === "DELIVERED" },
                  { status: "Delivered", date: "Pending", completed: selectedOrder.status === "DELIVERED" }
                ]
            ).map((step: any, idx: number) => (
              <div
                key={idx}
                className={`p-2 rounded-lg border text-xs ${
                  step.completed ? "bg-green-50 border-green-300 text-green-800" : "bg-gray-50 text-gray-400"
                }`}
              >
                <p className="font-bold">{step.status}</p>
                <p className="text-[10px] mt-0.5">{step.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Shipment Tracking */}
        <div className="bg-gray-50 p-4 rounded-lg border space-y-1 text-xs">
          <p className="font-bold text-gray-700">Shipment & Delivery Info</p>
          <p><span className="text-gray-500">Courier:</span> {selectedOrder.shipment?.courier || "DHL Express"}</p>
          <p><span className="text-gray-500">Tracking Number:</span> {selectedOrder.shipment?.tracking_number || "TRK-8830192"}</p>
          <p><span className="text-gray-500">Estimated Delivery:</span> {selectedOrder.shipment?.estimated_delivery || "3-5 Business Days"}</p>
        </div>

        {/* Purchase Items List */}
        <div>
          <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Items Ordered</h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-100 text-gray-600 uppercase">
                <tr>
                  <th className="p-2 text-left">Item Name</th>
                  <th className="p-2 text-center">Qty</th>
                  <th className="p-2 text-right">Unit Price</th>
                </tr>
              </thead>
              <tbody>
                {(selectedOrder.items && selectedOrder.items.length > 0
                  ? selectedOrder.items
                  : [{ name: "Standard Vendor Product", qty: 1, price: selectedOrder.total_amount || 0 }]
                ).map((item: any, idx: number) => (
                  <tr key={idx} className="border-t">
                    <td className="p-2 font-medium">{item.name}</td>
                    <td className="p-2 text-center">{item.qty}</td>
                    <td className="p-2 text-right">${(item.price || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex justify-between items-center pt-3 border-t">
          <div className="flex gap-2">
            <button
              onClick={() => onDownloadInvoice(selectedOrder.id)}
              className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-2 rounded shadow-sm flex items-center gap-1"
            >
              📄 Download Invoice (PDF)
            </button>
            {selectedOrder.status !== "CANCELLED" && (
              <button
                onClick={() => onCancelOrder(selectedOrder.id)}
                className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-2 rounded border border-red-200"
              >
                Cancel Order
              </button>
            )}
          </div>
          <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold px-4 py-2 rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}