import { CookieOptions, createServerClient } from '@supabase/ssr';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
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

export function createClient(cookieStore: ReadonlyRequestCookies = cookies()) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {}
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {}
        },
      },
    }
  );
}
