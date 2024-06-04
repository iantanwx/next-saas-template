import { invitations } from '@superscale/crud';
import { getCurrentUser } from '@superscale/lib/auth/session';
import { notFound, redirect } from 'next/navigation';
import { InvitationCard } from './card';

interface Props {
  params: { invitationId: string };
  searchParams: { accept?: boolean };
}

export default async function AcceptInvitationPage({
  params: { invitationId },
  searchParams: { accept },
}: Props) {
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
