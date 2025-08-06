import { todos, todoPriority, todoStatus } from '@superscale/crud';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { memberProcedure, protectedProcedure, router } from '../trpc';

// Zod validation schemas - exported for reuse
export const createTodoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be 255 characters or less'),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  priority: z.enum(todoPriority.enumValues).default('medium'),
  status: z.enum(todoStatus.enumValues).default('pending'),
  tags: z.array(z.string()).default([]),
  organizationId: z.string().min(1, 'Organization ID is required'),
});

export const updateTodoSchema = z.object({
  id: z.string().min(1, 'Todo ID is required'),
  title: z.string().min(1, 'Title is required').max(255, 'Title must be 255 characters or less').optional(),
  description: z.string().optional(),
  dueDate: z.date().nullable().optional(),
  priority: z.enum(todoPriority.enumValues).optional(),
  status: z.enum(todoStatus.enumValues).optional(),
  tags: z.array(z.string()).optional(),
  completed: z.boolean().optional(),
  version: z.string().min(1, 'Version is required'),
});

export const todoIdSchema = z.object({
  id: z.string().min(1, 'Todo ID is required'),
});

export const todosByOrganizationSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  limit: z.number().min(1).max(100).default(50),
  cursor: z.string().optional(),
});

export const todosByStatusSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  status: z.enum(todoStatus.enumValues),
});

const filteredTodosSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  completed: z.boolean().optional(),
  status: z.enum(todoStatus.enumValues).optional(),
  priority: z.enum(todoPriority.enumValues).optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'dueDate', 'title', 'priority']).default('updatedAt'),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().min(1).max(100).default(50),
  cursor: z.string().optional(),
});

const batchUpdateSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'At least one todo ID is required').max(50, 'Cannot update more than 50 todos at once'),
  organizationId: z.string().min(1, 'Organization ID is required'),
  data: z.object({
    completed: z.boolean().optional(),
    status: z.enum(todoStatus.enumValues).optional(),
    priority: z.enum(todoPriority.enumValues).optional(),
  }).refine(data => Object.keys(data).length > 0, 'At least one field must be provided for update'),
});

const batchDeleteSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'At least one todo ID is required').max(50, 'Cannot delete more than 50 todos at once'),
  organizationId: z.string().min(1, 'Organization ID is required'),
});

const updateStatusSchema = z.object({
  id: z.string().min(1, 'Todo ID is required'),
  status: z.enum(todoStatus.enumValues),
  version: z.string().min(1, 'Version is required'),
});

const updatePrioritySchema = z.object({
  id: z.string().min(1, 'Todo ID is required'),
  priority: z.enum(todoPriority.enumValues),
  version: z.string().min(1, 'Version is required'),
});

const tagManagementSchema = z.object({
  id: z.string().min(1, 'Todo ID is required'),
  tag: z.string().min(1, 'Tag is required').max(50, 'Tag must be 50 characters or less'),
  version: z.string().min(1, 'Version is required'),
});

const deleteSchema = z.object({
  id: z.string().min(1, 'Todo ID is required'),
  version: z.string().min(1, 'Version is required'),
});

const statsSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
});

// Helper function to verify user access to todo
async function verifyTodoAccess(todoId: string, userId: string, organizationId?: string) {
  const todo = await todos.findById(todoId);
  
  if (!todo) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Todo not found',
    });
  }

  // Check if user has access to this todo (either owns it or is in the same organization)
  if (todo.userId !== userId && (!organizationId || todo.organizationId !== organizationId)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not have permission to access this todo',
    });
  }

  return todo;
}

// Create Todo Handler
const createTodoHandler = memberProcedure
  .input(createTodoSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      const todo = await todos.create({
        ...input,
        userId: ctx.user.id,
        organizationId: input.organizationId,
      });

      return todo;
    } catch (error) {
      console.error('Error creating todo:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create todo',
      });
    }
  });

// Get Todo by ID Handler
const getTodoByIdHandler = protectedProcedure
  .input(todoIdSchema)
  .query(async ({ ctx, input }) => {
    try {
      const todo = await verifyTodoAccess(input.id, ctx.user.id);
      return todo;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error fetching todo:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch todo',
      });
    }
  });

// Get Todos by Organization Handler
const getTodosByOrganizationHandler = memberProcedure
  .input(todosByOrganizationSchema)
  .query(async ({ ctx, input }) => {
    try {
      const todosList = await todos.findByOrganization(input.organizationId);
      
      // Apply pagination
      const startIndex = input.cursor ? todosList.findIndex(t => t.id === input.cursor) + 1 : 0;
      const paginatedTodos = todosList.slice(startIndex, startIndex + input.limit);
      
      const nextCursor = paginatedTodos.length === input.limit ? paginatedTodos[paginatedTodos.length - 1]?.id : undefined;

      return {
        todos: paginatedTodos,
        nextCursor,
      };
    } catch (error) {
      console.error('Error fetching todos by organization:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch todos',
      });
    }
  });

