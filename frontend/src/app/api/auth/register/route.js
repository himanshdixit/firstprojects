import { NextResponse } from 'next/server';
import { backendRequest } from '@/lib/serverApi';
import { setSessionCookies } from '@/lib/auth/cookies';

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

  setSessionCookies(res, accessToken, role);

  return res;
}
