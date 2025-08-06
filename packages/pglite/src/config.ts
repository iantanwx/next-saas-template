import { z } from 'zod';

/**
 * Electric SQL configuration schema
 */
export const electricConfigSchema = z.object({
  NEXT_PUBLIC_PGLITE_DEBUG: z.coerce
    .boolean()
    .default(false)
    .describe('Enable debug logging'),
  NEXT_PUBLIC_ELECTRIC_URL: z
    .string()
    .url()
    .optional()
    .describe('Electric SQL service URL'),
});

export type ElectricConfig = z.infer<typeof electricConfigSchema>;

// Get environment variables in a way that works in both server and client
const env = {
  NEXT_PUBLIC_PGLITE_DEBUG: process.env.NEXT_PUBLIC_PGLITE_DEBUG,
  NEXT_PUBLIC_ELECTRIC_URL: process.env.NEXT_PUBLIC_ELECTRIC_URL,
};

export const config = electricConfigSchema.parse(env);
