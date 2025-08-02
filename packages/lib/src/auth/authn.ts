import { users } from '@superscale/crud';
import type { InvitationWithOrgAndInviter } from '@superscale/crud/types';
import { createClient } from '../supabase/server';
import { baseUrl } from '../utils';

export async function getMagicLink(email: string, invitationId?: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });

  if (error) {
    console.error('Error generating magic link', error);
    throw new Error(error.message);
  }

  const link = `${baseUrl()}/api/auth/supabase/callback?token_hash=${data.properties.hashed_token}&type=magiclink${invitationId ? `&invitationId=${invitationId}` : ''}`;
  return link;
}

export async function getInviteLink({
  id,
  email,
}: InvitationWithOrgAndInviter) {
  const supabase = await createClient();
  const invitee = await users.findByEmail(email);
  const { data, error } = await supabase.auth.admin.generateLink({
    type: invitee ? 'magiclink' : 'invite',
    email,
    options: {
      redirectTo: `${baseUrl()}/auth/invitation/${id}`,
    },
  });
  if (error) {
    console.error('Error generating invite link', error);
    throw new Error(error.message);
  }
  return data.properties.action_link;
}
