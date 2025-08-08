'use client';

import { Skeleton } from '@superscale/ui/components/skeleton';

export default function AppLoading() {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </main>
  );
}
