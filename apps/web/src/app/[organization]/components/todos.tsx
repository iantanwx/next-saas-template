'use client';

import { useLiveQuery } from '@electric-sql/pglite-react';
import type { UserWithMemberships } from '@superscale/crud/types';
import { usePGlite } from '@superscale/pglite';
import { DBStatus } from '@superscale/pglite/provider';
import { t } from '@superscale/trpc/client';
import { useCallback, useMemo } from 'react';
import TodoList from './todo-list';
import type { TaskFormValues } from './todo-form';
import type { Task } from './todo-item';

type Props = {
  user: UserWithMemberships;
};

export function Todos({ user }: Props) {
  const { status } = usePGlite();

  const userId = user.id;
  const organizationId = user.memberships?.[0]?.organization.id;

  if (status !== DBStatus.Ready) {
    return (
      <div className="p-4 text-muted-foreground text-sm">
        Initializing local DB…
      </div>
    );
  }

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
  // Live query to keep UI synced
  const query = `SELECT id, title, description, completed, priority, status, due_date, created_at, updated_at, version
          FROM todos WHERE user_id = '${userId}' AND organization_id = '${organizationId}'
          AND deleted_at IS NULL
          ORDER BY updated_at DESC`;
  const live = useLiveQuery(query);

  const rows: TodoRow[] = useMemo(() => {
    if (!live) return [];
    const possible = live as unknown as TodoRow[] | { rows?: TodoRow[] };
    return Array.isArray(possible) ? possible : (possible.rows ?? []);
  }, [live]);

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
