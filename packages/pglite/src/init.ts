import type { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { getMigrations } from './migrations';
import { schema } from './schema';

export async function migrate(client: PGlite) {
  const startTime = performance.now();
  console.log('⚡ Running local DB schema migrations...');

  try {
    const db = drizzle(client, { schema });

    const migrations = await getMigrations();

    // using private Drizzle API
    // @ts-ignore
    await db.dialect.migrate(migrations, db.session, {
      migrationsTable: 'drizzle_migrations',
    });

    const endTime = performance.now();
    console.log(
      `⚡ Local DB schema migrations completed in ${Math.round(endTime - startTime)}ms`
    );
  } catch (error) {
    console.error('⚡ Failed to run local DB schema migrations:', error);
    throw error;
  }
}

export async function syncTables(
  pg: PGlite,
  electricUrl: string,
  tables: string[]
) {
  if (!electricUrl || !tables.length) {
    console.log('⚡ No Electric URL or tables specified, skipping sync');
    return;
  }

  const startTime = performance.now();
  console.log(`⚡ Syncing ${tables.length} table(s) with Electric...`);

  try {
    const electric = (pg as any).extensions?.electric;

    if (!electric) {
      throw new Error('Electric extension not available');
    }

    for (const table of tables) {
      await electric.syncShapeToTable({
        shape: {
          url: `${electricUrl}/v1/shape`,
          params: { table },
        },
        table,
        primaryKey: ['id'],
        shapeKey: table,
      });

      console.log(`⚡ Successfully synced table: ${table}`);
    }

    const endTime = performance.now();
    console.log(
      `⚡ Table sync completed in ${Math.round(endTime - startTime)}ms`
    );
  } catch (error) {
    console.error('⚡ Failed to sync tables:', error);
    throw error;
  }
}

export async function initializeDatabase(
  pg: PGlite,
  options: {
    electricUrl?: string;
    syncTables?: string[];
    debug?: boolean;
  }
) {
  const { electricUrl, syncTables: tablesToSync = [], debug = false } = options;

  if (debug) {
    console.log('⚡ Initializing local database...');
  }

  // Run migrations
  await migrate(pg);

  // Sync tables if configured
  if (electricUrl && tablesToSync.length > 0) {
    await syncTables(pg, electricUrl, tablesToSync);
  }

  if (debug) {
    console.log('⚡ Database initialization complete');
  }
}
