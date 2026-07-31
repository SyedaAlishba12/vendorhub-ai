import React from 'react';
import { Sparkles, Bell, User, Search, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950 text-white px-4 md:px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-tr from-emerald-500 to-teal-600 p-2 rounded-xl text-slate-950 shadow-md shadow-emerald-950">
          <Sparkles className="h-5 w-5 font-bold" />
        </div>
        <div>
          <h1 className="font-black text-white text-base tracking-tight leading-none">
            VendorHub <span className="text-emerald-400">AI</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">
            Find the Right Supplier. Faster. Smarter.
          </p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-1.5 w-80 focus-within:ring-2 focus-within:ring-emerald-500/30 transition-all">
        <Search className="h-4 w-4 text-slate-500" />
        <input 
          type="text" 
          placeholder="Ask AI: e.g. ISO Steel Mfr in Turkey..." 
          className="bg-transparent text-xs text-slate-200 outline-none w-full placeholder:text-slate-500 font-medium"
        />
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-all">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-slate-950"></span>
        </button>

        <div className="h-6 w-[1px] bg-slate-800 hidden sm:block"></div>

        <div className="flex items-center gap-2.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <div className="bg-emerald-500 text-slate-950 p-1.5 rounded-lg font-bold text-xs flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <div className="text-left hidden sm:block pr-2">
            <div className="flex items-center gap-1">
              <p className="text-xs font-bold text-slate-100 leading-none">Zainab Bibi</p>
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <p className="text-[10px] text-emerald-400 font-semibold mt-0.5 leading-none">Buyer</p>
          </div>
        </div>
      </div>
    </header>
  );
};