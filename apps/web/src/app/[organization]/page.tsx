import { getCurrentUser } from '@superscale/lib/auth/session';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/auth/sign-in`);
  }

  // Redirect to onboarding if the user doesn't yet have an organization or has not completed onboarding
  if (
    !user.name ||
    !user.memberships?.length ||
    !user.memberships[0].organization.completedOnboarding
  ) {
    redirect(`/onboarding`);
  }

  return (
    <main className="container flex min-h-screen flex-col items-center justify-between p-24">
      {JSON.stringify(user, null, 2)}
    </main>
  );
}
