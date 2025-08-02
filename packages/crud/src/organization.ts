import {
  and,
  count,
  eq,
  type InferSelectModel,
  inArray,
  or,
  sql,
} from 'drizzle-orm';
import { db } from './db/connection';
import {
  organizationMembers,
  organizations,
  userInvitations,
} from './db/schema';

/**
 * Creates a new organization and adds the user as an admin.
 * @param organizationName
 * @param userId
 * @returns
 */
export async function create(
  organizationName: string,
  userId: string,
  completedOnboarding = false
) {
  const id = await db.transaction(async (tx) => {
    const result = await tx
      .insert(organizations)
      .values({
        name: organizationName,
        slug: organizationName.toLowerCase().replace(/\s/g, '-'),
        completedOnboarding,
      })
      .returning({ organizationId: organizations.id });
    const { organizationId } = result[0]!;
    await tx.insert(organizationMembers).values({
      role: 'owner',
      userId,
      organizationId: organizationId,
    });

    return organizationId;
  });

  return await getById(id);
}

export type Organization = InferSelectModel<typeof organizations>;

export type OrganizationWithMembers = Awaited<ReturnType<typeof getById>>;

export async function getById(id: string) {
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, id),
    with: {
      members: {
        with: { user: true },
      },
    },
  });
  if (!org) {
    throw new Error('Organization not found');
  }
  return org;
}

export async function getBySlug(slug: string) {
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.slug, slug),
    with: {
      members: {
        with: { user: true },
      },
    },
  });
  if (!org) {
    throw new Error('Organization not found');
  }
  return org;
}

export async function getByNameOrId(nameOrId: string) {
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, nameOrId),
  });
  if (!org) {
    throw new Error('Organization not found');
  }
  return org;
}

/**
 * Checks if an organization exists by name or slug. Includes soft deleted records.
 * @param nameOrSlug
 * @returns
 */
export async function exists(nameOrSlug: string) {
  const result = await db
    .select({ n: count() })
    .from(organizations)
    .where(
      sql`${organizations.name} = ${nameOrSlug} OR ${organizations.slug} = ${nameOrSlug} AND ${organizations.deletedAt} IS NOT NULL`
    );

  const { n } = result[0]!;
  return n > 0;
}

export async function update(
  organizationId: string,
  name?: string,
  slug?: string
) {
  await db
    .update(organizations)
    .set({ name, slug })
    .where(eq(organizations.id, organizationId));
}

/**
 * This function cascade soft deletes all the organization's relations
 *  - OrganizationMembership
 *  - UserInvitation
 */
export async function softDelete(organizationId: string) {
  await db.transaction(async (tx) => {
    await tx
      .delete(organizationMembers)
      .where(eq(organizationMembers.organizationId, organizationId));
    await tx
      .delete(userInvitations)
      .where(eq(userInvitations.organizationId, organizationId));
    await tx.delete(organizations).where(eq(organizations.id, organizationId));
  });
}

export type OrganizationRole = 'owner' | 'member' | 'admin';

/**
 * Returns an organization with its members.
 * @param organizationId
 * @returns
 */
export async function members(organizationId: string) {
  return await db.query.organizationMembers.findMany({
    where: eq(organizationMembers.organizationId, organizationId),
    with: { user: true },
  });
}

export async function getMemberById(organizationId: string, userId: string) {
  return await db.query.organizationMembers.findFirst({
    where: and(
      eq(organizationMembers.organizationId, organizationId),
      eq(organizationMembers.userId, userId)
    ),
    with: {
      organization: true,
      user: true,
    },
  });
}

export async function getMembersByRole(
  orgNameOrId: string,
  ...roles: OrganizationRole[]
) {
  return await db.query.organizationMembers.findMany({
    where: and(
      or(
        eq(organizations.id, orgNameOrId),
        eq(organizations.name, orgNameOrId)
      ),
      inArray(organizationMembers.role, roles)
    ),
    with: {
      organization: true,
      user: true,
    },
  });
}

export async function updateMemberRole(
  organizationId: string,
  userId: string,
  role: OrganizationRole
) {
  await db
    .update(organizationMembers)
    .set({ role })
    .where(
      and(
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.organizationId, organizationId)
      )
    );
}

export async function removeMember(
  organizationId: string,
  userId: string,
  hardDelete = false
) {
  if (hardDelete) {
    return await db
      .delete(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, userId)
        )
      );
  }

  return await db
    .update(organizationMembers)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.userId, userId)
      )
    );
}
