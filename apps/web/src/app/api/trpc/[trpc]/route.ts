import {
  appRouter,
  createTrpcContext,
  fetchRequestHandler,
} from '@superscale/trpc';
import type { NextRequest } from 'next/server';

function handler(req: NextRequest) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createTrpcContext,
  });
}

export { handler as GET, handler as POST };
