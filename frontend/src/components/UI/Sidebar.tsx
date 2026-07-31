import React from 'react';
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
  Settings
} from 'lucide-react';

interface SidebarProps {
  activeTab?: string;
  onSelectTab?: (tabId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab = 'dashboard' }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Buyer Dashboard', icon: LayoutDashboard },
    { id: 'ai-search', label: 'AI Supplier Search', icon: Search, tag: 'AI' },
    { id: 'vendors', label: 'Vendor Directory', icon: Store },
    { id: 'catalog', label: 'Product Catalog', icon: PackageCheck }, // Added Module 6
    { id: 'rfq-manager', label: 'RFQs & Quotes', icon: FileText },
    { id: 'orders', label: 'Order Management', icon: ShoppingBag }, // Added Module 12
    { id: 'messages', label: 'AI Assistant & Chat', icon: MessageSquare },
    { id: 'risk-analysis', label: 'Risk Analysis', icon: ShieldAlert, tag: 'AI' },
    { id: 'documents', label: 'Smart Documents', icon: FolderArchive },
    { id: 'reviews', label: 'Ratings & Reviews', icon: Star },
    { id: 'analytics', label: 'Platform Analytics', icon: BarChart3 },
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
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 shadow-sm' 
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.tag && (
                    <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {item.tag}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="border-t border-slate-800 pt-3">
        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-all">
          <Settings className="h-4 w-4 text-slate-500" />
          <span>System Settings</span>
        </button>
      </div>
    </aside>
  );
};