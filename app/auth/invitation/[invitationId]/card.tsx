'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InvitationWithOrgAndInviter } from '@/crud/invitation';
import { UserWithMemberships } from '@/crud/user';
import { t } from '@/lib/trpc';
import { useRouter } from 'next/navigation';

interface Props {
  user?: UserWithMemberships | null;
  invitation: NonNullable<InvitationWithOrgAndInviter>;
}

export function InvitationCard({ invitation, user }: Props) {
  const router = useRouter();
  const acceptInvitation = t.organization.acceptInvitation.useMutation();
  const isRightUser = invitation.email === user?.email;
  const handleClick = async () => {
    // The user is signed in to the correct account, but has not yet accepted the invitation.
    if (isRightUser) {
      await acceptInvitation.mutateAsync({ invitationId: invitation.id });
      router.push('/dashboard');
      return;
    }

    // User is not signed in, or signed in with the wrong email. redirect to sign in page.
    router.push(
      `/auth/sign-in?email=${invitation.email}&invitationId=${invitation.id}`
    );
  };

  return (
    <Card className="flex flex-col items-center md:w-[450px]">
      <CardHeader>
        <CardTitle>
          {`${invitation.createdBy.name} has invited you to ${invitation.organization.name}`}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6 text-center">
        <p className="text-sm text-foreground">
          {isRightUser
            ? `You will be added to ${invitation.organization.name} once you accept the invitation.`
            : `To accept the invitation, please sign in or create an account with ${invitation.email}`}
        </p>
        <Button onClick={handleClick}>Accept Invitation</Button>
      </CardContent>
    </Card>
  );
}
