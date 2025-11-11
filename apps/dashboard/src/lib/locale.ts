'use server';

import { setCookie } from './cookies';

export async function setLocale(locale: string) {
  await setCookie('NEXT_LOCALE', locale, {
    maxAge: 31536000, // 1 year
  });
}
