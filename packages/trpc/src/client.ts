import { AppRouter } from './router';
import { createTRPCReact } from '@trpc/react-query';

export const t = createTRPCReact<AppRouter>();

export { TRPCClientError } from '@trpc/client';
