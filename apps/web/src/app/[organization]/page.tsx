import { getCurrentUser } from '@superscale/lib/auth/session';
import { redirect } from 'next/navigation';
import { Editor } from '@superscale/editor';
import { Form } from '@superscale/ui/atoms/form';

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
    <main className="container flex min-h-screen flex-col items-center gap-4 p-24">
      <div className="flex w-full">{JSON.stringify(user, null, 2)}</div>
      <div className="flex h-full w-full flex-row rounded-md border-2 border-gray-200">
        <Form></Form>
        <Editor />
      </div>
    </main>
  );
}
