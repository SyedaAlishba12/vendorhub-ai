"use client";

import {
  Sparkles,
  Search,
  ShieldCheck,
  ArrowRight,
  FileText,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  Globe2,
  Zap,
  BrainCircuit,
  Building2,
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ========================================================= */}
      {/* NAVBAR */}
      {/* ========================================================= */}

      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-base font-black tracking-tight">
                VendorHub <span className="text-indigo-600">AI</span>
              </h1>

              <p className="text-[9px] text-slate-400 font-medium">
                Smarter Procurement
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-7">
            <a
              href="#features"
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              How It Works
            </a>

            <a
              href="#why-vendorhub"
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              Why VendorHub
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* HERO */}
      {/* ========================================================= */}

      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white">
        {/* Decorative background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-200/30 blur-3xl rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold mb-7">
              <Sparkles className="h-4 w-4" />
              AI-Powered Procurement Platform
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.05]">
              Find the Right Supplier.
              <br />
              <span className="text-indigo-600">
                Faster. Smarter.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-7 text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              VendorHub AI helps businesses discover suppliers, compare
              quotes, create RFQs, manage orders, and make smarter
              procurement decisions — all in one place.
            </p>

            {/* CTA Buttons */}
            <div className="mt-9 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5"
              >
                Start Sourcing with AI
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-slate-300 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 font-bold text-sm transition-colors"
              >
                Log In
              </Link>
            </div>

            {/* Trust text */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500" />
                AI-powered matching
              </span>

              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500" />
                Supplier discovery
              </span>

              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500" />
                Smart procurement
              </span>
            </div>
          </div>

          {/* ===================================================== */}
          {/* AI SEARCH PREVIEW */}
          {/* ===================================================== */}

          <div className="max-w-4xl mx-auto mt-16">
            <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl shadow-indigo-100/60 p-3">
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
                {/* Browser-style header */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />

                  <div className="ml-3 text-[10px] text-slate-400 font-medium">
                    VendorHub AI · Supplier Search
                  </div>
                </div>

                {/* Search box */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                  <div className="bg-indigo-100 text-indigo-600 p-2 rounded-xl">
                    <BrainCircuit className="h-5 w-5" />
                  </div>

                  <div className="flex-1 text-left">
                    <p className="text-[10px] text-slate-400 font-semibold mb-1">
                      ASK AI
                    </p>

                    <p className="text-sm text-slate-700 font-medium">
                      Find ISO-certified steel manufacturers in Turkey...
                    </p>
                  </div>

                  <button className="bg-indigo-600 text-white p-2.5 rounded-xl">
                    <Search className="h-4 w-4" />
                  </button>
                </div>

                {/* Search result preview */}
                <div className="grid md:grid-cols-3 gap-3 mt-4">
                  <SupplierPreview
                    name="Anatolia Steel"
                    location="Turkey"
                    score="96%"
                  />

                  <SupplierPreview
                    name="Istanbul Metals"
                    location="Turkey"
                    score="93%"
                  />

                  <SupplierPreview
                    name="TurkSteel Industries"
                    location="Turkey"
                    score="91%"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* STATS */}
      {/* ========================================================= */}

      <section className="border-y border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          <Stat
            value="AI"
            label="Powered sourcing"
          />

          <Stat
            value="24/7"
            label="Supplier discovery"
          />

          <Stat
            value="1"
            label="Unified platform"
          />

          <Stat
            value="∞"
            label="Business possibilities"
          />
        </div>
      </section>

      {/* ========================================================= */}
      {/* FEATURES */}
      {/* ========================================================= */}

      <section
        id="features"
        className="max-w-7xl mx-auto px-6 py-24"
      >
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Powerful Features
          </p>

          <h2 className="mt-3 text-3xl md:text-4xl font-black text-slate-900">
            Everything you need for smarter procurement
          </h2>

          <p className="mt-4 text-sm md:text-base text-slate-500">
            From finding suppliers to managing orders, VendorHub AI
            brings your entire procurement workflow together.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
          <FeatureCard
            icon={<Search className="h-6 w-6" />}
            title="AI Supplier Search"
            desc="Describe what you need in natural language and discover suppliers that match your requirements."
          />

          <FeatureCard
            icon={<ShieldCheck className="h-6 w-6" />}
            title="Vendor Discovery"
            desc="Explore supplier profiles, products, certifications, and other important business information."
          />

          <FeatureCard
            icon={<FileText className="h-6 w-6" />}
            title="Smart RFQs"
            desc="Create professional request-for-quote documents quickly with AI-assisted procurement workflows."
          />

          <FeatureCard
            icon={<BarChart3 className="h-6 w-6" />}
            title="Quote Comparison"
            desc="Compare supplier quotes and evaluate pricing and other factors before making a decision."
          />

          <FeatureCard
            icon={<MessageSquare className="h-6 w-6" />}
            title="AI Assistant"
            desc="Get intelligent assistance throughout your sourcing, negotiation, and procurement process."
          />

          <FeatureCard
            icon={<Zap className="h-6 w-6" />}
            title="Faster Decisions"
            desc="Bring supplier information, RFQs, quotes, orders, and analytics into one streamlined platform."
          />
        </div>
      </section>

      {/* ========================================================= */}
      {/* WHY VENDORHUB */}
      {/* ========================================================= */}

      <section
        id="why-vendorhub"
        className="bg-slate-50 border-y border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Why VendorHub AI
              </p>

              <h2 className="mt-3 text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                Procurement doesn't have to be complicated.
              </h2>

              <p className="mt-5 text-sm md:text-base text-slate-500 leading-relaxed">
                Traditional supplier sourcing can involve endless
                searches, spreadsheets, emails, and manual comparisons.
                VendorHub AI brings those workflows together into a
                single intelligent platform.
              </p>

              <div className="mt-8 space-y-4">
                <Benefit
                  title="Discover suppliers faster"
                  desc="Search and explore potential suppliers from one centralized platform."
                />

                <Benefit
                  title="Make informed decisions"
                  desc="Compare suppliers and quotes using organized procurement data."
                />

                <Benefit
                  title="Keep everything organized"
                  desc="Manage RFQs, orders, documents, messages, and reviews in one place."
                />
              </div>
            </div>

            {/* Right visual */}
            <div className="relative">
              <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-6">
                <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">
                      PROCUREMENT OVERVIEW
                    </p>

                    <h3 className="text-lg font-black text-slate-900 mt-1">
                      Your sourcing workspace
                    </h3>
                  </div>

                  <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  <DashboardMiniCard
                    icon={<Building2 className="h-4 w-4" />}
                    label="Suppliers"
                    value="120+"
                  />

                  <DashboardMiniCard
                    icon={<FileText className="h-4 w-4" />}
                    label="Active RFQs"
                    value="24"
                  />

                  <DashboardMiniCard
                    icon={<MessageSquare className="h-4 w-4" />}
                    label="Messages"
                    value="18"
                  />

                  <DashboardMiniCard
                    icon={<Globe2 className="h-4 w-4" />}
                    label="Markets"
                    value="Global"
                  />
                </div>

                <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-600" />

                    <p className="text-xs font-bold text-indigo-700">
                      AI Recommendation
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    3 suppliers match your current sourcing requirements.
                    Review their profiles and compare quotes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* HOW IT WORKS */}
      {/* ========================================================= */}

      <section
        id="how-it-works"
        className="max-w-7xl mx-auto px-6 py-24"
      >
        <div className="text-center">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Simple Workflow
          </p>

          <h2 className="mt-3 text-3xl md:text-4xl font-black text-slate-900">
            How VendorHub AI works
          </h2>

          <p className="mt-4 text-sm text-slate-500">
            Get from sourcing idea to supplier decision in a few simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-14">
          <Step
            number="01"
            icon={<Search className="h-6 w-6" />}
            title="Describe your requirements"
            desc="Tell VendorHub AI what products, services, certifications, or suppliers you are looking for."
          />

          <Step
            number="02"
            icon={<BrainCircuit className="h-6 w-6" />}
            title="Discover & compare"
            desc="Explore matching suppliers, products, profiles, and quotes from your procurement workspace."
          />

          <Step
            number="03"
            icon={<CheckCircle2 className="h-6 w-6" />}
            title="Make your decision"
            desc="Compare options, communicate with vendors, manage orders, and move forward with confidence."
          />
        </div>
      </section>

      {/* ========================================================= */}
      {/* CTA */}
      {/* ========================================================= */}

      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto rounded-3xl bg-indigo-600 px-8 py-16 text-center relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-2xl" />

          <div className="relative">
            <Sparkles className="h-8 w-8 text-indigo-200 mx-auto mb-5" />

            <h2 className="text-3xl md:text-4xl font-black text-white">
              Ready to make procurement smarter?
            </h2>

            <p className="mt-4 text-sm md:text-base text-indigo-100 max-w-xl mx-auto">
              Create your VendorHub AI account and start building a
              faster, more organized sourcing workflow.
            </p>

            <Link
              href="/signup"
              className="inline-flex items-center gap-2 mt-8 px-6 py-3.5 rounded-xl bg-white text-indigo-600 hover:bg-indigo-50 font-bold text-sm transition-colors shadow-lg"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FOOTER */}
      {/* ========================================================= */}

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
              <Sparkles className="h-4 w-4" />
            </div>

            <span className="text-sm font-black">
              VendorHub <span className="text-indigo-600">AI</span>
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            AI-powered procurement for modern businesses.
          </p>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ============================================================= */
