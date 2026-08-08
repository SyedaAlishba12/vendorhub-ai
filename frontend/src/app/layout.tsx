'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Sparkles, Search, Bell, User, ShieldCheck, LayoutDashboard, 
  Store, PackageCheck, FileText, ShoppingBag, MessageSquare, 
  ShieldAlert, FolderArchive, Star, BarChart3, Settings 
} from 'lucide-react';
import './globals.css';

const menuItems = [
  { label: 'Buyer Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'AI Supplier Search', icon: Search, tag: 'AI', href: '/ai-search' },
  { label: 'Vendor Directory', icon: Store, href: '/vendors' },
  { label: 'Product Catalog', icon: PackageCheck, href: '/catalog' },
  { label: 'RFQs & Quotes', icon: FileText, href: '/rfq-manager' },
  { label: 'Order Management', icon: ShoppingBag, href: '/orders' },
  { label: 'AI Assistant & Chat', icon: MessageSquare, href: '/messages' },
  { label: 'Risk Analysis', icon: ShieldAlert, tag: 'AI', href: '/risk-analysis' },
  { label: 'Smart Documents', icon: FolderArchive, href: '/documents' },
  { label: 'Ratings & Reviews', icon: Star, href: '/reviews' },
  { label: 'Platform Analytics', icon: BarChart3, href: '/analytics' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased">
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

          <div className="hidden md:flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-1.5 w-80">
            <Search className="h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Ask AI: e.g. ISO Steel Mfr in Turkey..." 
              className="bg-transparent text-xs text-slate-700 outline-none w-full placeholder:text-slate-400 font-medium"
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white"></span>
            </button>
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

        <div className="flex flex-1">
          <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 shrink-0 hidden lg:flex text-slate-700">
            <div className="space-y-6">
              <div>
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Platform Modules
                </p>
                <nav className="space-y-1">
                  {menuItems.map((item, idx) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={idx}
                        href={item.href}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive 
                            ? 'bg-indigo-50 text-indigo-600 font-bold border border-indigo-100 shadow-sm' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
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
              <Link 
                href="/settings"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <Settings className="h-4 w-4 text-slate-400" />
                <span>System Settings</span>
              </Link>
            </div>
          </aside>

          <main className="flex-1 p-6 bg-slate-50 overflow-x-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}