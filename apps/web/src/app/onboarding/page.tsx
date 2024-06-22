import { Back } from '~/components/layout/back';
import { WorkspaceNav } from '~/components/nav/workspace-nav';
import { getCurrentSession } from '@superscale/lib/auth';

import Image from 'next/image';
import { redirect } from 'next/navigation';
import Onboarding from './steps';

export default async function OnboardingPage() {
  const { user } = await getCurrentSession();
  if (!user) {
    return redirect('/auth/sign-in');
  }

  if (
    user.name &&
    user.memberships?.length > 0 &&
    user.memberships[0].organization.completedOnboarding
  ) {
    return redirect(`/${user.memberships[0].organization.slug}`);
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex w-full flex-row items-end justify-between px-8 py-6">
        <Back />
        {user ? <WorkspaceNav user={user} /> : null}
      </div>
      <main className="container flex h-screen w-screen flex-col items-center justify-center space-y-12 py-24">
        <div className="flex flex-col items-center justify-center">
          <Image src="/logo.png" height={120} width={120} alt="logo" />
          <h1 className="text-4xl font-bold">Superscale</h1>
        </div>
        <Onboarding user={user} />
      </main>
    </div>
  );
}
