import { invitations } from '@superscale/crud';
import { getCurrentUser } from '@superscale/lib/auth/session';
import { notFound, redirect } from 'next/navigation';
import { InvitationCard } from './card';

interface Props {
  params: Promise<{ invitationId: string }>;
  searchParams: Promise<{ accept?: boolean }>;
}

export default async function AcceptInvitationPage(props: Props) {
  const searchParams = await props.searchParams;

  const { accept } = searchParams;

  const params = await props.params;

  const { invitationId } = params;

  const invitation = await invitations.findById(invitationId);
  if (!invitation) {
    notFound();
  }

  const user = await getCurrentUser();
  // In this case, the user was asked to sign in and redirected back here.
  if (accept && user && user.email === invitation.email) {
    await invitations.accept(invitationId);
    redirect(`/${invitation.organization.slug}`);
  }

  return (
    <div className="container flex h-full flex-col items-center justify-center">
      <InvitationCard invitation={invitation} user={user} />
    </div>
  );
}
