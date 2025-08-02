import { organizations } from '@superscale/crud';
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { z } from 'zod';
import type { TrpcContext } from './context';

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;

const authMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  // ensure that user is non-null, only for typing purposes
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const protectedProcedure = t.procedure.use(authMiddleware);

const OrganizationInput = z.object({ organizationId: z.string() });

export const memberProcedure = protectedProcedure
  .input(OrganizationInput)
  .use(async ({ next, ctx, input, ...rest }) => {
    const { organizationId } = input;
    const { user } = ctx;
    const organization = await organizations.getMemberById(
      organizationId,
      user.id
    );
    if (!organization) throw new TRPCError({ code: 'UNAUTHORIZED' });

    return next({ ...rest, ctx: { ...ctx, organization } });
  });

export const adminProcedure = protectedProcedure
  .input(OrganizationInput)
  .use(async ({ next, ctx, input, ...rest }) => {
    const { organizationId } = input;
    const { user } = ctx;
    try {
      const membership = await organizations.getMemberById(
        organizationId,
        user.id
      );
      if (
        !membership ||
        (membership.role !== 'owner' && membership.role !== 'admin')
      ) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      return next({
        ...rest,
        ctx: { ...ctx, organization: membership.organization },
      });
    } catch (err) {
      console.error('Error in adminProcedure: ', err);
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
    }
  });
