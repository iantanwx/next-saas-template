'use client';

import { baseUrl } from '@superscale/lib/utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import SuperJSON from 'superjson';
import { t } from './client';

interface Props {
  children: React.ReactNode;
}

export function TrpcProvider({ children }: Props) {
  const [queryClient] = useState(new QueryClient());
  const [trpcClient] = useState(() =>
    t.createClient({
      links: [
        httpBatchLink({
          url: `${baseUrl()}/api/trpc`,
          transformer: SuperJSON,
        }),
      ],
    })
  );

  return (
    <t.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </t.Provider>
  );
}
