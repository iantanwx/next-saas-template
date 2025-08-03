'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';

import { NavMain } from '@/components/nav/nav-main';
import { NavUser } from '@/components/nav/nav-user';
import { OrgIndicator } from '@/components/nav/org-indicator';
import { useNav } from '@/components/nav/nav-context';
import { sidebarConfig } from '@/config/dashboard';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@superscale/ui/components/sidebar';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  organization: {
    name: string;
    slug: string;
  };
}

export function AppSidebar({ user, organization, ...props }: AppSidebarProps) {
  const { organization: orgSlug } = useParams();
  const { openedMenus, setOpenedMenus } = useNav();

  console.log('openedMenus from context', openedMenus);

  // Add organization prefix to URLs - memoized to prevent recreating on every render
  const navItems = useMemo(
    () =>
      sidebarConfig.navMain.map((item) => ({
        ...item,
        url: `/${orgSlug}${item.url}`,
        items: item.items?.map((subItem) => ({
          ...subItem,
          url: `/${orgSlug}${subItem.url}`,
        })),
      })),
    [orgSlug]
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrgIndicator organization={organization} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={navItems}
          openedMenus={openedMenus}
          setOpenedMenus={setOpenedMenus}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
