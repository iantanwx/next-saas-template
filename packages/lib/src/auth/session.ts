import { users } from '@superscale/crud';
import { createClient } from '../supabase/server';

export async function getCurrentUser() {
  const { user } = await getCurrentSession();
  return user;
}

export async function getCurrentSession() {
  const supabase = await createClient();
  const {
    data: { user: _user },
  } = await supabase.auth.getUser();

  if (!_user) {
    return { user: null };
  }
 
  const user = await users.getById(_user.id);
  return { user };
}
