'use client';

import { Sparkles, Search, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-6">
          <Sparkles className="h-4 w-4" /> AI-Powered Sourcing
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tight">
          Find the Right Supplier.<br />
          <span className="text-indigo-600">Faster. Smarter.</span>
        </h1>
        <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
          VendorHub AI helps businesses discover, compare, and negotiate with verified suppliers worldwide – all from one dashboard.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/login" className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg">
            Login
          </Link>
          <Link href="/signup" className="px-6 py-3 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-700 font-bold text-sm">
            Get Started
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard
          icon={<Search className="h-6 w-6" />}
          title="AI Supplier Search"
          desc="Describe what you need and our AI finds the best matches."
        />
        <FeatureCard
          icon={<ShieldCheck className="h-6 w-6" />}
          title="Verified Vendors"
          desc="Every supplier is audited and certified for quality."
        />
        <FeatureCard
          icon={<ArrowRight className="h-6 w-6" />}
          title="Smart RFQs"
          desc="Generate professional RFQs in seconds with AI assistance."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left">
      <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 inline-block mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-2">{desc}</p>
    </div>
  );
}