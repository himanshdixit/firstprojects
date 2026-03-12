import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { backendRequest, authHeadersFromToken } from '@/lib/serverApi';

const TOKEN_COOKIE = 'auth_token';

export async function GET(_request, { params }) {
  const token = cookies().get(TOKEN_COOKIE)?.value;
  const { response, data } = await backendRequest(`/posts/${params.id}`, {
    method: 'GET',
    headers: {
      ...authHeadersFromToken(token),
    },
  });

  return NextResponse.json(data, { status: response.status });
}
