import type { SyncShapeToTableResult } from '@electric-sql/pglite-sync';

export async function synced(syncResult: SyncShapeToTableResult) {
  return new Promise<boolean>((resolve) => {
    syncResult.stream.subscribe((messages) => {
      if (!messages.length) return;
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage) return;
      if (lastMessage.headers.control === 'up-to-date') {
        resolve(true);
      }
    });
  });
}
