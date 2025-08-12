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
import { TagPicker } from './tag-picker';
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
import { CalendarIcon } from 'lucide-react';
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
  organizationId,
}: {
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  initialTask?: Partial<Task>;
  onSubmit?: (values: TaskFormValues) => void;
  submitLabel?: string;
  title?: string;
  organizationId?: string;
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

  // Tag removal handled inside TagPicker

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

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
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
              <Label>Tags</Label>
              <TagPicker
                organizationId={organizationId}
                value={values.tags}
                onChange={(tags) => setValues((v) => ({ ...v, tags }))}
                inputValue={tagInput}
                setInputValue={setTagInput}
                onAddFromInput={addTagFromInput}
              />
            </div>
          </div>
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
