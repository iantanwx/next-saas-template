import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  // Use in-memory for local PGlite development
  dbCredentials: {
    url: 'postgresql://postgres:postgres@localhost:5432/postgres'
  }
});