'use client';

import { Star } from 'lucide-react';

interface Vendor {
  name: string;
  rating: number;
  location: string;
  verified: boolean;
}

export default function SavedVendors({ vendors = [] }: { vendors: Vendor[] }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="bg-amber-50 p-2 rounded-xl"><Star className="h-5 w-5 text-amber-600" /></div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">Saved Vendors</h2>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">{vendors.length} vendors in your list</p>
        </div>
      </div>
      <div className="space-y-2">
        {vendors.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No saved vendors yet.</p>
        ) : (
          vendors.map((vendor, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50/60 border border-slate-100 rounded-xl">
              <div>
                <h4 className="text-xs font-semibold text-slate-900">{vendor.name}</h4>
                <p className="text-[10px] text-slate-500">{vendor.location} {vendor.verified && '✓ Verified'}</p>
              </div>
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                <Star className="h-4 w-4 fill-amber-500" />
                {vendor.rating}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}