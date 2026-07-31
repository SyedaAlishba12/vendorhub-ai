import React from 'react';

// Select Component for Filters
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { label: string; value: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => (
  <div className="w-full space-y-1.5 text-left">
    {label && <label className="block text-xs font-bold text-slate-700 tracking-wide uppercase">{label}</label>}
    <select
      className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all ${className}`}
      {...props}
    >
      {options.map((opt, i) => (
        <option key={i} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// Form Container Wrapper
export const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/80 space-y-3">
    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{title}</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  </div>
);