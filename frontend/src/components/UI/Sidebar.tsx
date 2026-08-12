import React from 'react';
import Link from 'next/link';

import {
  LayoutDashboard,
  Search,
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
  CreditCard,
} from 'lucide-react';

interface SidebarProps {
  activeTab?: string;
  onSelectTab?: (tabId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab = '/',
  onSelectTab,
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Buyer Dashboard',
      icon: LayoutDashboard,
      href: '/',
    },
    {
      id: 'ai-search',
      label: 'AI Supplier Search',
      icon: Search,
      tag: 'AI',
      href: '/search',
    },
    {
      id: 'vendors',
      label: 'Vendor Directory',
      icon: Store,
      href: '/vendors',
    },
    {
      id: 'catalog',
      label: 'Product Catalog',
      icon: PackageCheck,
      href: '/catalog',
    },
    {
      id: 'rfqs',
      label: 'RFQs',
      icon: FileText,
      href: '/rfq',
    },
    {
      id: 'quotes',
      label: 'Quote Comparison',
      icon: FileText,
      href: '/quotes',
    },
    {
      id: 'orders',
      label: 'Order Management',
      icon: ShoppingBag,
      href: '/orders',
    },
    {
      id: 'messages',
      label: 'AI Assistant & Chat',
      icon: MessageSquare,
      href: '/messages',
    },
    {
      id: 'risk-analysis',
      label: 'Risk Analysis',
      icon: ShieldAlert,
      tag: 'AI',
      href: '/risk-analysis',
    },
    {
      id: 'documents',
      label: 'Smart Documents',
      icon: FolderArchive,
      href: '/documents',
    },
    {
      id: 'reviews',
      label: 'Ratings & Reviews',
      icon: Star,
      href: '/reviews',
    },
    {
      id: 'analytics',
      label: 'Platform Analytics',
      icon: BarChart3,
      href: '/analytics',
    },
    {
      id: 'pricing',
      label: 'Pricing & Plans',
      icon: CreditCard,
      href: '/pricing',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 shrink-0 hidden lg:flex text-slate-300">

      <div className="space-y-6">

        <div>
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Platform Modules
          </p>

          <nav className="space-y-1">

            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                activeTab === item.href;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() =>
                    onSelectTab &&
                    onSelectTab(item.href)
                  }
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                  }`}
                >

                  <div className="flex items-center gap-2.5">

                    <Icon
                      className={`h-4 w-4 ${
                        isActive
                          ? 'text-emerald-400'
                          : 'text-slate-500'
                      }`}
                    />

                    <span>
                      {item.label}
                    </span>

                  </div>

                  {item.tag && (
                    <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {item.tag}
                    </span>
                  )}

                </Link>
              );
            })}

          </nav>
        </div>

      </div>

      {/* Settings */}

      <div className="border-t border-slate-800 pt-3">

        <Link
          href="/settings"
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-all"
        >

          <Settings className="h-4 w-4 text-slate-500" />

          <span>
            System Settings
          </span>

        </Link>

      </div>

    </aside>
  );
};