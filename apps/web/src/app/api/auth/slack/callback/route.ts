import { createClient } from '@superscale/lib/supabase/server';
import { redirect } from 'next/navigation';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const supabase = await createClient();
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');
  const error = requestUrl.searchParams.get('error');
  const organizationId = state; // The state parameter should contain the organization ID

  // Handle errors from Slack
  if (error) {
    logger.error({ error }, 'Error during Slack OAuth');
    return redirect(requestUrl.origin + '/error?source=slack');
  }

  // Validate required parameters
  if (!code || !organizationId) {
    logger.error('Missing required parameters in Slack OAuth callback');
    return redirect(requestUrl.origin + '/error?source=slack');
  }

  try {
    // Exchange the code for access token
    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      logger.error(
        { error: data.error },
        'Error exchanging Slack code for token'
      );
      return redirect(requestUrl.origin + '/error?source=slack');
    }

    // Store the integration in the database
    const { error: dbError } = await supabase.from('installations').insert({
      type: 'slack',
      externalId: data.team.id,
      externalName: data.team.name,
      credentials: JSON.stringify({
        access_token: data.access_token,
        bot_user_id: data.bot_user_id,
        scope: data.scope,
      }),
      metadata: JSON.stringify({
        app_id: data.app_id,
        team: data.team,
      }),
      organizationId,
    });

    if (dbError) {
      logger.error({ error: dbError }, 'Error storing Slack integration');
      return redirect(requestUrl.origin + '/error?source=slack');
    }

    // Redirect to success page
    return redirect(
      requestUrl.origin +
        `/organizations/${organizationId}/settings/integrations?success=slack`
    );
  } catch (error) {
    logger.error({ error }, 'Unexpected error during Slack OAuth');
    return redirect(requestUrl.origin + '/error?source=slack');
  }
}
