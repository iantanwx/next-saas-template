'use client';

import { Checkbox } from '@superscale/ui/components/checkbox';
import { Button } from '@superscale/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@superscale/ui/components/dropdown-menu';
import {
  CalendarIcon,
  Edit3,
  MoreVertical,
  TagIcon,
  Trash2,
} from 'lucide-react';
import { format, isBefore, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import PriorityBadge from './priority-badge';

export type Priority = 'low' | 'medium' | 'high';

// UI task shape mapped from DB rows in parent component
export type Task = {
  id: string;
  title: string;
  notes: string;
  completed: boolean;
  priority: Priority;
  dueDate: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type TaskItemProps = {
  task?: Task;
  onToggle?: (id: string, checked: boolean) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
};

export default function TaskItem({
  task = {
    id: 'demo',
    title: 'Demo task',
    notes: 'This is a demo placeholder',
    completed: false,
    priority: 'medium',
    dueDate: null,
    tags: ['demo'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  onToggle = () => {},
  onEdit = () => {},
  onDelete = () => {},
}: TaskItemProps) {
  const overdue = task.dueDate
    ? isBefore(startOfDay(new Date(task.dueDate)), startOfDay(new Date())) &&
      !task.completed
    : false;

  return (
    <li
      className={cn(
        'group flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors',
        task.completed && 'opacity-75'
      )}
    >
      <div className="pt-1">
        <Checkbox
          checked={task.completed}
          onCheckedChange={(v: boolean | 'indeterminate') =>
            onToggle(task.id, Boolean(v))
          }
          aria-label={
            task.completed ? 'Mark as incomplete' : 'Mark as complete'
          }
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                'font-medium leading-none',
                task.completed ? 'line-through text-muted-foreground' : ''
              )}
            >
              {task.title}
            </h3>
            <PriorityBadge value={task.priority} />
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(task)}
              aria-label="Edit task"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="More actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-rose-600 focus:text-rose-600"
                  onClick={() => onDelete(task.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {task.notes && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {task.notes}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {task.dueDate && (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2 py-1',
                overdue
                  ? 'border-rose-200 text-rose-600 bg-rose-50'
                  : 'border-transparent bg-muted'
              )}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              {overdue ? 'Overdue:' : 'Due:'}{' '}
              {format(new Date(task.dueDate), 'PPP')}
            </span>
          )}
          {task.tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-full border px-2 py-1 bg-muted"
            >
              <TagIcon className="h-3.5 w-3.5" />
              {t}
            </span>
          ))}
        </div>
      </div>
    </li>
  );
}
