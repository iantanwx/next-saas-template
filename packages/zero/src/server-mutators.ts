import { createMutators } from './mutators';
import type { AuthData } from './schema';

// TODO: Extend with server-only logic (async tasks, auditing, side-effects) as needed.
// For now, reuse client mutators; Zero will execute them authoritatively on the server.
export function createServerMutators(auth: AuthData) {
  return createMutators(auth);
}
