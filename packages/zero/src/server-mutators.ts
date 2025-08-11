import type { Transaction } from '@rocicorp/zero';
import type { CustomMutatorDefs, ServerTransaction } from '@rocicorp/zero/pg';
import { assertCanWriteTodo, assertOrgMember } from './auth';
import type { DrizzleTransaction } from './drizzle-adapter';
import { createMutators } from './mutators';
import type { AuthData, Schema } from './schema';

// TODO: Extend with server-only logic (async tasks, auditing, side-effects) as needed.
// For now, reuse client mutators; Zero will execute them authoritatively on the server.
export function createServerMutators(auth: AuthData | undefined) {
  const base = createMutators(auth);
  return {
    ...base,
    todo: {
      ...base.todo,
      async create(tx: ServerTransaction<Schema, DrizzleTransaction>, input) {
        const userId = auth?.sub;
        if (!userId) throw new Error('Unauthenticated');
        await assertOrgMember(tx, userId, input.organizationId);
        return base.todo.create(tx as unknown as Transaction<Schema>, input);
      },
      async update(tx: ServerTransaction<Schema, DrizzleTransaction>, input) {
        const userId = auth?.sub;
        if (!userId) throw new Error('Unauthenticated');
        if (!input.id) throw new Error('Todo ID is required');
        await assertCanWriteTodo(tx, userId, input.id);
        return base.todo.update(tx as unknown as Transaction<Schema>, input);
      },
      async delete(tx: ServerTransaction<Schema, DrizzleTransaction>, input) {
        const userId = auth?.sub;
        if (!userId) throw new Error('Unauthenticated');
        if (!input.id) throw new Error('Todo ID is required');
        await assertCanWriteTodo(tx, userId, input.id);
        return base.todo.delete(tx as unknown as Transaction<Schema>, input);
      },
      async addTag(tx: ServerTransaction<Schema, DrizzleTransaction>, input) {
        const userId = auth?.sub;
        if (!userId) throw new Error('Unauthenticated');
        await assertOrgMember(tx, userId, input.organizationId);
        return base.todo.addTag(tx as unknown as Transaction<Schema>, input);
      },
      async removeTag(
        tx: ServerTransaction<Schema, DrizzleTransaction>,
        input
      ) {
        const userId = auth?.sub;
        if (!userId) throw new Error('Unauthenticated');
        return base.todo.removeTag(tx as unknown as Transaction<Schema>, input);
      },
    },
  } as const satisfies CustomMutatorDefs<
    ServerTransaction<Schema, DrizzleTransaction>
  >;
}
