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
  Tags,
  ShieldQuestion,
} from "lucide-react";

export const menuItems = [
  { label: "Buyer Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "AI Supplier Search", icon: Search, tag: "AI", href: "#" },
  { label: "Vendor Directory", icon: Store, href: "/vendors" },
  { label: "Product Catalog", icon: PackageCheck, href: "/products" },
  { label: "RFQs & Quotes", icon: FileText, href: "/quotes" },
  { label: "Order Management", icon: ShoppingBag, href: "#" },
  { label: "AI Assistant & Chat", icon: MessageSquare, href: "#" },
  { label: "Risk Analysis", icon: ShieldAlert, tag: "AI", href: "#" },
  { label: "Smart Documents", icon: FolderArchive, href: "#" },
  { label: "Ratings & Reviews", icon: Star, href: "#" },
  { label: "Platform Analytics", icon: BarChart3, href: "#" },
];

export const adminMenuItems = [
  { label: "Category Management", icon: Tags, href: "/admin/categories" },
  { label: "Vendor/Product Moderation", icon: ShieldQuestion, href: "/admin/moderation" },
];
