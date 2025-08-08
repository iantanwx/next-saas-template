import type { PGlite } from '@electric-sql/pglite';
import { sha256 } from '@superscale/lib/utils/crypto';
import type { MigrationMeta } from 'drizzle-orm/migrator';
import { drizzle } from 'drizzle-orm/pglite';
// Import journal to get migration metadata
import journal from '../migrations/meta/_journal.json';
import { schema } from './schema';

// Webpack require.context types
declare var require: {
  context(directory: string, useSubdirectories: boolean, regExp: RegExp): {
    keys(): string[];
    (id: string): any;
  };
};

// Use webpack's require.context to load all SQL files
// This works in both Next.js and other webpack-based bundlers
const migrationContext = require.context('../migrations', false, /\.sql$/);

/**
 * Runtime implementation of readMigrationFiles from drizzle-orm/migrator
 * Processes migrations bundled by webpack instead of reading from filesystem
 */
async function getMigrations(): Promise<MigrationMeta[]> {
  const migrationQueries: MigrationMeta[] = [];

  for (const journalEntry of journal.entries) {
    const filename = `./${journalEntry.tag}.sql`;

    // Get the migration content using webpack context
    let query: string;
    try {
      // webpack's require.context returns the module, we need its default export or content
      const module = migrationContext(filename);
      query = typeof module === 'string' ? module : module.default || module;
    } catch (error) {
      throw new Error(
        `Migration file ${journalEntry.tag}.sql not found in bundled migrations`
      );
    }

    // Split by statement breakpoint as Drizzle expects
    const statements = query
      .split('--> statement-breakpoint')
      .map((s) => s.trim());

    // Generate hash using Web Crypto API
    const hash = await sha256(query);

    migrationQueries.push({
      sql: statements,
      bps: journalEntry.breakpoints,
      folderMillis: journalEntry.when,
      hash,
    });
  }

  return migrationQueries;
}

export async function migrate(client: any) {
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
