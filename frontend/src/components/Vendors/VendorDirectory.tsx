"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Clock, Star, SlidersHorizontal, X, Zap, History, Sparkles, Loader2 } from "lucide-react";
import AppShell from "@/components/UI/AppShell";

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
  languages: string | null;
  rating: number;
  response_time_hours: number | null;
  is_verified: boolean;
  match_score: number | null;
}

const COUNTRIES = ["Pakistan", "Turkey", "China", "UAE", "Bangladesh", "Vietnam", "India", "Germany"];
const HISTORY_KEY = "vendorhub_search_history";
const MAX_HISTORY = 5;

function getMatchColor(score: number) {
  if (score >= 85) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (score >= 70) return "bg-indigo-50 text-indigo-700 border-indigo-200";
  if (score >= 50) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

export default function VendorDirectory() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<Vendor[] | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);


  const [country, setCountry] = useState("");
  const [certification, setCertification] = useState("");
  const [minRating, setMinRating] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    setSearchHistory(stored);
  }, []);

  const saveToHistory = (term: string) => {
    if (!term.trim()) return;
    const stored: string[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    const updated = [term, ...stored.filter((t) => t !== term)].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    setSearchHistory(updated);
  };

  const fetchVendors = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (country) params.append("country", country);
    if (certification) params.append("certification", certification);
    if (minRating) params.append("min_rating", minRating);

    fetch(`http://localhost:8000/vendors/?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch vendors");
        return res.json();
      })
      .then((data) => {
        const sorted = [...data].sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
        setVendors(sorted);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, certification, minRating]);

  const handleAISearch = async () => {
    if (!aiQuery.trim()) {
      setAiResults(null);
      return;
    }
    saveToHistory(aiQuery.trim());
    setAiLoading(true);
    setError("");
    try {
      const filtersPayload = {
        country: country || undefined,
        certification: certification || undefined,
        min_rating: minRating ? parseFloat(minRating) : undefined,
      };
      const res = await fetch("http://localhost:8000/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: aiQuery.trim(), filters: filtersPayload }),
      });
      const data = await res.json();
      setAiResults(data);
    } catch (err) {
      setError("AI search failed – showing normal results.");
      setAiResults(null);
    } finally {
      setAiLoading(false);
    }
  };
  const fetchSuggestions = async (query: string) => {
  if (!query.trim()) {
    setSuggestions([]);
    setShowSuggestions(false);
    return;
  }
  try {
    const res = await fetch("http://localhost:8000/api/ai/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    if (Array.isArray(data)) {
      setSuggestions(data.slice(0, 4));
      setShowSuggestions(true);
    }
  } catch {
    setSuggestions([]);
    setShowSuggestions(false);
  }
};

useEffect(() => {
  const timer = setTimeout(() => fetchSuggestions(aiQuery), 500);
  return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [aiQuery]);

  const clearFilters = () => {
    setCountry("");
    setCertification("");
    setMinRating("");
    setAiResults(null);
    setAiQuery("");
  };

  const hasActiveFilters = country || certification || minRating;

  const displayedVendors =
  aiResults !== null
    ? aiResults.filter((v) => v.match_score !== null && v.match_score > 0)
    : vendors;

  return (
    <AppShell activeHref="/vendors">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Verified Vendors</h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Search with AI or browse and filter suppliers
        </p>
      </div>

      {/* AI SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAISearch()}
            placeholder='Describe what you need (e.g. "ISO certified steel manufacturer in Turkey")'
            className="flex-1 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder:text-slate-400"
          />
          <button
            onClick={handleAISearch}
            disabled={aiLoading || !aiQuery.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {aiLoading ? "Searching..." : "AI Search"}
          </button>
          {showSuggestions && suggestions.length > 0 && (
  <div className="mt-2 flex flex-wrap gap-2">
    {suggestions.map((s) => (
      <button
        key={s}
        onClick={() => {
          setAiQuery(s);
          setShowSuggestions(false);
        }}
        className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100"
      >
        {s}
      </button>
    ))}
  </div>
)}
        </div>
        {searchHistory.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
              <History className="h-3 w-3" /> Recent:
            </span>
            {searchHistory.map((term) => (
              <button
                key={term}
                onClick={() => setAiQuery(term)}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-700">Filters</span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700"
            >
              <X className="h-3 w-3" />
              Clear filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Country</label>
            <select
              value={country}
              onChange={(e) => { setCountry(e.target.value); setAiResults(null); }}
              className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/30"    >
              <option value="">All Countries</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Certification</label>
            <input
              type="text"
              value={certification}
              onChange={(e) => { setCertification(e.target.value); setAiResults(null); }}
              placeholder="e.g. ISO 9001"
              className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Minimum Rating</label>
            <select
              value={minRating}
              onChange={(e) => { setMinRating(e.target.value); setAiResults(null); }}
              className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-xs text-slate-500 font-medium">
          Loading vendors...
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-semibold">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <p className="text-[11px] text-slate-400 font-semibold">
            {aiResults !== null
              ? `AI found ${displayedVendors.length} suppliers`
              : `Showing ${displayedVendors.length} suppliers`}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayedVendors.map((vendor) => (
              <Link
                key={vendor.id}
                href={`/vendors/${vendor.id}`}
                className="block bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 hover:shadow-md hover:border-indigo-200 transition-all relative"
              >
                {vendor.match_score !== null && (
                  <div className={`absolute -top-2.5 -right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border shadow-sm ${getMatchColor(vendor.match_score)}`}>
                    <Zap className="h-3 w-3" />
                    {vendor.match_score}% Match
                  </div>
                )}

                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900">{vendor.company_name}</h3>
                  {vendor.is_verified && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      Verified
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {vendor.business_description || "No description provided."}
                </p>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-semibold">
                  <MapPin className="h-3.5 w-3.5 text-indigo-600" />
                  {vendor.country}
                  {vendor.industry && <span className="text-slate-400 font-medium"> · {vendor.industry}</span>}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {vendor.certification && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {vendor.certification}
                    </span>
                  )}
                  {vendor.production_capacity && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {vendor.production_capacity}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-600">
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-amber-500" />
                    {vendor.rating.toFixed(1)}
                  </span>
                  {vendor.response_time_hours && (
                    <span className="flex items-center gap-1 text-slate-500 font-medium">
                      <Clock className="h-3.5 w-3.5" />
                      ~{vendor.response_time_hours}h response
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          {displayedVendors.length === 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-xs text-slate-500 font-medium text-center">
              No vendors match your search.
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}