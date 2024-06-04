import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
  // only push public to avoid auth
  // see https://github.com/supabase/supabase/issues/19883
  schemaFilter: ['public'],
  schema: './src/db/schema.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
