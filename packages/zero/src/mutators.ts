import type { CustomMutatorDefs, Transaction } from '@rocicorp/zero';
import { assertCanWriteTodo, assertOrgMember, ensureUser } from './auth';
import type { AuthData, Schema } from './schema';
import { validators } from '@superscale/crud';

// Input types for our mutators
export interface CreateTodoInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  organizationId: string;
  dueDate?: string; // ISO string date
  estimatedHours?: number;
  assignedUserId?: string;
}

export interface UpdateTodoInput {
  id: string;
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: string; // ISO string date
  estimatedHours?: number;
  assignedUserId?: string;
  completed?: boolean;
}

export interface DeleteTodoInput {
  id: string;
}

export interface AddTagToTodoInput {
  todoId: string;
  tagName: string;
  organizationId: string;
}

export interface RemoveTagFromTodoInput {
  todoId: string;
  tagId: string;
}

// Helper functions for validation
function validateAuthUser(authData?: AuthData): string {
  return ensureUser(authData as AuthData);
}

function setStatusFields(
  updateData: Record<string, unknown>,
  status: string,
  completed?: boolean
): void {
  updateData.status = status;
  if (status === 'completed' && completed !== false) {
    updateData.completed = true;
  } else if (status !== 'completed') {
    updateData.completed = false;
  } else if (completed !== undefined) {
    updateData.completed = completed;
  }
}

function buildUpdateData(
  input: UpdateTodoInput,
  userId: string
): Record<string, unknown> {
  const now = Date.now();
  const updateData: Record<string, unknown> = {
    updatedAt: now,
    lastEditedAt: now,
    lastEditedBy: userId,
  };

  if (input.title !== undefined) {
    updateData.title = input.title.trim();
  }
  if (input.description !== undefined) {
    updateData.description = input.description.trim();
  }
  if (input.priority !== undefined) {
    updateData.priority = input.priority;
  }
  if (input.status !== undefined) {
    setStatusFields(updateData, input.status, input.completed);
  }
  if (input.dueDate !== undefined) {
    updateData.dueDate =
      typeof input.dueDate === 'string'
        ? input.dueDate
          ? new Date(input.dueDate).getTime()
          : null
        : (input.dueDate as unknown as number | null);
  }
  if (input.estimatedHours !== undefined) {
    updateData.estimatedHours = input.estimatedHours;
  }
  if (input.assignedUserId !== undefined) {
    updateData.assignedUserId = input.assignedUserId;
  }
  if (input.completed !== undefined) {
    updateData.completed = input.completed;
  }

  return updateData;
}

/**
 * Client-side mutators for todos using Zero's custom mutator API
 * These run immediately on the client for optimistic updates
 */
export function createMutators(authData?: AuthData) {
  return {
    todo: {
      /**
       * Create a new todo
       */
      create: async (tx: Transaction<Schema>, input: CreateTodoInput) => {
        const userId = validateAuthUser(authData);
        const parsedCreate = validators.todo.createTodoInputSchema.parse(input);

        if (!input.organizationId) {
          throw new Error('Organization ID is required');
        }

        await assertOrgMember(tx, userId, parsedCreate.organizationId);

        const now = Date.now();
        const todoId = crypto.randomUUID();

        await tx.mutate.todos.insert({
          id: todoId,
          title: parsedCreate.title,
          description: parsedCreate.description ?? '',
          priority: parsedCreate.priority || 'medium',
          status: 'pending',
          organizationId: parsedCreate.organizationId,
          userId,
          dueDate: parsedCreate.dueDate ?? null,
          createdAt: now,
          updatedAt: now,
          lastEditedAt: now,
          lastEditedBy: userId,
          completed: false,
        });
      },

      /**
       * Update an existing todo
       */
      update: async (tx: Transaction<Schema>, input: UpdateTodoInput) => {
        const userId = validateAuthUser(authData);

        if (!input.id) {
          throw new Error('Todo ID is required');
        }

        await assertCanWriteTodo(tx, userId, input.id);

        // Validate/normalize fields via Zod
        const parsed = validators.todo.updateTodoInputSchema.parse(input);
        const updateData = buildUpdateData(parsed, userId);

        await tx.mutate.todos.update({
          id: input.id,
          ...updateData,
        });
      },

      /**
       * Soft delete a todo
       */
      delete: async (tx: Transaction<Schema>, input: DeleteTodoInput) => {
        const userId = validateAuthUser(authData);

        if (!input.id) {
          throw new Error('Todo ID is required');
        }

        await assertCanWriteTodo(tx, userId, input.id);

        const now = Date.now();
        await tx.mutate.todos.update({
          id: input.id,
          deletedAt: now,
          updatedAt: now,
          lastEditedAt: now,
          lastEditedBy: userId,
        });
      },

      /**
       * Add a tag to a todo
       */
      addTag: async (tx: Transaction<Schema>, input: AddTagToTodoInput) => {
        const userId = validateAuthUser(authData);

        if (!input.todoId || !input.tagName || !input.organizationId) {
          throw new Error(
            'Todo ID, tag name, and organization ID are required'
          );
        }

        if (input.tagName.length > 50) {
          throw new Error('Tag name must be 50 characters or less');
        }

        await assertOrgMember(tx, userId, input.organizationId);

        const todoRow = await tx.query.todos.where('id', input.todoId).one();
        if (!todoRow) throw new Error('Todo not found');
        if (todoRow.organizationId !== input.organizationId) {
          throw new Error('Forbidden: mismatched organization');
        }
        await assertCanWriteTodo(tx, userId, input.todoId);

        const tagId = crypto.randomUUID();
        const todoTagId = crypto.randomUUID();
        const now = Date.now();

        // Create the tag (optimistic - server will handle find-or-create)
        await tx.mutate.tags.insert({
          id: tagId,
          name: input.tagName.trim(),
          organizationId: input.organizationId,
          createdAt: now,
          updatedAt: now,
        });

        // Create the todo-tag relationship
        await tx.mutate.todoTags.insert({
          id: todoTagId,
          todoId: input.todoId,
          tagId: tagId,
          createdAt: now,
        });
      },

      /**
       * Remove a tag from a todo
       */
      removeTag: async (
        tx: Transaction<Schema>,
        input: RemoveTagFromTodoInput
      ) => {
        const userId = validateAuthUser(authData);

        if (!input.todoId || !input.tagId) {
          throw new Error('Todo ID and tag ID are required');
        }

        await assertCanWriteTodo(tx, userId, input.todoId);

        const todoTag = await tx.query.todoTags
          .where('todoId', input.todoId)
          .where('tagId', input.tagId)
          .one();
        if (!todoTag) return;

        await tx.mutate.todoTags.delete({ id: todoTag.id });
      },
    },
  } as const satisfies CustomMutatorDefs<Schema>;
}
