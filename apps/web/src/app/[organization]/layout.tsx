import { getCurrentUser } from '@superscale/lib/auth';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@superscale/ui/components/breadcrumb';
import { Separator } from '@superscale/ui/components/separator';
import {
  SidebarInset,
  SidebarTrigger,
} from '@superscale/ui/components/sidebar';
import { notFound, redirect } from 'next/navigation';
import { AppSidebar } from '@/components/nav/app-sidebar';
import { SidebarWrapper } from '@/components/nav/sidebar-wrapper';

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

  const currentOrg = user.memberships.find(
    (membership) => membership.organization.slug === organization.toLowerCase()
  )?.organization;

  if (!currentOrg) {
    notFound();
  }

  return (
    <SidebarWrapper>
      <AppSidebar
        user={{
          name: user.name || '',
          email: user.email || '',
          avatar: user.avatarUrl || '',
        }}
        organization={{
          name: currentOrg.name,
          slug: currentOrg.slug,
        }}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>{organization}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarWrapper>
  );
}
