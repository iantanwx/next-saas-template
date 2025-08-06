'use client';

import { initializePGlite } from '@superscale/pglite';
// import { drizzle } from 'drizzle-orm/pglite';
import { todos } from '@superscale/pglite/schema';
import { useEffect, useState } from 'react';

export default function TestPGlitePage() {
  const [status, setStatus] = useState<string>('Initializing...');
  const [tableInfo, setTableInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testPGlite() {
      try {
        const { pg, db } = await initializePGlite();
        console.log('PGlite initialized');
        setStatus(
          '✅ PGlite initialized successfully! Todos table created with migrations.'
        );
        await db.insert(todos).values({
          title: 'Test Todo',
          userId: '8f9b832d-5705-494f-8f78-3183f821d9f4',
          organizationId: '8f9b832d-5705-494f-8f78-3183f821d9f4',
        });
        const todo = await db.query.todos.findFirst();
        console.log('Todos:', todo);
      } catch (err) {
        console.error('PGlite test error:', err);
        setError(err instanceof Error ? err.message : String(err));
        setStatus('❌ Failed to initialize PGlite');
      }
    }

    testPGlite();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">PGlite Integration Test</h1>

      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <p className="font-semibold">Status:</p>
          <p>{status}</p>
        </div>

        {error && (
          <div className="p-4 bg-red-100 rounded">
            <p className="font-semibold text-red-700">Error:</p>
            <pre className="text-sm">{error}</pre>
          </div>
        )}

        {tableInfo && (
          <div className="p-4 bg-green-100 rounded">
            <p className="font-semibold text-green-700 mb-2">
              Todos Table Schema:
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Column</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Nullable</th>
                  </tr>
                </thead>
                <tbody>
                  {tableInfo.rows.map((row: any, i: number) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">{row.column_name}</td>
                      <td className="p-2">{row.data_type}</td>
                      <td className="p-2">{row.is_nullable}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs mt-2 text-gray-600">
              {tableInfo.rows.length} columns found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
