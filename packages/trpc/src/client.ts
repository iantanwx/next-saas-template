import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from './router';

export const t = createTRPCReact<AppRouter>();

export { TRPCClientError } from '@trpc/client';
