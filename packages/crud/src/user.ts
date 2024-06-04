import { eq, type InferSelectModel } from 'drizzle-orm';
import { db } from './db/connection';
import { users } from './db/schema';

type UpdateUserData = Partial<Omit<InferSelectModel<typeof users>, 'id'>>;

export async function update(id: string, data: UpdateUserData) {
  return await db.update(users).set(data).where(eq(users.id, id));
}

export type UserWithMemberships = Awaited<ReturnType<typeof getById>>;

export async function getById(id: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
    with: {
      memberships: {
        with: {
          organization: true,
        },
      },
    },
  });
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}

export async function findByEmail(email: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
    with: {
      memberships: {
        with: {
          organization: true,
        },
      },
    },
  });
  return user;
}
