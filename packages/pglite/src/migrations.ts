import type { MigrationMeta } from 'drizzle-orm/migrator';

// Import journal to get migration metadata
import journal from '../migrations/meta/_journal.json';

// Use webpack's require.context to load all SQL files
// This works in both Next.js and other webpack-based bundlers
const migrationContext = require.context('../migrations', false, /\.sql$/);

/**
 * Generate SHA-256 hash using Web Crypto API (browser-compatible)
 */
async function sha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}

/**
 * Runtime implementation of readMigrationFiles from drizzle-orm/migrator
 * Processes migrations bundled by webpack instead of reading from filesystem
 */
export async function getMigrations(): Promise<MigrationMeta[]> {
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
