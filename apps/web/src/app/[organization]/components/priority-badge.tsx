'use client';

import { Badge } from '@superscale/ui/components/badge';
import { cn } from '@/lib/utils';

export default function PriorityBadge({
  value = 'medium',
}: {
  value?: 'low' | 'medium' | 'high';
}) {
  const label =
    value === 'high' ? 'High' : value === 'medium' ? 'Medium' : 'Low';
  const cls =
    value === 'high'
      ? 'bg-rose-100 text-rose-700 border-rose-200'
      : value === 'medium'
        ? 'bg-amber-100 text-amber-700 border-amber-200'
        : 'bg-emerald-100 text-emerald-700 border-emerald-200';

  return (
    <Badge
      variant="outline"
      className={cn('rounded-full px-2.5 py-0.5 text-xs', cls)}
    >
      {label}
    </Badge>
  );
}
