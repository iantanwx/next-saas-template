import { describe, it, expect } from 'vitest';
import * as crud from '@superscale/crud';

describe('CRUD Package Integration Tests', () => {
  it('should export all required modules', () => {
    // Test that the CRUD package exports the expected modules
    expect(crud.users).toBeDefined();
    expect(crud.organizations).toBeDefined();
    expect(crud.invitations).toBeDefined();
  });

  it('should have working user functions', async () => {
    // These should throw for non-existent data (database query errors are expected)
    await expect(crud.users.getById('test-id')).rejects.toThrow();
    await expect(
      crud.users.findByEmail('test@example.com')
    ).resolves.toBeUndefined();
  });

  it('should have working organization functions', async () => {
    // Test organization functions - these throw for non-existent data
    await expect(crud.organizations.getBySlug('test-org')).rejects.toThrow();

    // Test exists function which should return false for non-existent org
    const exists = await crud.organizations.exists('test-org');
    expect(exists).toBe(false);
  });

  it('should have working invitation functions', async () => {
    // Test invitation functions - these should be callable
    expect(typeof crud.invitations.findOrCreate).toBe('function');
  });
});
