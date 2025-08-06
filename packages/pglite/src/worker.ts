import { PGlite } from '@electric-sql/pglite';
import { worker } from '@electric-sql/pglite/worker';
import { migrate } from './init';

worker({
  async init(options) {
    const { dataDir } = options;

    // Create PGlite instance with Electric sync extension
    const pg = new PGlite({ dataDir });

    // Initialize database with proper Drizzle migrations and sync
    await migrate(pg);

    return pg;
  },
});
