import type { ComponentType, SVGProps } from 'react';
import {
  HomeIcon,
  PackageIcon,
  StackIcon,
  TagIcon,
  TruckIcon,
  UsersIcon,
} from '../../components/icons';

/** Order of the groups in the sidebar. Each part of Step 12c adds its items to `adminNav` below. */
export const NAV_SECTIONS = ['Home', 'Sales', 'Buying', 'Stock', 'Money', 'Reports'] as const;
export type NavSection = (typeof NAV_SECTIONS)[number];

export interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  section: NavSection;
  /** Match only this exact path (used by Home so it is not "active" on every page). */
  end?: boolean;
  /** Shown in the phone's bottom bar. At most 4 items; the rest go under "More". */
  mobile?: boolean;
}

export const adminNav: readonly NavItem[] = [
  { to: '/admin', label: 'Home', icon: HomeIcon, section: 'Home', end: true, mobile: true },
  { to: '/admin/customers', label: 'Customers', icon: UsersIcon, section: 'Sales' },
  { to: '/admin/suppliers', label: 'Suppliers', icon: TruckIcon, section: 'Buying' },
  { to: '/admin/products', label: 'Products', icon: PackageIcon, section: 'Stock', mobile: true },
  { to: '/admin/inventory', label: 'Inventory', icon: StackIcon, section: 'Stock', mobile: true },
  { to: '/admin/categories', label: 'Categories', icon: TagIcon, section: 'Stock' },
];
