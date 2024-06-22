import { WorkspaceNav } from '~/components/nav/workspace-nav';
import { getCurrentUser } from '@superscale/lib/auth/session';
import { PropsWithChildren } from 'react';
import { Back } from './back';

export async function NotFoundLayout({ children }: PropsWithChildren) {
  const user = await getCurrentUser();

  return (
    <div className="flex h-screen flex-col">
      <div className="flex w-full flex-row items-end justify-between px-8 py-6">
        <Back />
        {user ? <WorkspaceNav user={user} /> : null}
      </div>
      <main className="container h-full">{children}</main>
    </div>
  );
}
