import Image from 'next/image';
import Link from 'next/link';

import { cn } from '~/lib/utils';
import { useLockBodyScroll } from '@uidotdev/usehooks';
import { useParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { NavItem } from './types';

interface MobileNavProps {
  items: NavItem[];
  onClose: () => void;
}

export function MobileNav(props: MobileNavProps) {
  useLockBodyScroll();

  const containerRef = useRef<HTMLDivElement>(null); // <-- Create a ref

  const { onClose } = props;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose(); // Call the onClose prop if clicked outside
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const { organization } = useParams();
  const items = props.items.map((item) => ({
    ...item,
    href: `/${organization}${item.href}`,
  }));

  return (
    <div
      className={cn(
        'animate-in slide-in-from-bottom-80 fixed inset-0 top-16 z-50 grid h-[calc(100vh-4rem)] grid-flow-row auto-rows-max overflow-auto p-6 pb-32 shadow-md md:hidden'
      )}
    >
      <div
        ref={containerRef}
        className="bg-popover text-popover-foreground relative z-20 grid gap-6 rounded-md p-4 shadow-md"
      >
        <Link href="/" className="flex items-center space-x-2">
          <Image width={36} height={36} src="/logo.png" alt="Superscale" />
          <span className="font-bold">Superscale</span>
        </Link>
        <nav className="grid grid-flow-row auto-rows-max text-sm">
          {items.map((item, index) => (
            <Link
              key={index}
              href={item.disabled ? '#' : item.href}
              className={cn(
                'flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline',
                item.disabled && 'cursor-not-allowed opacity-60'
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
