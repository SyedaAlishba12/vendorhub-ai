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
  CreditCard,
} from "lucide-react";

export const buyerMenu = [
  {
    label: "Buyer Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    label: "AI Supplier Search",
    icon: Search,
    href: "/vendors",
    tag: "AI",
  },
  {
    label: "Vendor Directory",
    icon: Store,
    href: "/vendors",
  },
  {
    label: "Products",
    icon: PackageCheck,
    href: "/products",
  },
  {
    label: "RFQs",
    icon: FileText,
    href: "/rfq",
  },
  {
  label: "Quotes",
  icon: FileText,
  href: "/quotes",
},
  {
    label: "Orders",
    icon: ShoppingBag,
    href: "/orders",
  },
  {
    label: "Messages",
    icon: MessageSquare,
    href: "/messages",
  },
  {
    label: "Risk Analysis",
    icon: ShieldAlert,
    href: "/risk-analysis",
    tag: "AI",
  },
  {
    label: "Documents",
    icon: FolderArchive,
    href: "/documents",
  },
  {
    label: "Reviews",
    icon: Star,
    href: "/reviews",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/analytics",
  },
  {
    label: "Pricing",
    icon: CreditCard,
    href: "/pricing",
  },
];