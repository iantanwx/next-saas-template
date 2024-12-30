import { buttonVariants } from '@/components/ui/button';
import cn from 'classnames';
import Image from 'next/image';
import Link from 'next/link';
import * as z from 'zod';

const schema = z.object({
  error: z.string().toLowerCase().default(''),
});

interface Props {
  searchParams: Promise<{ [key: string]: string }>;
}

function copy(error: string) {
  switch (error) {
    case 'verification':
      return (
        <>
          <p className="text-muted-foreground pb-6">
            The link you used is no longer valid.
          </p>
          <p className="text-muted-foreground pb-4">
            It was either used already or it expired.
          </p>
        </>
      );
    case 'accessdenied':
      return (
        <>
          <p className="text-muted-foreground pb-6">
            Looks like you don't have access to this account.
          </p>
          <p className="text-muted-foreground pb-4">
            Please contact your workspace administrator.
          </p>
        </>
      );
    default:
      return (
        <>
          <p className="text-muted-foreground pb-6">
            Something seems to have gone wrong on our end.
          </p>
        </>
      );
  }
}

export default async function AuthErrorPage(props: Props) {
  const searchParams = await props.searchParams;
  const params = schema.parse(searchParams);
  return (
    <div className="container h-full">
      <div className="flex h-full w-full flex-col items-center justify-center sm:flex-row">
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex flex-col items-start justify-center">
            <h1 className="pb-8 text-4xl font-bold">
              Oops! We had a problem signing you in.
            </h1>
            {copy(params.error)}
            <Link
              className={cn(buttonVariants({ variant: 'outline' }), 'mt-4')}
              href="/auth/sign-in"
            >
              Sign in
            </Link>
          </div>
        </div>
        <div className="hidden flex-1 flex-col md:flex">
          <Image
            src="/illustrations/error.svg"
            alt={'error-illustration'}
            width="800"
            height="800"
          />
        </div>
      </div>
    </div>
  );
}
