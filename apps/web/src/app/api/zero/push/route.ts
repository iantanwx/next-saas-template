import { NextResponse, type NextRequest } from 'next/server';
import type { JSONValue } from '@rocicorp/zero';
import { PushProcessor, ZQLDatabase } from '@rocicorp/zero/pg';
import { schema as zeroSchema } from '@superscale/zero';
import { createServerMutators } from '@superscale/zero/server-mutators';
import { DrizzleConnection } from '@superscale/zero/drizzle-adapter';
import { db } from '@superscale/crud';
import { getCurrentSession } from '@superscale/lib/auth/session';

async function handler(req: NextRequest) {
  const json = (await req.json().catch(() => ({}))) as JSONValue;

  // Supabase session for auth
  const { user, session } = await getCurrentSession();
  if (!user || !session)
    return new NextResponse('Unauthorized', { status: 401 });
  const auth = { sub: user.id, email: user.email ?? undefined };

  const mutators = createServerMutators(auth);
  const processor = new PushProcessor(
    new ZQLDatabase(new DrizzleConnection(db), zeroSchema)
  );
  const res = await processor.process(mutators, req.nextUrl.searchParams, json);
  return NextResponse.json(res);
}

export { handler as POST, handler as GET };
