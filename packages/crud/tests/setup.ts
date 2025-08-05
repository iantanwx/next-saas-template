import { beforeAll, afterAll } from 'vitest';

beforeAll(async () => {
  // Test setup - ensure database is ready
  console.log('Setting up tests...');
});

afterAll(async () => {
  // Test cleanup
  console.log('Cleaning up tests...');
});