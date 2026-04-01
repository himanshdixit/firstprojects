import { NextResponse } from 'next/server';
import { backendRequest } from '@/lib/serverApi';
import { clearAuthCookies } from '@/lib/auth/cookies';

export async function POST() {
  await backendRequest('/auth/logout', {
    method: 'POST',
  });

  const res = NextResponse.json({ success: true, message: 'Logged out' });
  clearAuthCookies(res);
  return res;
}
