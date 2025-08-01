import { organizations } from '@superscale/crud';
import { getCurrentUser } from '@superscale/lib/auth/session';
import { Separator } from '@superscale/ui/components/separator';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/header';
import { DeleteOrganization } from './delete-org';
import { OrganizationSettingsForm } from './org-details-form';

interface Props {
  params: Promise<{
    organization: string;
  }>;
}

export default async function SettingsPage(props: Props) {
  const params = await props.params;

  const { organization: slug } = params;

  const organization = await organizations.getBySlug(slug);
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/sign-in');
  }

  return (
    <div className="flex flex-col">
      <DashboardHeader
        heading="General"
        text="Manage general organization settings here."
      />
      <Separator className="mb-4 mt-6" />
      <OrganizationSettingsForm user={user} organization={organization} />
      <Separator className="mb-4 mt-6" />
      <DeleteOrganization user={user} organization={organization} />
    </div>
  );
}
