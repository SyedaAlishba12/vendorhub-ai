
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderTree,
  FileWarning,
  CreditCard,
  ShieldAlert,
} from 'lucide-react';

export const adminMenu = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Manage Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    label: 'Verify Vendors',
    href: '/admin/vendors',
    icon: Building2,
  },
  {
    label: 'Categories',
    href: '/admin/categories',
    icon: FolderTree,
  },
  {
    label: 'Reports',
    href: '/admin/reports',
    icon: FileWarning,
  },
  {
    label: 'Subscription Plans',
    href: '/admin/plans',
    icon: CreditCard,
  },
  {
    label: 'Fraud Monitoring',
    href: '/admin/fraud',
    icon: ShieldAlert,
  },
];

