import { router } from '../trpc';
import organization from './organization';
import user from './user';

export const appRouter = router({ user, organization });

export type AppRouter = typeof appRouter;

export default appRouter;
