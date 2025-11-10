'use server';

import { cookies } from 'next/headers';

const LOCALE_COOKIE = 'NEXT_LOCALE';

export async function setUserLocale(locale: string) {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale);
}

export async function getUserLocale(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(LOCALE_COOKIE)?.value;
}
