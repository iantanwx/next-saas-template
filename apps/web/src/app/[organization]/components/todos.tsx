'use client';

import { useQuery, useZero } from '@rocicorp/zero/react';
import type { UserWithMemberships } from '@superscale/crud/types';
import { t } from '@superscale/trpc/client';
import type { Schema, Todo as ZTodo } from '@superscale/zero';
import { useCallback, useMemo } from 'react';
import type { TaskFormValues } from './todo-form';
import type { Task } from './todo-item';
import TodoList from './todo-list';

type Props = {
  user: UserWithMemberships;
};

export function Todos({ user }: Props) {
  const userId = user.id;
  const organizationId = user.memberships?.[0]?.organization.id;

  if (!organizationId) {
    return (
      <div className="p-4 text-muted-foreground text-sm">
        No organization found. Join or create one to sync todos.
      </div>
    );
  }

  return <TodoListContainer userId={userId} organizationId={organizationId} />;
}

type TodoRow = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date: string | null;
  // TODO: Re-add tags support with new schema after Zero migration
  // tags: string[] | null;
  created_at: string | null;
  updated_at: string | null;
  version: string;
};

function TodoListContainer({
  userId,
  organizationId,
}: {
  userId: string;
  organizationId: string;
}) {
  // Zero live query (filter by org and user to preserve existing semantics)
  const z = useZero<Schema>();
  const query = useMemo(
    () =>
      z.query.todos
        .where('organizationId', organizationId)
        .where('userId', userId)
        .where('deletedAt', 'IS', null)
        .orderBy('updatedAt', 'desc'),
    [z, organizationId, userId]
  );
  const [zeroTodos] = useQuery(query);

  const rows: TodoRow[] = useMemo(() => {
    const arr = (zeroTodos ?? []) as readonly ZTodo[];
    return arr.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description ?? null,
      completed: Boolean(r.completed),
      priority: (r.priority ?? 'medium') as 'low' | 'medium' | 'high',
      status: (r.status ?? 'pending') as
        | 'pending'
        | 'in_progress'
        | 'completed'
        | 'cancelled',
      due_date: r.dueDate ? new Date(r.dueDate).toISOString() : null,
      created_at: r.createdAt ? new Date(r.createdAt).toISOString() : null,
      updated_at: r.updatedAt ? new Date(r.updatedAt).toISOString() : null,
      version: r.version ?? '1',
    }));
  }, [zeroTodos]);

  // Mutations
  const createMutation = t.todo.create.useMutation();
  const updateMutation = t.todo.update.useMutation();
  const deleteMutation = t.todo.delete.useMutation();

  const mappedTasks: Task[] = useMemo(
    () =>
      rows.map((r) => ({
        id: r.id,
        title: r.title,
        notes: r.description ?? '',
        completed: Boolean(r.completed),
        priority: r.priority,
        dueDate: r.due_date,
        tags: [], // TODO: Fetch tags separately after Zero migration
        createdAt: r.created_at ?? new Date().toISOString(),
        updatedAt: r.updated_at ?? new Date().toISOString(),
      })),
    [rows]
  );

  const onAdd = useCallback(
    async (values: TaskFormValues) => {
      const title = values.title.trim();
      if (!title) return;
      await createMutation.mutateAsync({
        title,
        description: values.notes.trim() || undefined,
        priority: values.priority,
        dueDate: values.dueDate ?? undefined,
        // TODO: Re-implement tags with new schema after Zero migration
        // tags: values.tags,
        organizationId,
      });
    },
    [createMutation, organizationId]
  );

  const onEdit = useCallback(
    async (task: Task, values: TaskFormValues) => {
      const row = rows.find((r) => r.id === task.id);
      if (!row) return;
      await updateMutation.mutateAsync({
        id: task.id,
        title: values.title.trim(),
        description: values.notes.trim() || undefined,
        priority: values.priority,
        dueDate: values.dueDate ?? null,
        // TODO: Re-implement tags with new schema after Zero migration
        // tags: values.tags,
        completed: task.completed,
        status: task.completed ? 'completed' : 'pending',
        version: row.version,
      });
    },
    [rows, updateMutation]
  );

  const onToggle = useCallback(
    async (id: string, checked: boolean) => {
      const row = rows.find((r) => r.id === id);
      if (!row) return;
      await updateMutation.mutateAsync({
        id,
        completed: checked,
        status: checked ? 'completed' : 'pending',
        version: row.version,
      });
    },
    [rows, updateMutation]
  );

  const onDelete = useCallback(
    async (id: string) => {
      const row = rows.find((r) => r.id === id);
      if (!row) return;
      await deleteMutation.mutateAsync({ id, version: row.version });
    },
    [rows, deleteMutation]
  );

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <TodoList
        tasks={mappedTasks}
        onAdd={onAdd}
        onEdit={onEdit}
        onToggle={onToggle}
        onDelete={onDelete}
      />
    </div>
  );
}
