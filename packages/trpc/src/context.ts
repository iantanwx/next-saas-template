import { getCurrentSession } from '@superscale/lib/auth/session';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export async function createTrpcContext({ req }: FetchCreateContextFnOptions) {
  const { user } = await getCurrentSession();
  return { user, req };
}

export type TrpcContext = Awaited<ReturnType<typeof createTrpcContext>>;
