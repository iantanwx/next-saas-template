'use client';

import { useMemo } from 'react';
import { Button } from '@superscale/ui/components/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@superscale/ui/components/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@superscale/ui/components/popover';
import { X } from 'lucide-react';
import { useOrgTags } from './use-org-tags';
import type { Tag as ZeroTag } from '@superscale/zero';

export function TagPicker({
  organizationId,
  value,
  onChange,
  inputValue,
  setInputValue,
  onAddFromInput,
}: {
  organizationId?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  inputValue: string;
  setInputValue: (v: string) => void;
  onAddFromInput: () => void;
}) {
  const tags = useOrgTags(organizationId ?? '') as unknown as ZeroTag[];
  const options = useMemo(
    () => tags.map((t) => t.name).filter(Boolean),
    [tags]
  );

  return (
    <div className="flex flex-col gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline">
            Add tags
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search or create tag..."
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandEmpty>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={onAddFromInput}
              >
                Create "{inputValue.trim()}"
              </Button>
            </CommandEmpty>
            <CommandGroup>
              {options.map((name) => (
                <CommandItem
                  key={name}
                  onSelect={() => {
                    const next = Array.from(new Set([...value, name]));
                    onChange(next);
                    setInputValue('');
                  }}
                >
                  {name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-full border bg-muted px-2 py-1 text-xs"
            >
              {t}
              <button
                type="button"
                className="rounded-full p-0.5 hover:bg-background"
                aria-label={t}
                onClick={() => onChange(value.filter((x) => x !== t))}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
