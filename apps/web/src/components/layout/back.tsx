'use client';

import { Button } from '~/components/ui/button';
import { ChevronLeftIcon } from 'lucide-react';
import Link from 'next/link';

export function Back() {
  return (
    <Button
      variant="ghost"
      className="flex flex-row items-center justify-center"
    >
      <ChevronLeftIcon className="mr-2 h-3 w-3" />
      <Link href="/">Back to Superscale</Link>
    </Button>
  );
}
