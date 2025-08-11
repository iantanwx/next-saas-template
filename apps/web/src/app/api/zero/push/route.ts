import type { JSONValue } from '@rocicorp/zero';
import { PushProcessor, ZQLDatabase } from '@rocicorp/zero/pg';
import { db } from '@superscale/crud';
import { createClient } from '@superscale/lib/supabase/server';
import { schema as zeroSchema } from '@superscale/zero';
import { DrizzleConnection } from '@superscale/zero/drizzle-adapter';
import { createServerMutators } from '@superscale/zero/server-mutators';
import { type NextRequest, NextResponse } from 'next/server';

async function handler(req: NextRequest) {
  const json = (await req.json().catch(() => ({}))) as JSONValue;
  const jwt = req.headers.get('authorization');
  if (!jwt) {
    console.error('No JWT provided');
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser(
    jwt.replace('Bearer ', '')
  );
  if (error) {
    console.error('Error getting user: ', error);
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const mutators = createServerMutators({
    sub: data.user.id,
    email: data.user.email,
  });
  const processor = new PushProcessor(
    new ZQLDatabase(new DrizzleConnection(db), zeroSchema)
  );
  const res = await processor.process(mutators, req.nextUrl.searchParams, json);
  return NextResponse.json(res);
}

export { handler as POST };
