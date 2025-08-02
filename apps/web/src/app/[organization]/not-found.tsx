import Image from 'next/image';
import { NotFoundLayout } from '@/components/layout/not-found';

export default async function WorkspaceNotFound() {
  return (
    <NotFoundLayout>
      <div className="flex h-full w-full flex-col items-center justify-center">
        <div className="mb-8 hidden md:flex">
          <Image
            src="/illustrations/error.svg"
            alt={'error-illustration'}
            width="450"
            height="450"
          />
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <h1 className="pb-8 text-4xl font-bold">
              We couldn't find the workspace you're looking for.
            </h1>
            <p className="text-muted-foreground pb-6">
              It may not exist, or you might not have the appropriate
              permissions required to access it.
            </p>
          </div>
        </div>
      </div>
    </NotFoundLayout>
  );
}
