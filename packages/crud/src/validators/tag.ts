import { z } from 'zod';

export const tagSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(50),
  color: z.string().trim().max(20).optional(),
  organizationId: z.string().min(1),
  createdAt: z.number().int().nonnegative().optional(),
  updatedAt: z.number().int().nonnegative().optional(),
  deletedAt: z.number().int().nonnegative().nullable().optional(),
});

export const createTagSchema = tagSchema.pick({
  name: true,
  color: true,
  organizationId: true,
});

export const updateTagSchema = tagSchema.partial().extend({ id: z.string() });

export type TagSchema = z.infer<typeof tagSchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
