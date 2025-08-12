'use client';

import { useQuery, useZero } from '@rocicorp/zero/react';
import type { UserWithMemberships } from '@superscale/crud/types';
import type { Mutators, Schema } from '@superscale/zero';
import { useMemo } from 'react';
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

function TodoListContainer({
  userId,
  organizationId,
}: {
  userId: string;
  organizationId: string;
}) {
  // Zero live query (filter by org and user to preserve existing semantics)
  const z = useZero<Schema, Mutators>();
  const query = useMemo(
    () =>
      z.query.todos
        .related('todoTags', (q) => q.related('tag'))
        .where('organizationId', organizationId)
        .where('userId', userId)
        .where('deletedAt', 'IS', null)
        .orderBy('updatedAt', 'desc'),
    [z, organizationId, userId]
  );
  const [zeroTodos] = useQuery(query);
  type ZeroTodoWithRelations = {
    id: string;
    title: string;
    description?: string | null;
    completed?: boolean | null;
    priority?: 'low' | 'medium' | 'high' | null;
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled' | null;
    dueDate?: number | null;
    createdAt?: number | null;
    updatedAt?: number | null;
    version?: string | null;
    todoTags?: Array<{ tag?: { name?: string | null } | null }>;
  };
  const tasks = (zeroTodos as unknown as ZeroTodoWithRelations[]).map<Task>(
    (r) => ({
      id: r.id,
      title: r.title,
      notes: r.description ?? '',
      completed: Boolean(r.completed),
      priority: (r.priority ?? 'medium') as 'low' | 'medium' | 'high',
      status: (r.status ?? 'pending') as
        | 'pending'
        | 'in_progress'
        | 'completed'
        | 'cancelled',
      tags: (r.todoTags ?? [])
        .map((tt) => tt?.tag?.name)
        .filter((n: unknown): n is string => typeof n === 'string'),
      dueDate: r.dueDate ? new Date(r.dueDate).toISOString() : null,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : null,
      version: r.version ?? '1',
    })
  );

  async function onAdd(values: TaskFormValues) {
    const title = values.title.trim();
    if (!title) return;
    const tagIds = await resolveTagIds(values.tags, organizationId, z);
    z.mutate.todo.create({
      title,
      description: values.notes.trim() || undefined,
      priority: values.priority,
      dueDate: values.dueDate ? values.dueDate.getTime() : undefined,
      organizationId,
      tagIds,
    });
  }

  async function onEdit(task: Task, values: TaskFormValues) {
    const row = tasks.find((r) => r.id === task.id);
    if (!row) return;
    const tagIds = await resolveTagIds(values.tags, organizationId, z);
    z.mutate.todo.update({
      id: task.id,
      title: values.title.trim(),
      description: values.notes.trim() || undefined,
      priority: values.priority,
      dueDate: values.dueDate ? values.dueDate.getTime() : undefined,
      completed: task.completed,
      status: task.completed ? 'completed' : 'pending',
      tagIds,
    });
  }

  function onToggle(id: string, checked: boolean) {
    const row = tasks.find((r) => r.id === id);
    if (!row) return;
    z.mutate.todo.update({
      id,
      completed: checked,
      status: checked ? 'completed' : 'pending',
    });
  }

  function onDelete(id: string) {
    const row = tasks.find((r) => r.id === id);
    if (!row) return;
    z.mutate.todo.delete({ id });
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <TodoList
        tasks={tasks}
        onAdd={onAdd}
        onEdit={onEdit}
        onToggle={onToggle}
        onDelete={onDelete}
        organizationId={organizationId}
      />
    </div>
  );
}

async function resolveTagIds(
  names: string[],
  organizationId: string,
  z: ReturnType<typeof useZero<Schema, Mutators>>
): Promise<string[]> {
  const trimmed = Array.from(
    new Set(names.map((n) => n.trim()).filter(Boolean))
  );
  const existing = await z.query.tags
    .where('organizationId', organizationId)
    .run();
  const byName = new Map(existing.map((t) => [t.name.toLowerCase(), t]));
  const ids: string[] = [];
  for (const name of trimmed) {
    const lower = name.toLowerCase();
    const found = byName.get(lower);
    if (found) {
      ids.push(found.id);
    } else {
      const write = z.mutate.tags.create({ name, organizationId });
      await write.server;
      const latest = await z.query.tags
        .where('organizationId', organizationId)
        .where('name', name)
        .one();
      if (latest) ids.push(latest.id);
    }
  }
  return ids;
}
