import { DashboardHeader } from '@/components/header';
import { Separator } from '@/components/ui/separator';
import { invitations, organizations } from '@superscale/crud';
import {
  OrganizationRole,
  OrganizationWithMembers,
} from '@superscale/crud/types';
import { getCurrentUser } from '@superscale/lib/auth/session';
import { redirect } from 'next/navigation';
import { InvitationForm } from './invitation-form';
import { MembersTable } from './tables';
import { RowData } from './tables/columns';

async function fetchData(organization: OrganizationWithMembers) {
  const invitationRecords = await invitations.listByOrganization(
    organization.id
  );

  const data: RowData[] = [];
  for (const member of organization.members ?? []) {
    data.push({
      type: 'member',
      userId: member.userId,
      name: member.user.name!!,
      email: member.user.email!!,
      role: member.role as OrganizationRole,
      imageUrl: member.user.avatarUrl,
    });
  }
  for (const invitation of invitationRecords) {
    data.push({
      type: 'invitation',
      email: invitation.email,
      role: invitation.role as OrganizationRole,
      invitationId: invitation.id,
    });
  }
  return data;
}

interface Props {
  params: {
    organization: string;
  };
}

export default async function MembersPage({
  params: { organization: slug },
}: Props) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/sign-in');
  }
  const organization = await organizations.getBySlug(slug);
  const data = await fetchData(organization);
  return (
    <div className="flex flex-col">
      <DashboardHeader heading="Team" text="Manage your team here." />
      <Separator className="mb-4 mt-6" />
      <InvitationForm user={user} organization={organization} />
      <Separator className="mb-8 mt-6" />
      <MembersTable user={user} organization={organization} data={data} />
    </div>
  );
}
