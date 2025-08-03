import {
  Home,
  Mail,
  Search,
  Settings,
  Users,
  Puzzle,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

export interface SidebarConfig {
  navMain: NavItem[];
}

export const sidebarConfig: SidebarConfig = {
  navMain: [
    {
      title: 'Dashboard',
      url: '',
      icon: Home,
      isActive: true,
    },
    {
      title: 'Contacts',
      url: '/contacts',
      icon: Users,
    },
    {
      title: 'Email',
      url: '/email',
      icon: Mail,
    },
    {
      title: 'SEO',
      url: '/seo',
      icon: Search,
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings,
      items: [
        {
          title: 'General',
          url: '/settings',
        },
        {
          title: 'Members',
          url: '/settings/members',
        },
        {
          title: 'Integrations',
          url: '/settings/integrations',
        },
      ],
    },
  ],
};
