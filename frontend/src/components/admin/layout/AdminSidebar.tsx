'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CreditCard,
  Users,
  FileBarChart,
  ShieldCheck,
  Star,
  Settings,
} from 'lucide-react';

const adminMenu = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Plans & Subscriptions', href: '/admin/plans', icon: CreditCard },
  { label: 'Subscribers', href: '/admin/subscribers', icon: Users },
  { label: 'Reports', href: '/admin/reports', icon: FileBarChart },
  { label: 'Verification', href: '/admin/verifications', icon: ShieldCheck },
  { label: 'Reviews Moderation', href: '/admin/reviews', icon: Star },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname() ?? '';

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col justify-between p-4 shrink-0 text-slate-700">
      <div className="space-y-6">
        <div>
          <h2 className="px-3 text-lg font-black text-slate-900">Admin</h2>
          <p className="px-3 text-[10px] text-slate-400 font-medium mb-2">Control Panel</p>
        </div>
        <nav className="space-y-1">
          {adminMenu.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 font-bold border border-indigo-100 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-200 pt-3">
        <Link
          href="/"
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          ← Back to Store
        </Link>
      </div>
    </aside>
  );
}