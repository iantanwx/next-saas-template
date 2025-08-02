'use client';

import cn from 'classnames';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useSelectedLayoutSegment } from 'next/navigation';
import { useState } from 'react';
import { Icons } from '@/components/icons';
import { MobileNav } from './mobile-nav';
import type { NavItem } from './types';

interface NavProps {
  items: NavItem[];
}

export function MainNav(props: NavProps) {
  const segment = useSelectedLayoutSegment();
  const { organization } = useParams();
  const items = props.items.map((item) => ({
    ...item,
    href: `/${organization}${item.href}`,
  }));
  const [open, setOpen] = useState(false);

  return (
    <div className="flex md:gap-10">
      <Link className="hidden items-center space-x-2 md:flex" href="/">
        <Image width={50} height={50} src="/logo.png" alt="Superscale" />
        <span className="hidden font-bold sm:inline-block">Superscale</span>
      </Link>
      {items.length ? (
        <nav className="hidden gap-6 md:flex">
          {items.map((item) => (
            <Link
              className={cn(
                'hover:text-foreground/80 flex items-center text-lg font-medium transition-colors sm:text-sm',
                item.href.startsWith(`/${organization}/${segment}`)
                  ? 'text-foreground'
                  : 'text-foreground/60',
                item.disabled && 'cursor-not-allowed opacity-80'
              )}
              href={item.href}
              key={item.href}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      ) : null}
      <button
        className="flex items-center space-x-2 md:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <Icons.close />
        ) : (
          <Image width={36} height={36} src="/logo.png" alt="Superscale" />
        )}
        <span className="font-bold">Superscale</span>
      </button>
      {open && items.length && (
        <MobileNav items={items} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}
