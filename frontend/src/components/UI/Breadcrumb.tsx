import React from 'react';
import { ChevronRight } from 'lucide-react';

export const Breadcrumb: React.FC<{ items: string[] }> = ({ items }) => (
  <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
    {items.map((item, index) => (
      <React.Fragment key={index}>
        {index > 0 && <ChevronRight className="h-3 w-3 text-slate-400" />}
        <span className={index === items.length - 1 ? 'font-bold text-slate-900' : 'hover:text-slate-700 cursor-pointer'}>
          {item}
        </span>
      </React.Fragment>
    ))}
  </nav>
);