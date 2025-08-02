'use client';

import cn from 'classnames';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { Icons } from '@/components/icons';
import type { SidebarNavItem } from './types';

interface Props {
  items: SidebarNavItem[];
}

export function SideNav(props: Props) {
  const path = usePathname();
  const { organization } = useParams();
  const items = props.items.map((item) => ({
    ...item,
    href: `/${organization}${item.href}`,
  }));

  return (
    <nav className="grid items-start gap-2">
      {items.map(({ name, href, icon, disabled }) => {
        const Icon = Icons[icon || 'arrowRight'];
        return (
          <Link key={name} href={href}>
            <span
              className={cn(
                'hover:bg-accent hover:text-accent-foreground group flex items-center rounded-md px-3  py-2 text-sm',
                path === href ? 'font-bold' : 'font-normal',
                disabled && 'cursor-not-allowed opacity-80'
              )}
            >
              <Icon className="mr-2 h-4 w-4" />
              <span>{name}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
