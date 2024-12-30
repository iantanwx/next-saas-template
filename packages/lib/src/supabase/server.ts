import { CookieOptions, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export interface Cookie {
  name: string;
  value: string;
}

export interface CookieWithOptions {
  name: string;
  value: string;
  options: CookieOptions;
}

export interface CookieStore {
  get(key: string): Cookie | undefined;
  set(cookie: CookieWithOptions): void;
}

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options);
            } catch {
              // ignore
            }
          });
        },
      },
    }
  );
}
