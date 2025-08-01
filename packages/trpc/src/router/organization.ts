import * as crud from '@superscale/crud';
import { sendEmail } from '@superscale/email';
import { getInviteLink } from '@superscale/lib/auth';
import { getRole } from '@superscale/lib/auth/utils';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { adminProcedure, protectedProcedure, router } from '../trpc';

const existsSchema = z.object({
  nameOrSlug: z.string(),
});
const exists = protectedProcedure
  .input(existsSchema)
  .query(async ({ input }) => {
    const { nameOrSlug } = input;
    return await crud.organizations.exists(nameOrSlug);
  });

const createOrganizationSchema = z.object({
  organizationName: z.string(),
  userId: z.string(),
  completedOnboarding: z.boolean().optional(),
});
const create = protectedProcedure
  .input(createOrganizationSchema)
  .mutation(async ({ ctx, input }) => {
    return await crud.organizations.create(
      input.organizationName,
      input.userId,
      input.completedOnboarding
    );
  });

const deleteOrganizationSchema = z.object({
  organizationId: z.string(),
});
const softDelete = adminProcedure
  .input(deleteOrganizationSchema)
  .mutation(async ({ input }) => {
    const { organizationId } = input;
    await crud.organizations.softDelete(organizationId);
  });

const updateOrganizationSchema = z.object({
  organizationId: z.string(),
  name: z.string().optional(),
  slug: z.string().optional(),
});
const update = adminProcedure
  .input(updateOrganizationSchema)
  .mutation(async ({ input }) => {
    const { organizationId, name, slug } = input;
    const organization = await crud.organizations.getById(organizationId);
    if (!organization) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Organization not found',
      });
    }

    if (!name && !slug) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Must provide at least one field to update',
      });
    }

    if (organization.slug === slug && organization.id !== organizationId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Slug is already taken',
      });
    }

    if (organization.name === name && organization.id !== organizationId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Name is already taken',
      });
    }

    await crud.organizations.update(organizationId, name, slug);
  });

const inviteSchema = z.object({
  email: z.string().email(),
  organizationId: z.string(),
  role: z.enum(['admin', 'member']),
});
const invite = adminProcedure
  .input(inviteSchema)
  .mutation(async ({ ctx, input }) => {
    const { email, organizationId, role } = input;

    // if the user already exists and is associated with the organization, do nothing
    const user = await crud.users.findByEmail(email);
    if (user?.memberships.some((m) => m.organizationId === organizationId)) {
      return;
    }

    const invitation = await crud.invitations.findOrCreate(
      email,
      organizationId,
      role,
      ctx.user.id
    );
    await sendInvitationEmail(ctx.user.id, invitation, email);
  });

const acceptInvitationSchema = z.object({
  invitationId: z.string(),
});
const acceptInvitation = protectedProcedure
  .input(acceptInvitationSchema)
  .mutation(async ({ ctx, input }) => {
    const { invitationId } = input;
    await crud.invitations.accept(invitationId);
  });

const revokeInvitationSchema = acceptInvitationSchema;
const revokeInvitation = adminProcedure
  .input(revokeInvitationSchema)
  .mutation(async ({ ctx, input }) => {
    const { invitationId } = input;
    await crud.invitations.deleteById(invitationId);
  });

const resendInvitationSchema = acceptInvitationSchema;
const resendInvitation = adminProcedure
  .input(resendInvitationSchema)
  .mutation(async ({ ctx, input }) => {
    const { invitationId } = input;
    const invitation = await crud.invitations.findById(invitationId);
    if (!invitation) {
      return;
    }
    await sendInvitationEmail(ctx.user.id, invitation, invitation.email);
  });

const removeMemberSchema = z.object({
  organizationId: z.string(),
  userId: z.string(),
});
const removeMember = adminProcedure
  .input(removeMemberSchema)
  .mutation(async ({ ctx, input }) => {
    const { organizationId, userId } = input;
    if (userId === ctx.user.id) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'You cannot remove yourself from the organization',
      });
    }
    await crud.organizations.removeMember(organizationId, userId);
  });

const updateMemberRoleSchema = z.object({
  organizationId: z.string(),
  userId: z.string(),
  role: z.enum(['owner', 'admin', 'member']),
});
const updateMemberRole = adminProcedure
  .input(updateMemberRoleSchema)
  .mutation(async ({ ctx, input }) => {
    const { organizationId, userId, role: targetRole } = input;
    const member = await crud.organizations.getMemberById(
      organizationId,
      userId
    );
    if (!member) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User is not a member of this organization',
      });
    }

    if (member.role === targetRole) {
      return;
    }

    const currentUser = await crud.users.getById(ctx.user.id);
    const currentUserRole = getRole(currentUser, organizationId);

    // admins cannot change the role of owners
    if (
      currentUserRole === 'admin' &&
      (member.role === 'owner' || targetRole === 'owner')
    ) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Admins cannot change the role of owners',
      });
    }

    // if the downgrading from owner to non-owner, ensure there is at least one owner left
    if (member.role === 'owner' && targetRole !== 'owner') {
      const owners = await crud.organizations.getMembersByRole(
        organizationId,
        'owner'
      );
      if (owners.length === 1) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Organization must have at least one owner',
        });
      }
    }

    await crud.organizations.updateMemberRole(
      organizationId,
      userId,
      targetRole
    );
  });

const leaveOrganizationSchema = z.object({
  organizationId: z.string(),
});
const leaveOrganization = protectedProcedure
  .input(leaveOrganizationSchema)
  .mutation(async ({ ctx, input }) => {
    const { organizationId } = input;
    const membership = await crud.organizations.getMemberById(
      organizationId,
      ctx.user.id
    );
    if (!membership) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User is not a member of this organization',
      });
    }
    if (membership.role === 'owner') {
      const owners = await crud.organizations.getMembersByRole(
        organizationId,
        'owner'
      );
      if (owners.length === 1) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Sole Owner cannot leave an organization',
        });
      }
    }
    await crud.organizations.removeMember(organizationId, ctx.user.id, true);
  });

async function sendInvitationEmail(
  senderUserId: string,
  invitation: crud.invitations.InvitationWithOrgAndInviter,
  email: string
) {
  const inviter = await crud.users.getById(senderUserId);
  const link = await getInviteLink(invitation);
  await sendEmail(
    'notifications@transactional.superscale.app',
    email,
    `You have been invited to join ${invitation.organization.name} on Superscale`,
    'invitation',
    {
      link,
      organizationName: invitation.organization.name,
      inviterName: inviter.name!!,
      inviterEmail: inviter.email!!,
    }
  );
}

export default router({
  create,
  update,
  exists,
  softDelete,
  removeMember,
  updateMemberRole,
  leaveOrganization,
  invite,
  acceptInvitation,
  revokeInvitation,
  resendInvitation,
});
