import { users } from '@superscale/crud';
import { createClient } from '../supabase/server';

export async function getCurrentUser() {
  const { user } = await getCurrentSession();
  return user;
}

export async function getCurrentSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { user: null };
  }

  const user = await users.getById(session.user.id);
  return { user, session };
}
