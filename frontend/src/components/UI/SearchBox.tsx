import React from 'react';
import { Search, Sparkles, SlidersHorizontal } from 'lucide-react';

interface SearchBoxProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  placeholder = "Describe your sourcing requirement (e.g., '10k cotton t-shirts from ISO certified supplier in Pakistan')..."
}) => {
  return (
    <div className="w-full bg-white p-2 rounded-2xl border border-slate-200 shadow-md flex flex-col sm:flex-row items-center gap-2">
      <div className="flex-1 flex items-center gap-3 px-3 w-full">
        <Sparkles className="h-5 w-5 text-indigo-600 shrink-0" />
        <input
          type="text"
          placeholder={placeholder}
          className="w-full text-xs md:text-sm text-slate-800 outline-none placeholder:text-slate-400 font-medium py-2 bg-transparent"
        />
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
          <SlidersHorizontal className="h-4 w-4" />
        </button>
        <button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm">
          <Search className="h-3.5 w-3.5" />
          <span>AI Search</span>
        </button>
      </div>
    </div>
  );
};