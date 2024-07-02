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

  // Auth
  NEXTAUTH_SECRET:
    process.env.NODE_ENV === 'production'
      ? z.string().min(1).default(DEFAULT_VALUE_DO_NOT_USE_IN_PRODUCTION)
      : z
        .string()
        .min(1)
        .optional()
        .default(DEFAULT_VALUE_DO_NOT_USE_IN_PRODUCTION),
  NEXTAUTH_URL:
    process.env.NODE_ENV === 'development'
      ? z.string().optional()
      : z
        .preprocess(
          // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
          // Since NextAuth.js automatically uses the VERCEL_URL if present.
          (str) => process.env.VERCEL_URL ?? str,
          // VERCEL_URL doesn't include `https` so it cant be validated as a URL
          process.env.VERCEL ? z.string() : z.string().url()
        )
        .optional()
        .default(''),
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),

  STRIPE_SECRET_KEY: z.string().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(''),

  // email
  RESEND_API_KEY: z.string().default(''),

  // Shopify
  SHOPIFY_API_KEY: z.string().default(''),
  SHOPIFY_API_SECRET: z.string().default(''),
  SHOPIFY_APP_URL: z.string().default(''),
  SHOPIFY_APP_STORE_URL: z.string().default(''),
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
