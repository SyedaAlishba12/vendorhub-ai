'use client';

import React from 'react';
import { Plus, Search, ShoppingBag, Users } from 'lucide-react';
import Link from 'next/link';

export default function QuickActions() {
  const actions = [
    { label: 'New RFQ', href: '/rfq/create', icon: Plus, color: 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100' },
    { label: 'AI Search', href: '/search', icon: Search, color: 'text-indigo-600 bg-indigo-50 border-indigo-200 hover:bg-indigo-100' },
    { label: 'Orders', href: '/orders', icon: ShoppingBag, color: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100' },
    { label: 'Vendors', href: '/vendors', icon: Users, color: 'text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100' },
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.label}
            href={action.href}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border ${action.color} transition-all text-xs font-bold`}
          >
            <Icon className="h-3.5 w-3.5" />
            {action.label}
          </Link>
        );
      })}
    </div>
  );
}