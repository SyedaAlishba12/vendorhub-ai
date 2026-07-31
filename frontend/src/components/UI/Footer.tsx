import React from 'react';
import { Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-6 px-6 text-xs text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span className="font-bold text-slate-200">VendorHub AI</span>
          <span>© {new Date().getFullYear()} — AI Smart B2B Sourcing System</span>
        </div>
        <div className="flex items-center gap-6 font-medium text-slate-400">
          <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-emerald-400 transition-colors">AI Sourcing Guide</a>
          <a href="#" className="hover:text-emerald-400 transition-colors">Support Helpdesk</a>
        </div>
      </div>
    </footer>
  );
};