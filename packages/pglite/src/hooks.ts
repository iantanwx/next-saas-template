'use client';

import { useContext } from 'react';
import { DBContext } from './provider';

/**
 * Hook to access the PGLite database instance and state
 */
export function usePGlite() {
  const context = useContext(DBContext);

  if (!context) {
    throw new Error('usePGlite must be used within a PGliteProvider');
  }

  return {
    pg: context.pg,
    status: context.status,
  };
}
