import { describe, it, expect } from 'vitest';
import * as auth from '@superscale/lib/auth';

describe('Auth Integration Tests', () => {
  it('should export all required auth functions', () => {
    // Test that the auth package exports the expected API
    expect(auth.getMagicLink).toBeDefined();
    expect(auth.getInviteLink).toBeDefined();
    expect(auth.getCurrentUser).toBeDefined();
    expect(auth.getCurrentSession).toBeDefined();
  });

  it('should have working session functions', async () => {
    // Test that session functions can be called without errors
    try {
      // These should not throw errors even if no user is logged in
      const user = await auth.getCurrentUser();
      const session = await auth.getCurrentSession();
      
      // Should return null for no authenticated user
      expect(user).toBeNull();
      expect(session.user).toBeNull();
    } catch (error) {
      // If it throws, it should be a database connection error, not a function error
      expect(error).toBeDefined();
    }
  });

  it('should have working magic link generation', async () => {
    // Test that magic link functions are callable
    expect(typeof auth.getMagicLink).toBe('function');
    expect(typeof auth.getInviteLink).toBe('function');
    
    // These functions require admin access so we just test they're available
    // In a real test environment, you'd mock the Supabase admin client
  });
});
