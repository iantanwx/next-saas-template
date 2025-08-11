import { z } from 'zod';

export const todoSchema = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.number().int().nonnegative().optional(),
  updatedAt: z.number().int().nonnegative().optional(),
  deletedAt: z.number().int().nonnegative().nullable().optional(),
  title: z
    .string()
    .trim()
    .min(1, 'Todo title is required')
    .max(500, 'Todo title must be 500 characters or less'),
  description: z
    .string()
    .trim()
    .max(5000, 'Todo description must be 5000 characters or less')
    .optional()
    .default(''),
  completed: z.boolean().optional(),
  dueDate: z.number().int().nonnegative().nullable().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z
    .enum(['pending', 'in_progress', 'completed', 'cancelled'])
    .default('pending'),
  userId: z.string().uuid().optional(),
  organizationId: z.string().min(1, 'Organization ID is required'),
  version: z.string().optional(),
  lastEditedBy: z.string().uuid().optional(),
  lastEditedAt: z.number().int().nonnegative().optional(),
});

export const createTodoSchema = todoSchema.pick({
  title: true,
  description: true,
  priority: true,
  organizationId: true,
  dueDate: true,
});

export const updateTodoSchema = todoSchema.partial().extend({
  id: z.string().uuid(),
});

export type TodoSchema = z.infer<typeof todoSchema>;
export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
