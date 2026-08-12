'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import RFQForm from '../../../components/rfq/RFQForm';

export default function CreateRFQPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/rfq" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-xs font-bold transition-all">
          <ArrowLeft className="h-4 w-4" /> Back to RFQs
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Create New RFQ</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Fill in the details below or use AI to generate instantly.</p>
        </div>
        <RFQForm />
      </div>
    </div>
  );
}