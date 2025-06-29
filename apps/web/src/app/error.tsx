'use client';

import { Back } from '@/components/layout/back';
import { Button } from '@superscale/ui/components/button';
import Image from 'next/image';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex w-full flex-row items-center justify-between px-8 py-6">
        <Back />
      </div>
      <main className="container h-full">
        <div className="flex h-full w-full flex-col items-center justify-center">
          <div className="mb-8 hidden md:flex">
            <Image
              src="/illustrations/crashed.svg"
              alt={'error-illustration'}
              width="450"
              height="450"
            />
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center">
              <h1 className="pb-8 text-4xl font-bold">
                Oops! Something went wrong on our end. Try refreshing the page.
              </h1>
              <Button onClick={reset}>Refresh</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
