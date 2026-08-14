import {
  LayoutDashboard,
  PackageCheck,
  ShoppingBag,
  FileText,
  MessageSquare,
  Star,
  BarChart3,
  Settings,
} from "lucide-react";

export const vendorMenu = [
  {
    label: "Vendor Dashboard",
    icon: LayoutDashboard,
    href: "/vendor",
  },
  {
    label: "My Products",
    icon: PackageCheck,
    href: "/vendor/products",
  },
  {
    label: "RFQ Requests",
    icon: FileText,
    href: "/vendor/rfqs",
  },
  {
    label: "Orders",
    icon: ShoppingBag,
    href: "/vendor/orders",
  },
  {
    label: "Messages",
    icon: MessageSquare,
    href: "/vendor/messages",
  },
  {
    label: "Reviews",
    icon: Star,
    href: "/vendor/reviews",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/vendor/analytics",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];