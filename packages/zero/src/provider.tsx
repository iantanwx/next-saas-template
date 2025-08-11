'use client';

import { ZeroProvider } from '@rocicorp/zero/react';
import type { Session } from '@supabase/supabase-js';
import type { UserWithMemberships } from '@superscale/crud/types';
import { useMemo } from 'react';
import { createMutators } from './mutators';
import { schema } from './schema.gen';

export type ZeroProviderProps = {
  children: React.ReactNode;
  user?: UserWithMemberships | null;
  session?: Session | null;
  server: string;
};

export function Z({ children, user, server, session }: ZeroProviderProps) {
  // If prerequisites are missing, render children without Zero
  if (!server || !user || !user.memberships[0]?.organizationId || !session) {
    return <>{children}</>;
  }
  const opts = useMemo(
    () => ({
      schema,
      userID: user.id,
      server,
      auth: session.access_token,
      mutators: createMutators({
        sub: user.id,
        email: user.email ?? undefined,
      }),
    }),
    [user.id, user.email, server, session.access_token]
  );

  return <ZeroProvider {...opts}>{children}</ZeroProvider>;
}
