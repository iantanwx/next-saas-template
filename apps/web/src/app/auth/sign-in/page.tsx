import Image from 'next/image';
import SignInForm from './form';
import Oauth from './oauth';
import { getCurrentSession } from '@superscale/lib/auth';
import { redirect } from 'next/navigation';

interface Props {
  searchParams: { email?: string; invitationId?: string };
}

export default async function SignInPage({ searchParams }: Props) {
  const { email, invitationId } = searchParams;
  const { user } = await getCurrentSession();

  // we don't redirect the user if they are trying to log in to accept the correct invitation.
  if (!invitationId && user && user.memberships.length > 0) {
    redirect(`/${user.memberships[0].organization.slug}`);
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="mb-12 flex flex-col items-center">
        <Image
          className="mb-2"
          alt="logo"
          src="/logo.png"
          width={65}
          height={65}
        />
        <h1 className="text-4xl font-semibold leading-3">Superscale</h1>
      </div>
      <div className="mx-auto flex w-full flex-col sm:w-[380px]">
        <div className="mb-6 flex flex-col space-y-1.5">
          <h2 className="leading-2 text-xl font-semibold">
            Let's get started.
          </h2>
          <p className="text-muted-foreground text-sm">
            Use your work email to make it easier to invite your co-workers.
          </p>
        </div>
        <div className="flex w-full flex-col">
          <Oauth />
          <div className="relative my-4">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm font-medium leading-6">
              <span className="text-muted-foreground bg-white px-6">
                Or continue with email
              </span>
            </div>
          </div>
          <SignInForm email={email} invitationId={invitationId} />
        </div>
      </div>
    </div>
  );
}
