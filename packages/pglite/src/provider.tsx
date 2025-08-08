'use client';

import { PGliteProvider } from '@electric-sql/pglite-react';
import type { UserWithMemberships } from '@superscale/crud/types';
import { createContext, useEffect, useRef, useState } from 'react';
import type { PGlite } from './index';
import { initializePGlite } from './index';
import { syncTodos } from './sync';

interface DBContextValue {
  pg: PGlite | null; // Use any to avoid type conflicts
  status: DBStatus;
  error: Error | null;
}

export enum DBStatus {
  Initializing = 'initializing',
  Initialized = 'initialized',
  Syncing = 'syncing',
  Ready = 'ready',
}

export const DBContext = createContext<DBContextValue>({
  pg: null,
  status: DBStatus.Initializing,
  error: null,
});

interface DBProviderProps {
  children: React.ReactNode;
  user: UserWithMemberships | null;
}

export function DBProvider({ user, children }: DBProviderProps) {
  const pgRef = useRef<PGlite | null>(null);
  const [status, setStatus] = useState(DBStatus.Initializing);

  useEffect(() => {
    initializePGlite().then(({ pg }) => {
      pgRef.current = pg;
      setStatus(DBStatus.Initialized);
    });
  }, []);

  useEffect(() => {
    // without a user we cannot sync
    if (!user || !user.memberships[0]?.organization.id) return;

    // still initializing
    if (!pgRef.current) return;

    // syncing, or already initialized + synced
    if ([DBStatus.Syncing, DBStatus.Ready].includes(status)) return;

    setStatus(DBStatus.Syncing);
    // TODO: should return unsubscribe function for clean up
    syncTodos(pgRef.current, user.id, user.memberships[0].organization.id).then(
      () => {
        setStatus(DBStatus.Ready);
      }
    );
  }, [user, status]);

  const contextValue: DBContextValue = {
    pg: pgRef.current,
    status,
    error: null,
  };

  return (
    <DBContext.Provider value={contextValue}>
      <PGliteProvider db={pgRef.current || undefined}>
        {children}
      </PGliteProvider>
    </DBContext.Provider>
  );
}
