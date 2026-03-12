import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { backendRequest, authHeadersFromToken } from '@/lib/serverApi';

const TOKEN_COOKIE = 'auth_token';

export async function GET() {
  const token = cookies().get(TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { response, data } = await backendRequest('/admin/analytics', {
    method: 'GET',
    headers: {
      ...authHeadersFromToken(token),
    },
  });

  return NextResponse.json(data, { status: response.status });
}
