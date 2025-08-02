import { getCurrentUser } from '@superscale/lib/auth/session';
import { notFound, redirect } from 'next/navigation';
import { AccountNav } from '@/components/nav/account-nav';
import { MainNav } from '@/components/nav/main-nav';
import { dashboardConfig } from '@/config/dashboard';

interface Props {
  children: React.ReactNode;
  params: Promise<{ organization: string }>;
}

export default async function DashboardLayout(props: Props) {
  const params = await props.params;

  const { organization } = params;

  const { children } = props;

  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/sign-in');
  }

  if (!user.name || user.memberships.length === 0) {
    redirect('/onboarding');
  }

  if (
    !user.memberships.some(
      (membership) =>
        membership.organization.slug === organization.toLowerCase()
    )
  ) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <header className="bg-background sticky top-0 z-40 border-b">
        <div className="flex h-16 items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <MainNav items={dashboardConfig.mainNav} />
          <AccountNav user={user} />
        </div>
      </header>
      {children}
    </div>
  );
}
