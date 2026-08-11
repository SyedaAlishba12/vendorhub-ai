"use client";

import { useEffect, useState } from "react";

import { Trophy } from "lucide-react";

import AppShell from "@/components/UI/AppShell";

interface Quote {
  id: number;
  vendor_id: number;
  vendor_name: string | null;
  vendor_certification: string | null;
  product_id: number | null;
  product_name: string | null;
  rfq_reference: string | null;
  price: number;
  moq: number | null;
  delivery_days: number | null;
  payment_terms: string | null;
  warranty_months: number | null;
  notes: string | null;
}

export default function QuoteComparisonTable() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRfq, setSelectedRfq] = useState("");
  const [aiRec, setAiRec] = useState<{
    best_vendor: string;
    reason: string;
  } | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/quotes/")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch quotes");
        return res.json();
      })
      .then((data) => {
        setQuotes(data);
        if (data.length > 0) setSelectedRfq(data[0].rfq_reference || "");
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const currentQuotes = quotes.filter(
      (q) => q.rfq_reference === selectedRfq
    );

    if (currentQuotes.length > 0) {
      fetch("http://localhost:8000/api/ai/quote-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quotes: currentQuotes }),
      })
        .then((res) => res.json())
        .then((data) => setAiRec(data))
        .catch(() => setAiRec(null));
    } else {
      setAiRec(null);
    }
  }, [selectedRfq, quotes]);

  const rfqGroups = Array.from(
    new Set(quotes.map((q) => q.rfq_reference).filter(Boolean))
  );

  const currentQuotes = quotes.filter(
    (q) => q.rfq_reference === selectedRfq
  );

  const bestPriceId = currentQuotes.length
    ? currentQuotes.reduce((a, b) => (a.price < b.price ? a : b)).id
    : null;

  const bestDeliveryId = currentQuotes.length
    ? currentQuotes
        .filter((q) => q.delivery_days !== null)
        .reduce(
          (a, b) =>
            (a.delivery_days ?? 999) < (b.delivery_days ?? 999) ? a : b,
          currentQuotes[0]
        ).id
    : null;

  return (
    <AppShell activeHref="/quotes">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Quote Comparison
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Compare vendor quotations side-by-side for each RFQ
        </p>
      </div>

      {loading && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-xs text-slate-500 font-medium">
          Loading quotes...
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-semibold">
          Error: {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* RFQ Tabs */}
          <div className="flex flex-wrap gap-2">
            {rfqGroups.map((rfq) => (
              <button
                key={rfq}
                onClick={() => setSelectedRfq(rfq as string)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedRfq === rfq
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {rfq}
              </button>
            ))}
          </div>

          {/* AI Recommendation */}
          {aiRec && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-slate-900">
                AI Recommendation
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                <strong>{aiRec.best_vendor}</strong>
              </p>
              <p className="text-xs text-slate-600 mt-1">{aiRec.reason}</p>
            </div>
          )}

          {/* Comparison Table */}
          {currentQuotes.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left font-bold text-slate-500 uppercase text-[10px] tracking-wide px-4 py-3">
                      Vendor
                    </th>
                    <th className="text-left font-bold text-slate-500 uppercase text-[10px] tracking-wide px-4 py-3">
                      Product
                    </th>
                    <th className="text-left font-bold text-slate-500 uppercase text-[10px] tracking-wide px-4 py-3">
                      Price
                    </th>
                    <th className="text-left font-bold text-slate-500 uppercase text-[10px] tracking-wide px-4 py-3">
                      MOQ
                    </th>
                    <th className="text-left font-bold text-slate-500 uppercase text-[10px] tracking-wide px-4 py-3">
                      Delivery
                    </th>
                    <th className="text-left font-bold text-slate-500 uppercase text-[10px] tracking-wide px-4 py-3">
                      Payment Terms
                    </th>
                    <th className="text-left font-bold text-slate-500 uppercase text-[10px] tracking-wide px-4 py-3">
                      Warranty
                    </th>
                    <th className="text-left font-bold text-slate-500 uppercase text-[10px] tracking-wide px-4 py-3">
                      Certification
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentQuotes.map((q) => (
                    <tr
                      key={q.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                    >
                      <td className="px-4 py-3 font-bold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          {q.vendor_name}
                          {q.id === bestPriceId && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-black border border-emerald-200">
                              <Trophy className="h-2.5 w-2.5" /> Best Price
                            </span>
                          )}
                          {q.id === bestDeliveryId &&
                            q.id !== bestPriceId && (
                              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[9px] font-black border border-indigo-200">
                                <Trophy className="h-2.5 w-2.5" /> Fastest
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {q.product_name || "-"}
                      </td>
                      <td className="px-4 py-3 font-bold text-indigo-600">
                        ${q.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {q.moq ? q.moq.toLocaleString() : "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {q.delivery_days
                          ? `${q.delivery_days} days`
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {q.payment_terms || "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {q.warranty_months
                          ? `${q.warranty_months} months`
                          : "None"}
                      </td>
                      <td className="px-4 py-3">
                        {q.vendor_certification ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {q.vendor_certification}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">
                            None
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-xs text-slate-500 font-medium text-center">
              No quotes available for this RFQ.
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
