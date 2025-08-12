'use client';

import type { Zero } from '@rocicorp/zero';
import { ZeroProvider } from '@rocicorp/zero/react';
import type { Session } from '@supabase/supabase-js';
import type { UserWithMemberships } from '@superscale/crud/types';
import { useMemo } from 'react';
import { createMutators, type Mutators } from './mutators';
import type { Schema } from './schema';
import { schema } from './schema';

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
      init: async (z: Zero<Schema, Mutators>) => {
        // Preload user memberships
        z.query.users.related('memberships').preload();

        const orgId = user.memberships[0]?.organizationId;
        if (!orgId) return;

        // Preload org tags for tag picker
        z.query.tags.where('organizationId', orgId).preload({ ttl: '5m' });

        // Preload first 100 todos for the org for snappy initial render
        z.query.todos
          .where('organizationId', orgId)
          .where('deletedAt', 'IS', null)
          .orderBy('updatedAt', 'desc')
          .limit(100)
          .preload({ ttl: '5m' });
      },
    }),
    [user.id, user.email, server, session.access_token]
  );

  return <ZeroProvider {...opts}>{children}</ZeroProvider>;
}
