import { NextResponse } from 'next/server';
import { backendRequest } from '@/lib/serverApi';
import { setSessionCookies } from '@/lib/auth/cookies';

export async function POST(request) {
  const body = await request.json();
  const { response, data } = await backendRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  const accessToken = data?.data?.accessToken;
  const role = data?.data?.user?.role || 'user';

  const res = NextResponse.json({
    success: true,
    data: {
      user: data?.data?.user || null,
    },
  });

  setSessionCookies(res, accessToken, role);

  return res;
}
