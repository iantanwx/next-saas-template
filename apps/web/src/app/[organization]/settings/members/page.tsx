import { invitations, organizations } from '@superscale/crud';
import type {
  OrganizationRole,
  OrganizationWithMembers,
} from '@superscale/crud/types';
import { getCurrentUser } from '@superscale/lib/auth/session';
import { Separator } from '@superscale/ui/components/separator';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/header';
import { InvitationForm } from './invitation-form';
import { MembersTable } from './tables';
import type { RowData } from './tables/columns';

async function fetchData(organization: OrganizationWithMembers) {
  const invitationRecords = await invitations.listByOrganization(
    organization.id
  );

  const data: RowData[] = [];
  for (const member of organization.members ?? []) {
    data.push({
      type: 'member',
      userId: member.userId,
      name: member.user.name!,
      email: member.user.email!,
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
  params: Promise<{
    organization: string;
  }>;
}

export default async function MembersPage(props: Props) {
  const params = await props.params;

  const { organization: slug } = params;

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
