import { router } from '../trpc';
import organization from './organization';
import todo from './todo';
import user from './user';

export const appRouter = router({ user, organization, todo });

export type AppRouter = typeof appRouter;

export default appRouter;
