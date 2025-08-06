import type { PGlite } from '@electric-sql/pglite';
import { live } from '@electric-sql/pglite/live';
import { PGliteWorker } from '@electric-sql/pglite/worker';
import { electricSync } from '@electric-sql/pglite-sync';
import { drizzle } from 'drizzle-orm/pglite';
import { config } from './config';
import { schema } from './schema';

/**
 * Initialize PGlite worker with Electric SQL sync and live queries
 */
export async function initializePGlite() {
  // Create worker with proper module loading
  const client = await PGliteWorker.create(
    new Worker(new URL('./worker.ts', import.meta.url), {
      type: 'module',
    }),
    {
      dataDir: `idb://pglite-db`,
      extensions: {
        live, // Enable live queries on the main thread
        electric: electricSync({
          debug: config.NEXT_PUBLIC_PGLITE_DEBUG,
        }),
      },
    }
  );

  // Create Drizzle instance with the worker
  const db = drizzle(client as unknown as PGlite, { schema });

  return { pg: client, db };
}
