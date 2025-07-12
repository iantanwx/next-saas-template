import { z } from 'zod';

const DEFAULT_VALUE_DO_NOT_USE_IN_PRODUCTION = '__default__';

export const serverSchema = z.object({
  // App
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  LOG_LEVEL: z.string().default('info'),

  // Storage
  DATABASE_URL: z.string().url().optional(),

  // Auth (Supabase only)

  STRIPE_SECRET_KEY: z.string().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(''),

  // email
  RESEND_API_KEY: z.string().default(''),
});

const env = {
  ...process.env,
  NODE_ENV: process.env.NODE_ENV,
  LOG_LEVEL: process.env.LOG_LEVEL,
};

export const serverConfig = serverSchema.parse(env);

export const clientSchema = z.object({
  NEXT_PUBLIC_AXIOM_DATASET: z.string().default('supserscale_dev'),
  NEXT_PUBLIC_AXIOM_TOKEN: z.string().default(''),
});

export const clientConfig = clientSchema.parse(env);
