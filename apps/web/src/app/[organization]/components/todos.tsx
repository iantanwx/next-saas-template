'use client';

import { useLiveQuery } from '@electric-sql/pglite-react';
import type { UserWithMemberships } from '@superscale/crud/types';
import { usePGlite } from '@superscale/pglite';
import { DBStatus } from '@superscale/pglite/provider';
import { t } from '@superscale/trpc/client';
import { Button } from '@superscale/ui/components/button';
import { Input } from '@superscale/ui/components/input';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@superscale/ui/components/table';
import { useCallback, useMemo, useState } from 'react';

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

  return <TodoList userId={userId} organizationId={organizationId} />;
}

type TodoRow = {
  id: string;
  title: string;
  completed: boolean;
  priority: string;
  status: string;
  created_at: string | null;
};

function TodoList({
  userId,
  organizationId,
}: {
  userId: string;
  organizationId: string;
}) {
  const [newTitle, setNewTitle] = useState('');

  const query = `SELECT id, title, completed, priority, status, created_at FROM todos
         WHERE user_id = '${userId}' AND organization_id = '${organizationId}'
         ORDER BY created_at DESC`;
  const todos = useLiveQuery(query);

  const rows: TodoRow[] = useMemo(() => {
    if (!todos) return [];
    const possible = todos as unknown as TodoRow[] | { rows?: TodoRow[] };
    return Array.isArray(possible) ? possible : (possible.rows ?? []);
  }, [todos]);

  const createMutation = t.todo.create.useMutation();

  const onAdd = useCallback(async () => {
    const title = newTitle.trim();
    if (!title) return;
    try {
      await createMutation.mutateAsync({ title, organizationId });
      setNewTitle('');
    } catch (_) {}
  }, [createMutation, newTitle, organizationId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          value={newTitle}
          placeholder="Add a todo title…"
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onAdd();
          }}
        />
        <Button
          onClick={onAdd}
          disabled={!newTitle.trim() || createMutation.isPending}
        >
          {createMutation.isPending ? 'Adding…' : 'Add'}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Completed</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((t) => (
            <TableRow key={t.id}>
              <TableCell>{t.title}</TableCell>
              <TableCell className="capitalize">{t.status}</TableCell>
              <TableCell className="capitalize">{t.priority}</TableCell>
              <TableCell>{t.completed ? 'Yes' : 'No'}</TableCell>
              <TableCell>
                {t.created_at ? new Date(t.created_at).toLocaleString() : ''}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableCaption>
          Live synced with Electric SQL (local-first via PGlite)
        </TableCaption>
      </Table>
    </div>
  );
}
