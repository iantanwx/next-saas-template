'use client';

import { ZeroProvider } from '@rocicorp/zero/react';
import type { UserWithMemberships } from '@superscale/crud/types';
import { useMemo } from 'react';
import { schema } from './schema.gen';
import type { Session } from '@supabase/supabase-js';

export type ZeroProviderProps = {
  children: React.ReactNode;
  user?: UserWithMemberships | null;
  session?: Session | null;
  server: string;
};

export function Z({ children, user, server, session }: ZeroProviderProps) {
  // If prerequisites are missing, render children without Zero
  if (
    !server ||
    !user ||
    !user.memberships[0]?.organizationId ||
    !session?.access_token
  ) {
    return <>{children}</>;
  }
  const opts = useMemo(
    () => ({
      schema,
      userID: user.id,
      server,
      auth: session.access_token,
      mutators: {},
    }),
    [user.id, server, session.access_token]
  );

  return <ZeroProvider {...opts}>{children}</ZeroProvider>;
}
