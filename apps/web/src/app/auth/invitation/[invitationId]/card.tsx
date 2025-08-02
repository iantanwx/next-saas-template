'use client';
import type {
  InvitationWithOrgAndInviter,
  UserWithMemberships,
} from '@superscale/crud/types';
import { t } from '@superscale/trpc/client';
import { Button } from '@superscale/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@superscale/ui/components/card';
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
      router.push(`/${invitation.organization.slug}`);
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
        <p className="text-foreground text-sm">
          {isRightUser
            ? `You will be added to ${invitation.organization.name} once you accept the invitation.`
            : `To accept the invitation, please sign in or sign up with ${invitation.email}`}
        </p>
        <Button onClick={handleClick}>Accept Invitation</Button>
      </CardContent>
    </Card>
  );
}
