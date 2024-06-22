import { DashboardConfig } from '~/components/nav/types';

export const dashboardConfig: DashboardConfig = {
  mainNav: [
    { name: 'Contacts', href: '/contacts' },
    { name: 'Email', href: '/email' },
    { name: 'SEO', href: '/seo' },
    { name: 'Settings', href: '/settings' },
  ],
  settingsNav: [
    { name: 'General', href: '/settings', icon: 'home' },
    { name: 'Members', href: '/settings/members', icon: 'user' },
  ],
};
