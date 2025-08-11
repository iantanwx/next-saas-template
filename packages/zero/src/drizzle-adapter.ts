import type { DBConnection, DBTransaction, Row } from '@rocicorp/zero/pg';
import type { DB } from '@superscale/crud/db/connection';

export type DrizzleTransaction = Parameters<
  Parameters<DB['transaction']>[0]
>[0];
// Re-export schema for convenience
export * as schema from '@superscale/crud/schema';

/**
 * Custom Drizzle adapter for Zero ServerTransaction
 * Based on Jökull Sólberg's implementation: https://www.solberg.is/zero-custom-db-connection
 * Adapted for postgres-js instead of node-postgres
 */
export class DrizzleConnection implements DBConnection<DrizzleTransaction> {
  drizzle: DB;

  constructor(drizzle: DB) {
    this.drizzle = drizzle;
  }

  // `query` is used by Zero's ZQLDatabase for ZQL reads on the server
  async query(sql: string, params: unknown[]): Promise<Row[]> {
    // For postgres-js with Drizzle, we use the sql` template
    // However, Zero provides parameterized queries, so we need to handle this properly
    // For now, we'll use a simple approach - in production this might need refinement
    const { rows } = await this.drizzle.$client.query<Row>(sql, params);
    return rows;
  }

  // `transaction` wraps Drizzle's transaction
  transaction<T>(
    fn: (tx: DBTransaction<DrizzleTransaction>) => Promise<T>
  ): Promise<T> {
    return this.drizzle.transaction((drizzleTx) =>
      // Pass a new Zero DBTransaction wrapper around Drizzle's transaction
      fn(new ZeroDrizzleTransaction(drizzleTx))
    );
  }
}

class ZeroDrizzleTransaction implements DBTransaction<DrizzleTransaction> {
  readonly wrappedTransaction: DrizzleTransaction;

  constructor(drizzleTx: DrizzleTransaction) {
    this.wrappedTransaction = drizzleTx;
  }

  // This `query` method is used if ZQL reads happen *within*
  // a custom mutator that is itself running inside this wrapped transaction.
  async query(sql: string, params: unknown[]): Promise<Row[]> {
    // For postgres-js transactions, use the execute method
    // Note: params handling may need refinement for production use
    // @ts-expect-error - client is not typed
    const { rows } = await this.wrappedTransaction._.session.client.query<Row>(
      sql,
      params
    );
    return rows;
  }
}

/**
 * Create a connection provider for Zero's PushProcessor
 * This function creates a DrizzleConnection from our existing Drizzle instance
 */
export function createDrizzleConnectionProvider(drizzle: DB) {
  return () => new DrizzleConnection(drizzle);
}
