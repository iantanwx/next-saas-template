'use client';

import Link from 'next/link';
import { marketingPagesConfig } from '~/config/pages';
import { Button } from '~/components/ui/button';
import { usePathname } from 'next/navigation';
import cn from 'classnames';
import { Icons } from '~/components/util/icons';

interface Props {
  className?: string;
}

export default function MarketingHeader({ className }: Props) {
  const pathname = usePathname();
  return (
    <header className={cn('grid w-full grid-cols-2 md:grid-cols-5', className)}>
      <div className="col-span-1 flex items-center">
        <Link className="text-2xl font-bold" href="/">
          Superscale
        </Link>
      </div>
      <div className="col-span-1 flex items-center justify-center gap-4 md:col-span-3">
        {marketingPagesConfig.map((page) => {
          const isActive = pathname.startsWith(page.href);
          return (
            <Button
              className={cn('p-2 text-base', { 'font-semibold': isActive })}
              key={page.segment}
              variant="link"
              asChild
            >
              <Link href={page.href}>{page.title}</Link>
            </Button>
          );
        })}
      </div>
      <div className="flex items-center justify-end md:col-span-1">
        <Button variant="secondary" asChild>
          <Link href="/auth/sign-in">Login</Link>
        </Button>
      </div>
    </header>
  );
}
