'use server';

import { cookies } from 'next/headers';

export type SameSite = 'lax' | 'strict' | 'none';

export type CookieOptions = {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: SameSite;
  maxAge?: number;
  path?: string;
  domain?: string;
};

export type CookieName = 'sidebar_state' | 'auth_token' | 'is_sys_panel' | 'NEXT_LOCALE';

export async function getCookie(name: CookieName): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value;
}

export async function setCookie(
  name: CookieName,
  value: string,
  options: CookieOptions = {},
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(name, value, {
    httpOnly: options.httpOnly ?? true,
    secure: options.secure ?? process.env.NODE_ENV === 'production',
    sameSite: options.sameSite ?? 'lax',
    maxAge: options.maxAge,
    path: options.path,
    domain: options.domain,
  });
}

export async function deleteCookie(name: CookieName): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(name);
}
