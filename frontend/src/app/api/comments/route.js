import { NextResponse } from 'next/server';
import { backendRequest, authHeadersFromToken } from '@/lib/serverApi';
import { getRequestAuthToken } from '@/lib/auth/requestAuth';

export async function GET(request) {
  const token = getRequestAuthToken(request);
  const search = request.nextUrl.search || '';

  const { response, data } = await backendRequest(`/comments${search}`, {
    method: 'GET',
    headers: {
      ...authHeadersFromToken(token),
    },
  });

  return NextResponse.json(data, { status: response.status });
}

export async function POST(request) {
  const token = getRequestAuthToken(request);
  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { response, data } = await backendRequest('/comments', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      ...authHeadersFromToken(token),
    },
  });

  return NextResponse.json(data, { status: response.status });
}
