import { z } from 'zod';

/**
 * Electric SQL configuration schema
 */
export const electricConfigSchema = z.object({
  dbName: z.string().default('superscale-local').describe('Local database name'),
  electricUrl: z.string().url().describe('Electric SQL service URL'),
  debug: z.boolean().default(false).describe('Enable debug logging'),
});

export type ElectricConfig = z.infer<typeof electricConfigSchema>;

/**
 * Default Electric SQL configuration
 * These values should be overridden via environment variables
 */
export const defaultElectricConfig: ElectricConfig = {
  dbName: process.env.NEXT_PUBLIC_ELECTRIC_DB_NAME || 'superscale-local',
  electricUrl: process.env.NEXT_PUBLIC_ELECTRIC_URL || 'http://localhost:3000/electric',
  debug: process.env.NODE_ENV === 'development',
};

/**
 * Validate and return Electric SQL configuration
 */
export function getElectricConfig(config?: Partial<ElectricConfig>): ElectricConfig {
  const mergedConfig = { ...defaultElectricConfig, ...config };
  return electricConfigSchema.parse(mergedConfig);
}