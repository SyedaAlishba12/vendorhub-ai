import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Search, 
  Bell, 
  User, 
  ShieldCheck, 
  LayoutDashboard, 
  Store, 
  PackageCheck, 
  FileText, 
  ShoppingBag, 
  MessageSquare, 
  ShieldAlert, 
  FolderArchive, 
  Star, 
  BarChart3, 
  Settings, 
  SlidersHorizontal, 
  ArrowRight 
} from 'lucide-react';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased">
      
      {/* 1. TOP NAVBAR */}
      <header className="h-16 border-b border-slate-200 bg-white text-slate-900 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md shadow-indigo-200">
            <Sparkles className="h-5 w-5 font-bold" />
          </div>
          <div>
            <h1 className="font-black text-slate-900 text-base tracking-tight leading-none">
              VendorHub <span className="text-indigo-600">AI</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide mt-0.5">
              Find the Right Supplier. Faster. Smarter.
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-1.5 w-80 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all">
          <Search className="h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Ask AI: e.g. ISO Steel Mfr in Turkey..." 
            className="bg-transparent text-xs text-slate-700 outline-none w-full placeholder:text-slate-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white"></span>
          </button>

          <div className="h-6 w-[1px] bg-slate-200 hidden sm:block"></div>

          <div className="flex items-center gap-2.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg font-bold text-xs flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <div className="text-left hidden sm:block pr-2">
              <div className="flex items-center gap-1">
                <p className="text-xs font-bold text-slate-900 leading-none">Zainab Bibi</p>
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
              </div>
              <p className="text-[10px] text-indigo-600 font-semibold mt-0.5 leading-none">Buyer</p>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN BODY AREA (Sidebar + Content) */}
      <div className="flex flex-1">
        
        {/* 2. LEFT SIDEBAR */}
        <aside className="w-64 bg-white border-r border-slate-200 h-[calc(100vh-4rem)] sticky top-16 flex flex-col justify-between p-4 shrink-0 hidden lg:flex text-slate-700 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Platform Modules
              </p>
              <nav className="space-y-1">
                {[
                  { label: 'Buyer Dashboard', icon: LayoutDashboard, active: true, href: '/' },
                  { label: 'AI Supplier Search', icon: Search, tag: 'AI', href: '#' },
                  { label: 'Vendor Directory', icon: Store, href: '/vendors' },
                  { label: 'Product Catalog', icon: PackageCheck, href: '/products' },
                  { label: 'RFQs & Quotes', icon: FileText, href: '#' },
                  { label: 'Order Management', icon: ShoppingBag, href: '#' },
                  { label: 'AI Assistant & Chat', icon: MessageSquare, href: '#' },
                  { label: 'Risk Analysis', icon: ShieldAlert, tag: 'AI', href: '#' },
                  { label: 'Smart Documents', icon: FolderArchive, href: '#' },
                  { label: 'Ratings & Reviews', icon: Star, href: '#' },
                  { label: 'Platform Analytics', icon: BarChart3, href: '#' },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        item.active 
                          ? 'bg-indigo-50 text-indigo-600 font-bold border border-indigo-100 shadow-sm' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`h-4 w-4 ${item.active ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.tag && (
                        <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-indigo-100 text-indigo-700">
                          {item.tag}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3">
            <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all">
              <Settings className="h-4 w-4 text-slate-400" />
              <span>System Settings</span>
            </button>
          </div>
        </aside>

        {/* 3. MIDDLE DASHBOARD CONTENT */}
        <main className="flex-1 p-6 space-y-6 bg-slate-50 overflow-x-hidden">
          
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-[#0B0F19] p-8 text-white shadow-xl border border-slate-800">
            <div className="relative z-10 space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" /> Next-Gen AI Procurement Workspace
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                Find Verified Global Suppliers in Seconds
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Type your specification in natural language. Our AI evaluates pricing, MOQ, certifications, and delivery speed across worldwide vendors.
              </p>
            </div>
          </div>

          {/* AI Search Bar */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
            <div className="pl-3 text-indigo-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Describe your sourcing requirement (e.g., '10k cotton t-shirts from ISO certified supplier in Pakistan')..."
              className="w-full text-xs text-slate-700 bg-transparent outline-none placeholder:text-slate-400 font-medium"
            />
            <button className="p-2.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all">
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all shrink-0">
              <Search className="h-4 w-4" />
              <span>AI Search</span>
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900">AI Match Efficiency</h4>
                <p className="text-[11px] text-slate-500 font-medium">Average sourcing time saved</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-indigo-600 tracking-tight">84%</span>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  ↑ Faster than manual
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Active RFQs</h4>
                <p className="text-[11px] text-slate-500 font-medium">In progress quote requests</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 tracking-tight">12</span>
                <span className="text-[11px] font-semibold text-slate-500">Across 4 countries</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Verified Vendors</h4>
                <p className="text-[11px] text-slate-500 font-medium">ISO & Quality audited</p>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-7 w-7 text-emerald-600" />
                <span className="text-3xl font-black text-slate-900 tracking-tight">1,420+</span>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent AI Sourcing Workflows</h3>
                <p className="text-[11px] text-slate-500 font-medium">Live tracking of requested quotations and vendor responses</p>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all">
                <span>View All RFQs</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-3">RFQ Ref</th>
                    <th className="py-3 px-3">Requirement</th>
                    <th className="py-3 px-3">Target Region</th>
                    <th className="py-3 px-3">AI Score</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-slate-900">RFQ-9021</td>
                    <td className="py-3.5 px-3 font-semibold">10,000 Cotton T-Shirts</td>
                    <td className="py-3.5 px-3">Pakistan</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        95% Match
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-indigo-600">AI Matching</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-slate-900">RFQ-8812</td>
                    <td className="py-3.5 px-3 font-semibold">Stainless Steel Pipes (ISO)</td>
                    <td className="py-3.5 px-3">Turkey</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        92% Match
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-indigo-600">Quotes Received</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-slate-900">RFQ-8740</td>
                    <td className="py-3.5 px-3 font-semibold">Solar Inverters 500kW</td>
                    <td className="py-3.5 px-3">China</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        89% Match
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-indigo-600">Negotiating</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>

      {/* 4. FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-xs text-slate-500 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span className="font-bold text-slate-800">VendorHub AI</span>
            <span>© 2026 — AI Smart B2B Sourcing System</span>
          </div>
          <div className="flex items-center gap-6 font-medium text-slate-500">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">AI Sourcing Guide</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Support Helpdesk</a>
          </div>
        </div>
      </footer>

    </div>
  );
}