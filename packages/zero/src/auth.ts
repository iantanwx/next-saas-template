import type { Transaction } from '@rocicorp/zero';
import type { ServerTransaction } from '@rocicorp/zero/pg';
import { assert } from '@superscale/lib/utils/assert';
import { must } from '@superscale/lib/utils/must';
import type { AuthData, Schema } from './schema';

export type OrgRole = 'owner' | 'admin' | 'member';

// Ensure an authenticated user and return the user id
export function ensureUser(auth: AuthData): string {
  assert(auth?.sub, 'Unauthenticated');
  return auth.sub;
}

export async function assertOrgMember(
  tx: Transaction<Schema> | ServerTransaction<Schema, unknown>,
  userId: string,
  organizationId: string
): Promise<void> {
  must(
    await tx.query.organizationMembers
      .where('userId', userId)
      .where('organizationId', organizationId)
      .one()
  );
}

export async function isOrgAdmin(
  tx: Transaction<Schema> | ServerTransaction<Schema, unknown>,
  userId: string,
  organizationId: string
): Promise<boolean> {
  const member = must(
    await tx.query.organizationMembers
      .where('userId', userId)
      .where('organizationId', organizationId)
      .one()
  );
  return member.role === 'owner' || member.role === 'admin';
}

export async function assertOrgAdmin(
  tx: Transaction<Schema> | ServerTransaction<Schema, unknown>,
  userId: string,
  organizationId: string
): Promise<void> {
  const ok = await isOrgAdmin(tx, userId, organizationId);
  assert(ok, 'Forbidden: requires admin/owner');
}

export async function assertCanWriteTodo(
  tx: Transaction<Schema> | ServerTransaction<Schema, unknown>,
  userId: string,
  todoId: string
): Promise<void> {
  const todo = must(await tx.query.todos.where('id', todoId).one());
  assert(todo.userId === userId, 'Forbidden: not the todo owner');
}
