"use client";

interface AppShellProps {
  activeHref: string;
  children: React.ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

// NOTE: Header + Sidebar removed from here — the team's shared global layout
// (in app/layout.tsx or the dashboard shell) now provides those.
// This component is kept only so existing pages (VendorDirectory, ProductCatalog,
// QuoteComparisonTable, CategoryManagement, ModerationPanel, VendorDetail,
// ProductDetail) don't need to change their imports/usage — it just passes
// children through with consistent page padding/spacing.
export default function AppShell({ children }: AppShellProps) {
  return <div className="p-6 space-y-6 bg-slate-50 min-h-screen">{children}</div>;
}
