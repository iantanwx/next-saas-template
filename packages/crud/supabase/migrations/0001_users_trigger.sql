-- This trigger automatically creates a public `user` entry, sans sensitive data like password hashes, when a new user signs up.
-- The reason this exists is that Supabase doesn't expose the `auth` schema tables, so we can't easily join tables without this one.
-- See https://supabase.com/docs/guides/auth/managing-user-data#using-triggers for more details.
CREATE FUNCTION public.handle_new_user () RETURNS TRIGGER AS $$
BEGIN
  insert into public.users (id, auth_id, created_at, updated_at, email, name, avatar_url)
  values (new.id, new.auth_id, new.created_at, new.updated_at, new.email, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users for each row
execute procedure public.handle_new_user ();