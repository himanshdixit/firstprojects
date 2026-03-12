import { NextResponse } from 'next/server';
import { backendRequest } from '@/lib/serverApi';

const TOKEN_COOKIE = 'auth_token';
const ROLE_COOKIE = 'auth_role';

export async function POST() {
  await backendRequest('/auth/logout', {
    method: 'POST',
  });

  const res = NextResponse.json({ success: true, message: 'Logged out' });
  res.cookies.set(TOKEN_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  res.cookies.set(ROLE_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
