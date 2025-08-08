'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@superscale/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@superscale/ui/components/dialog';
import { Input } from '@superscale/ui/components/input';
import { Label } from '@superscale/ui/components/label';
import { Textarea } from '@superscale/ui/components/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@superscale/ui/components/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@superscale/ui/components/select';
import { Calendar } from '@superscale/ui/components/calendar';
import { CalendarIcon, Tag, X } from 'lucide-react';
import { cn } from '@/lib/utils';
export type Priority = 'low' | 'medium' | 'high';
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
import { format } from 'date-fns';

export type TaskFormValues = {
  title: string;
  notes: string;
  priority: Priority;
  dueDate: Date | null;
  tags: string[];
};

function toValuesFromTask(t?: Partial<Task>): TaskFormValues {
  const due = t?.dueDate ? new Date(t.dueDate) : null;
  return {
    title: t?.title ?? '',
    notes: t?.notes ?? '',
    priority: (t?.priority ?? 'medium') as Priority,
    dueDate: Number.isNaN(due?.getTime() ?? NaN) ? null : due,
    tags: t?.tags ?? [],
  };
}

export default function TaskForm({
  open = false,
  onOpenChange = () => {},
  initialTask = undefined,
  onSubmit = () => {},
  submitLabel = 'Save',
  title = 'Task',
}: {
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  initialTask?: Partial<Task>;
  onSubmit?: (values: TaskFormValues) => void;
  submitLabel?: string;
  title?: string;
}) {
  const [values, setValues] = useState<TaskFormValues>(() =>
    toValuesFromTask(initialTask)
  );
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (open) setValues(toValuesFromTask(initialTask));
  }, [open, initialTask]);

  function addTagFromInput() {
    const raw = tagInput.trim();
    if (!raw) return;
    const parts = raw
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    setValues((v) => ({
      ...v,
      tags: Array.from(new Set([...v.tags, ...parts])),
    }));
    setTagInput('');
  }

  function removeTag(t: string) {
    setValues((v) => ({ ...v, tags: v.tags.filter((x) => x !== t) }));
  }

  const isValid = useMemo(() => values.title.trim().length > 0, [values.title]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="task-form-desc">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              placeholder="e.g., Draft Q3 planning"
              value={values.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setValues((v) => ({ ...v, title: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && isValid) {
                  onSubmit(values);
                }
              }}
              aria-required="true"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="task-notes">Notes</Label>
            <Textarea
              id="task-notes"
              placeholder="Add any details or links..."
              value={values.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setValues((v) => ({ ...v, notes: e.target.value }))
              }
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select
                value={values.priority}
                onValueChange={(val: Priority) =>
                  setValues((v) => ({ ...v, priority: val }))
                }
              >
                <SelectTrigger aria-label="Priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Due date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'justify-start text-left font-normal',
                      !values.dueDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {values.dueDate
                      ? format(values.dueDate, 'PPP')
                      : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={values.dueDate ?? undefined}
                    onSelect={(d: Date | undefined) =>
                      setValues((v) => ({ ...v, dueDate: d ?? null }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tag-input">Tags</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="tag-input"
                    placeholder="Add tag then press Enter or comma"
                    className="pl-8"
                    value={tagInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setTagInput(e.target.value)
                    }
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        addTagFromInput();
                      }
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addTagFromInput}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          {values.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {values.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs bg-muted"
                  aria-label={`Tag ${t}`}
                >
                  {t}
                  <button
                    type="button"
                    className="rounded-full p-0.5 hover:bg-background"
                    aria-label={t}
                    onClick={() => removeTag(t)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={!isValid}
            onClick={() => onSubmit(values)}
          >
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
