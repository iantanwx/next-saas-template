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
        .where('organizationId', organizationId)
        .where('userId', userId)
        .where('deletedAt', 'IS', null)
        .orderBy('updatedAt', 'desc'),
    [z, organizationId, userId]
  );
  const [zeroTodos] = useQuery(query);
  const tasks = zeroTodos.map<Task>((r) => ({
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
    tags: [], // TODO: Fetch tags separately after Zero migration
    dueDate: r.dueDate ? new Date(r.dueDate).toISOString() : null,
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
    updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : null,
    version: r.version ?? '1',
  }));

  function onAdd(values: TaskFormValues) {
    const title = values.title.trim();
    if (!title) return;
    z.mutate.todo.create({
      title,
      description: values.notes.trim() || undefined,
      priority: values.priority,
      dueDate: values.dueDate ? values.dueDate.getTime() : undefined,
      organizationId,
    });
  }

  function onEdit(task: Task, values: TaskFormValues) {
    const row = tasks.find((r) => r.id === task.id);
    if (!row) return;
    z.mutate.todo.update({
      id: task.id,
      title: values.title.trim(),
      description: values.notes.trim() || undefined,
      priority: values.priority,
      dueDate: values.dueDate ? values.dueDate.getTime() : undefined,
      completed: task.completed,
      status: task.completed ? 'completed' : 'pending',
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
      />
    </div>
  );
}
