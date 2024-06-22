import { Icons } from '~/components/icons';

export interface NavItem {
  name: string;
  href: string;
  disabled?: boolean;
}

export interface SidebarNavItem extends NavItem {
  icon?: keyof typeof Icons;
}

export interface DashboardConfig {
  mainNav: NavItem[];
  settingsNav: SidebarNavItem[];
}