// Get Todos by User Handler
const getTodosByUserHandler = protectedProcedure
  .input(todosByOrganizationSchema)
  .query(async ({ ctx, input }) => {
    try {
      const todosList = await todos.findByUser(ctx.user.id, input.organizationId);
      
      // Apply pagination
      const startIndex = input.cursor ? todosList.findIndex(t => t.id === input.cursor) + 1 : 0;
      const paginatedTodos = todosList.slice(startIndex, startIndex + input.limit);
      
      const nextCursor = paginatedTodos.length === input.limit ? paginatedTodos[paginatedTodos.length - 1]?.id : undefined;

      return {
        todos: paginatedTodos,
        nextCursor,
      };
    } catch (error) {
      console.error('Error fetching todos by user:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch todos',
      });
    }
  });

// Get Todos by Status Handler
const getTodosByStatusHandler = memberProcedure
  .input(todosByStatusSchema)
  .query(async ({ ctx, input }) => {
    try {
      const todosList = await todos.findByStatus(input.organizationId, input.status);
      return todosList;
    } catch (error) {
      console.error('Error fetching todos by status:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch todos',
      });
    }
  });

// Update Todo Handler
const updateTodoHandler = protectedProcedure
  .input(updateTodoSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      // Verify access to the todo
      await verifyTodoAccess(input.id, ctx.user.id);

      const { id, version, ...updateData } = input;
      const updatedTodo = await todos.update(id, updateData, version, ctx.user.id);

      return updatedTodo;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error updating todo:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update todo',
      });
    }
  });

// Update Todo Status Handler
const updateTodoStatusHandler = protectedProcedure
  .input(updateStatusSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      // Verify access to the todo
      await verifyTodoAccess(input.id, ctx.user.id);

      const updatedTodo = await todos.updateStatus(input.id, input.status, input.version, ctx.user.id);
      return updatedTodo;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error updating todo status:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update todo status',
      });
    }
  });

// Update Todo Priority Handler
const updateTodoPriorityHandler = protectedProcedure
  .input(updatePrioritySchema)
  .mutation(async ({ ctx, input }) => {
    try {
      // Verify access to the todo
      await verifyTodoAccess(input.id, ctx.user.id);

      const updatedTodo = await todos.updatePriority(input.id, input.priority, input.version, ctx.user.id);
      return updatedTodo;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error updating todo priority:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update todo priority',
      });
    }
  });

// Add Tag Handler
const addTagHandler = protectedProcedure
  .input(tagManagementSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      // Verify access to the todo
      await verifyTodoAccess(input.id, ctx.user.id);

      const updatedTodo = await todos.addTag(input.id, input.tag, input.version, ctx.user.id);
      return updatedTodo;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error adding tag to todo:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to add tag to todo',
      });
    }
  });

// Remove Tag Handler
const removeTagHandler = protectedProcedure
  .input(tagManagementSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      // Verify access to the todo
      await verifyTodoAccess(input.id, ctx.user.id);

      const updatedTodo = await todos.removeTag(input.id, input.tag, input.version, ctx.user.id);
      return updatedTodo;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error removing tag from todo:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to remove tag from todo',
      });
    }
  });

// Delete Todo Handler
const deleteTodoHandler = protectedProcedure
  .input(deleteSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      // Verify access to the todo
      await verifyTodoAccess(input.id, ctx.user.id);

      await todos.softDelete(input.id, input.version, ctx.user.id);
      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error deleting todo:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete todo',
      });
    }
  });

// Get Todo Stats Handler
const getTodoStatsHandler = memberProcedure
  .input(statsSchema)
  .query(async ({ ctx, input }) => {
    try {
      const stats = await todos.getStats(input.organizationId);
      return stats;
    } catch (error) {
      console.error('Error fetching todo stats:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch todo statistics',
      });
    }
  });

export default router({
  // CRUD Operations
  create: createTodoHandler,
  getById: getTodoByIdHandler,
  getByOrganization: getTodosByOrganizationHandler,
  getByUser: getTodosByUserHandler,
  getByStatus: getTodosByStatusHandler,
  update: updateTodoHandler,
  delete: deleteTodoHandler,

  // Status and Priority Management
  updateStatus: updateTodoStatusHandler,
  updatePriority: updateTodoPriorityHandler,

  // Tag Management
  addTag: addTagHandler,
  removeTag: removeTagHandler,

  // Statistics
  getStats: getTodoStatsHandler,
});