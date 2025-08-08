'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@superscale/ui/components/card';
import { Button } from '@superscale/ui/components/button';
import { Input } from '@superscale/ui/components/input';
import { Label } from '@superscale/ui/components/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@superscale/ui/components/select';
import { Separator } from '@superscale/ui/components/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@superscale/ui/components/alert-dialog';
import { Plus, Search, Trash2 } from 'lucide-react';
import TaskForm, { type TaskFormValues } from './todo-form';
import TaskItem, { type Task } from './todo-item';
import type { Priority } from './todo-form';

type StatusFilter = 'all' | 'active' | 'completed';
type PriorityFilter = 'all' | 'low' | 'medium' | 'high';
type SortKey = 'createdAt' | 'dueDate' | 'priority' | 'title';
type SortDir = 'asc' | 'desc';

export default function TodoList({
  tasks,
  onAdd,
  onEdit,
  onToggle,
  onDelete,
}: {
  tasks: Task[];
  onAdd: (values: TaskFormValues) => void;
  onEdit: (task: Task, values: TaskFormValues) => void;
  onToggle: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  // Keep local working copy in sync for filtering/sorting without re-computing parent array
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    const out = localTasks.filter((t) => {
      const matchQ =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.notes ?? '').toLowerCase().includes(q) ||
        (t.tags ?? []).some((tag) => tag.toLowerCase().includes(q));
      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
            ? !t.completed
            : t.completed;
      const matchPriority =
        priorityFilter === 'all'
          ? true
          : t.priority === (priorityFilter as Priority);
      return matchQ && matchStatus && matchPriority;
    });

    out.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortKey) {
        case 'createdAt':
          return (
            (new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime()) *
            dir
          );
        case 'dueDate': {
          const ad = a.dueDate
            ? new Date(a.dueDate).getTime()
            : Number.POSITIVE_INFINITY;
          const bd = b.dueDate
            ? new Date(b.dueDate).getTime()
            : Number.POSITIVE_INFINITY;
          return (ad - bd) * dir;
        }
        case 'priority': {
          const order: Record<Priority, number> = {
            low: 0,
            medium: 1,
            high: 2,
          };
          return (order[a.priority] - order[b.priority]) * dir;
        }
        case 'title':
          return a.title.localeCompare(b.title) * dir;
        default:
          return 0;
      }
    });

    return out;
  }, [localTasks, search, statusFilter, priorityFilter, sortKey, sortDir]);

  function handleAdd(values: TaskFormValues) {
    onAdd(values);
    setAddOpen(false);
  }

  function handleEdit(values: TaskFormValues) {
    if (!editingTask) return;
    onEdit(editingTask, values);
    setEditingTask(null);
    setEditOpen(false);
  }

  function handleToggle(id: string, checked: boolean) {
    onToggle(id, checked);
  }

  function handleDelete(id: string) {
    onDelete(id);
  }

  function clearCompleted() {
    // Parent is responsible to perform batch delete or mark
    setConfirmClearOpen(false);
  }

  const completedCount = localTasks.filter((t) => t.completed).length;
  const totalCount = localTasks.length;

  return (
    <>
      <Card className="border-none shadow-lg">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Slick Todos
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setAddOpen(true)}
                aria-label="Add new task"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
              <Button
                variant="outline"
                onClick={() => setConfirmClearOpen(true)}
                disabled={completedCount === 0}
                aria-disabled={completedCount === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear completed
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative min-w-0 md:flex-1">
              <Label htmlFor="search" className="sr-only">
                Search
              </Label>
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search tasks, notes, or tags..."
                className="pl-9 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 md:shrink-0">
              <Select
                value={statusFilter}
                onValueChange={(v: StatusFilter) => setStatusFilter(v)}
              >
                <SelectTrigger
                  aria-label="Status filter"
                  className="w-auto overflow-hidden whitespace-nowrap text-ellipsis"
                >
                  <SelectValue placeholder="Status" className="truncate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={priorityFilter}
                onValueChange={(v: PriorityFilter) => setPriorityFilter(v)}
              >
                <SelectTrigger
                  aria-label="Priority filter"
                  className="w-auto overflow-hidden whitespace-nowrap text-ellipsis"
                >
                  <SelectValue placeholder="Priority" className="truncate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>

              <div className="grid grid-cols-2 gap-2 min-w-0">
                <Select
                  value={sortKey}
                  onValueChange={(v: SortKey) => setSortKey(v)}
                >
                  <SelectTrigger
                    aria-label="Sort by"
                    className="w-auto overflow-hidden whitespace-nowrap text-ellipsis"
                  >
                    <SelectValue placeholder="Sort by" className="truncate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Created</SelectItem>
                    <SelectItem value="dueDate">Due date</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={sortDir}
                  onValueChange={(v: SortDir) => setSortDir(v)}
                >
                  <SelectTrigger
                    aria-label="Sort direction"
                    className="w-auto overflow-hidden whitespace-nowrap text-ellipsis"
                  >
                    <SelectValue placeholder="Direction" className="truncate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Asc</SelectItem>
                    <SelectItem value="desc">Desc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />
          <div className="text-sm text-muted-foreground">
            {completedCount} completed · {totalCount - completedCount} remaining
            · {totalCount} total
          </div>
        </CardHeader>

        <CardContent>
          {filteredSorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              {/* illustration intentionally omitted for a11y/lint */}
              <p className="text-muted-foreground">
                No tasks match your filters. Try adjusting search, filters, or
                add a new task.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {filteredSorted.map((t) => (
                <TaskItem
                  key={t.id}
                  task={t}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onEdit={(task) => {
                    setEditingTask(task);
                    setEditOpen(true);
                  }}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Add */}
      <TaskForm
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add task"
        submitLabel="Add task"
        onSubmit={handleAdd}
      />

      {/* Edit */}
      <TaskForm
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditingTask(null);
        }}
        title="Edit task"
        submitLabel="Save changes"
        initialTask={editingTask ?? undefined}
        onSubmit={handleEdit}
      />

      {/* Confirm clear completed */}
      <AlertDialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all completed tasks?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={clearCompleted}
            >
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
