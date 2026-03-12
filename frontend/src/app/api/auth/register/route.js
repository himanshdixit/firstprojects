import { NextResponse } from 'next/server';
import { backendRequest } from '@/lib/serverApi';

const TOKEN_COOKIE = 'auth_token';
const ROLE_COOKIE = 'auth_role';

export async function POST(request) {
  const contentType = request.headers.get('content-type') || '';
  let body;
  if (contentType.includes('multipart/form-data')) {
    body = await request.formData();
  } else {
    const jsonBody = await request.json();
    body = JSON.stringify(jsonBody);
  }

  const { response, data } = await backendRequest('/auth/register', {
    method: 'POST',
    body,
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

  res.cookies.set(TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15,
  });

  res.cookies.set(ROLE_COOKIE, role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15,
  });

  return res;
}
