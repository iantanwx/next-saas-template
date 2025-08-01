import { eq } from 'drizzle-orm';
import { users } from '.';
import { db } from './db/connection';
import { organizationMembers, userInvitations } from './db/schema';
import type { OrganizationRole } from './organization';

export type InvitationWithOrgAndInviter = Awaited<ReturnType<typeof findById>>;

export async function findOrCreate(
  email: string,
  organizationId: string,
  role: OrganizationRole,
  createdById: string
) {
  const result = await db
    .insert(userInvitations)
    .values({
      email,
      organizationId,
      createdById,
      role,
    })
    .onConflictDoUpdate({
      target: [userInvitations.email, userInvitations.organizationId],
      set: { role: role },
    })
    .returning({ id: userInvitations.id });

  const { id } = result[0]!;
  return await findById(id);
}

export async function findById(id: string) {
  const invitation = await db.query.userInvitations.findFirst({
    where: eq(userInvitations.id, id),
    with: {
      createdBy: true,
      organization: true,
    },
  });
  if (!invitation) {
    throw new Error('Invitation not found');
  }
  return invitation;
}

export async function accept(invitationId: string) {
  const invitation = await findById(invitationId);
  if (!invitation) {
    throw new Error('Invitation not found');
  }
  const invitee = await users.findByEmail(invitation.email);
  if (!invitee) {
    throw new Error('Invitee not found');
  }

  await db.transaction(async (tx) => {
    await tx.insert(organizationMembers).values({
      userId: invitee.id,
      organizationId: invitation.organizationId,
      role: invitation.role,
    });
    await tx
      .delete(userInvitations)
      .where(eq(userInvitations.id, invitationId));
  });
}

export async function listByOrganization(organizationId: string) {
  return await db.query.userInvitations.findMany({
    where: eq(userInvitations.organizationId, organizationId),
    with: {
      organization: true,
      createdBy: true,
    },
  });
}

export async function deleteById(id: string) {
  await db.delete(userInvitations).where(eq(userInvitations.id, id));
}
