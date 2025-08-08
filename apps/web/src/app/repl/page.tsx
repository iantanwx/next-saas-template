'use client';

import { usePGlite } from '@superscale/pglite';
import { DBStatus } from '@superscale/pglite/provider';
import { Repl } from '@electric-sql/pglite-repl';

export default function PGliteREPL() {
  const { pg, status } = usePGlite();
  if (status !== DBStatus.Ready || !pg) {
    return (
      <main className="container flex min-h-screen flex-col items-center justify-between p-24">
        Loading…
      </main>
    );
  }
  return (
    <main className="container flex min-h-screen flex-col items-center justify-between p-24">
      <Repl pg={pg} />
    </main>
  );
}
