"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Mail,
  Languages,
  Factory,
  Globe2,
  ArrowLeft,
  PackageCheck,
  Zap,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import AppShell from "@/components/UI/AppShell";

interface MatchBreakdown {
  total: number;
  quality_score: number;
  verification_score: number;
  certification_score: number;
  delivery_speed_score: number;
}

interface Vendor {
  id: number;
  company_name: string;
  business_description: string | null;
  country: string;
  industry: string | null;
  certification: string | null;
  production_capacity: string | null;
  export_countries: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  languages: string | null;
  rating: number;
  response_time_hours: number | null;
  is_verified: boolean;
  match_score: number | null;
  match_breakdown: MatchBreakdown | null;
}

const SAVED_KEY = "vendorhub_saved_vendors";

export default function VendorDetail() {
  const params = useParams();
  const vendorId = params?.id;

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!vendorId) return;
    fetch(`http://localhost:8000/vendors/${vendorId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Vendor not found");
        return res.json();
      })
      .then((data) => {
        setVendor(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    const savedList: number[] = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
    setSaved(savedList.includes(Number(vendorId)));
  }, [vendorId]);

  const toggleSave = () => {
    const savedList: number[] = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
    const id = Number(vendorId);
    const updated = savedList.includes(id) ? savedList.filter((v) => v !== id) : [...savedList, id];
    localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
    setSaved(!saved);
  };

  return (
    <AppShell activeHref="/vendors">
      <div className="flex items-center justify-between">
        <Link
          href="/vendors"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Vendor Directory
        </Link>

        {vendor && (
          <button
            onClick={toggleSave}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              saved
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {saved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
            {saved ? "Saved" : "Save Vendor"}
          </button>
        )}
      </div>

      {loading && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-xs text-slate-500 font-medium">
          Loading vendor profile...
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-semibold">
          {error}
        </div>
      )}

      {!loading && !error && vendor && (
        <div className="space-y-6">
          {/* Profile header card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {vendor.company_name}
                  </h2>
                  {vendor.is_verified && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-2 max-w-xl leading-relaxed">
                  {vendor.business_description || "No description provided."}
                </p>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center">
                    <Star className="h-4 w-4 text-amber-500" />
                    <span className="text-lg font-black text-slate-900">
                      {vendor.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Rating</p>
                </div>
                {vendor.response_time_hours && (
                  <>
                    <div className="h-8 w-[1px] bg-slate-200"></div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <Clock className="h-4 w-4 text-indigo-600" />
                        <span className="text-lg font-black text-slate-900">
                          {vendor.response_time_hours}h
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Response</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* AI Match Score breakdown */}
          {vendor.match_breakdown && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-indigo-600" />
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    AI Match Score Breakdown
                  </h3>
                </div>
                <span className="text-lg font-black text-indigo-600">{vendor.match_breakdown.total}%</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Quality (Reviews)", value: vendor.match_breakdown.quality_score, max: 40 },
                  { label: "Verification", value: vendor.match_breakdown.verification_score, max: 20 },
                  { label: "Certification", value: vendor.match_breakdown.certification_score, max: 20 },
                  { label: "Delivery Speed", value: vendor.match_breakdown.delivery_speed_score, max: 20 },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1.5">{item.label}</p>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1.5">
                      <div
                        className="bg-indigo-600 h-1.5 rounded-full"
                        style={{ width: `${(item.value / item.max) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      {item.value}/{item.max}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Score is a weighted formula based on rating, verification status, certification, and average
                response time — not yet AI-generated (planned for a future iteration).
              </p>
            </div>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Company Details
              </h3>

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Country</p>
                  <p className="text-sm font-semibold text-slate-800">{vendor.country}</p>
                </div>
              </div>

              {vendor.industry && (
                <div className="flex items-start gap-3">
                  <Factory className="h-4 w-4 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Industry</p>
                    <p className="text-sm font-semibold text-slate-800">{vendor.industry}</p>
                  </div>
                </div>
              )}

              {vendor.production_capacity && (
                <div className="flex items-start gap-3">
                  <PackageCheck className="h-4 w-4 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">
                      Production Capacity
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                      {vendor.production_capacity}
                    </p>
                  </div>
                </div>
              )}

              {vendor.export_countries && (
                <div className="flex items-start gap-3">
                  <Globe2 className="h-4 w-4 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">
                      Export Countries
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                      {vendor.export_countries}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Contact & Certification
              </h3>

              {vendor.certification && (
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-4 w-4 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">
                      Certification
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                      {vendor.certification}
                    </p>
                  </div>
                </div>
              )}

              {vendor.contact_email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Email</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {vendor.contact_email}
                    </p>
                  </div>
                </div>
              )}

              {vendor.languages && (
                <div className="flex items-start gap-3">
                  <Languages className="h-4 w-4 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">
                      Languages
                    </p>
                    <p className="text-sm font-semibold text-slate-800">{vendor.languages}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
