'use client';

import AdminSidebar from '../../components/admin/layout/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 p-6 overflow-x-auto">{children}</div>
    </div>
  );
}