/* COMPONENTS */
/* ============================================================= */

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-200">
      <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 inline-flex mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
        {icon}
      </div>

      <h3 className="text-base font-bold text-slate-900">
        {title}
      </h3>

      <p className="text-sm text-slate-500 mt-2 leading-relaxed">
        {desc}
      </p>

      <div className="mt-5 flex items-center gap-1 text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
        Learn more
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}

function SupplierPreview({
  name,
  location,
  score,
}: {
  name: string;
  location: string;
  score: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3">
      <div className="flex items-center gap-2.5">
        <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg">
          <Building2 className="h-4 w-4" />
        </div>

        <div className="text-left">
          <p className="text-xs font-bold text-slate-800">
            {name}
          </p>

          <p className="text-[10px] text-slate-400">
            {location}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[9px] text-slate-400">
          AI Match
        </span>

        <span className="text-[10px] font-bold text-indigo-600">
          {score}
        </span>
      </div>
    </div>
  );
}

function Stat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="text-center">
      <p className="text-2xl font-black text-indigo-600">
        {value}
      </p>

      <p className="text-xs text-slate-400 font-medium mt-1">
        {label}
      </p>
    </div>
  );
}

function Benefit({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 bg-indigo-100 text-indigo-600 p-1.5 rounded-lg shrink-0">
        <CheckCircle2 className="h-4 w-4" />
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-900">
          {title}
        </h3>

        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}

function DashboardMiniCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-slate-200 rounded-xl p-3">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}

        <span className="text-[10px] font-semibold">
          {label}
        </span>
      </div>

      <p className="text-lg font-black text-slate-900 mt-2">
        {value}
      </p>
    </div>
  );
}

function Step({
  number,
  icon,
  title,
  desc,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="relative text-center">
      <div className="inline-flex items-center justify-center bg-indigo-600 text-white h-12 w-12 rounded-2xl shadow-lg shadow-indigo-100">
        {icon}
      </div>

      <p className="text-[10px] font-black text-indigo-600 mt-5">
        STEP {number}
      </p>

      <h3 className="text-base font-bold text-slate-900 mt-2">
        {title}
      </h3>

      <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-sm mx-auto">
        {desc}
      </p>
    </div>
  );
}