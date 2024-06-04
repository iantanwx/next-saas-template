import { users } from '@superscale/crud';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

const updateUserSchema = z.object({
  name: z.string().nullable(),
});

const updateUserHandler = protectedProcedure
  .input(updateUserSchema)
  .mutation(async ({ ctx, input }) => {
    await users.update(ctx.user.id, input);
  });

export default router({
  update: updateUserHandler,
});
