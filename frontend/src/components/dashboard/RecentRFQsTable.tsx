
'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import Link from 'next/link';

interface RFQItem {
  id: number;
  rfq_ref: string;
  product_name: string;
  quantity: number;
  unit: string;
  status: string;
  ai_score?: number;
  target_region?: string;
}

interface RecentRFQsTableProps {
  rfqs: RFQItem[];
}

export default function RecentRFQsTable({
  rfqs,
}: RecentRFQsTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-slate-100 text-slate-600';

      case 'sent':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200';

      case 'quoted':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';

      case 'closed':
        return 'bg-slate-100 text-slate-500';

      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">

        <div>
          <h2 className="text-sm font-black text-slate-900">
            Recent AI Sourcing Workflows
          </h2>

          <p className="text-xs text-slate-500 font-medium mt-1">
            Live tracking of requested quotations and vendor responses
          </p>
        </div>

        <Link
          href="/rfqs"
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
        >
          View All RFQs
        </Link>

      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">

          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <th className="py-3 px-3">
                RFQ Ref
              </th>

              <th className="py-3 px-3">
                Requirement
              </th>

              <th className="py-3 px-3">
                Target Region
              </th>

              <th className="py-3 px-3">
                AI Score
              </th>

              <th className="py-3 px-3">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">

            {rfqs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 px-3 text-center text-slate-400"
                >
                  No RFQs yet. Create one to get started!
                </td>
              </tr>
            ) : (
              rfqs.map((rfq) => (
                <tr
                  key={rfq.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >

                  {/* RFQ Reference */}
                  <td className="py-3.5 px-3 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
                      {rfq.rfq_ref}
                    </div>
                  </td>

                  {/* Requirement */}
                  <td className="py-3.5 px-3 font-semibold">
                    {rfq.quantity} {rfq.unit} {rfq.product_name}
                  </td>

                  {/* Target Region */}
                  <td className="py-3.5 px-3">
                    {rfq.target_region || '-'}
                  </td>

                  {/* AI Score */}
                  <td className="py-3.5 px-3">
                    {rfq.ai_score !== undefined && (
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {rfq.ai_score}% Match
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${getStatusColor(
                        rfq.status
                      )}`}
                    >
                      {rfq.status.charAt(0).toUpperCase() +
                        rfq.status.slice(1)}
                    </span>
                  </td>

                </tr>
              ))
            )}

          </tbody>
        </table>
      </div>
    </div>
  );
}

