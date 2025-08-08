import { config } from './config';
import type { PGlite } from './index';
import { synced } from './util';

/**
 * Sync todos for a specific user and organization
 */
export async function syncTodos(
  pg: PGlite,
  userId: string,
  organizationId: string
) {
  const electricUrl = config.NEXT_PUBLIC_ELECTRIC_URL;

  if (!electricUrl) {
    if (config.NEXT_PUBLIC_PGLITE_DEBUG) {
      console.warn('Electric SQL URL not configured, sync disabled');
    }
    return null;
  }

  // Build the shape URL with parameters
  const shapeUrl = new URL('/v1/shape', electricUrl);
  const syncHandle = await pg.electric.syncShapeToTable({
    shape: {
      url: shapeUrl.toString(),
      params: {
        table: 'todos',
        where: `user_id = '${userId}' AND organization_id = '${organizationId}'`,
      },
    },
    table: 'todos',
    primaryKey: ['id'],
    shapeKey: `todos-${userId}-${organizationId}`, // Persist sync state between sessions
  });
  await synced(syncHandle);
  return syncHandle;
}
