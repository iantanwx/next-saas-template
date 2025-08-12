'use client';

import { useQuery, useZero } from '@rocicorp/zero/react';
import type { Schema } from '@superscale/zero';

export function useOrgTags(organizationId: string) {
  const z = useZero<Schema>();
  const [rows] = useQuery(
    z.query.tags.where('organizationId', organizationId).orderBy('name', 'asc')
  );
  return rows ?? [];
}
