import { logger } from '@/lib/logger';
import { EmailOtpType } from '@superscale/lib/supabase';
import { createClient } from '@superscale/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Exchanges an auth code for the user's session. The `/auth/callback` route is required for the server-side auth flow implemented
  const supabase = createClient(cookies());
  const requestUrl = new URL(request.url);
  const invitationId = requestUrl.searchParams.get('invitationId');

  const type = requestUrl.searchParams.get('type') as EmailOtpType;
  if (type === 'magiclink' || type === 'email') {
    const token_hash = requestUrl.searchParams.get('token_hash');
    if (!token_hash) {
      return redirect(requestUrl.origin + '/error');
    }
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });
    if (error) {
      logger.error({ error }, 'Error exchanging token_hash for session');
      return redirect(requestUrl.origin + '/error');
    }
  }

  const code = requestUrl.searchParams.get('code');
  if (!code) {
    // has to be either magiclink or oauth
    return redirect(requestUrl.origin + '/error');
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    logger.error({ error }, 'Error exchanging code for session');
    return redirect(requestUrl.origin + '/error');
  }
  const path = !!invitationId
    ? `/auth/invitation/${invitationId}?accept=true`
    : '/onboarding';
  return redirect(requestUrl.origin + path);
}
