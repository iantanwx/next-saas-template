import { PropsWithChildren } from 'react';
import { SideNav } from '~/components/nav/side-nav';
import { dashboardConfig } from '~/config/dashboard';

export default function SettingsLayout({ children }: PropsWithChildren) {
  return (
    <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
      <aside>
        <SideNav items={dashboardConfig.settingsNav} />
      </aside>
      <main>{children}</main>
    </div>
  );
}
