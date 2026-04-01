import { NextResponse } from 'next/server';
import { backendRequest, authHeadersFromToken } from '@/lib/serverApi';
import { getRequestAuthToken } from '@/lib/auth/requestAuth';

export async function PATCH(request, { params }) {
  const token = getRequestAuthToken(request);
  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { response, data } = await backendRequest(`/comments/${params.id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: {
      ...authHeadersFromToken(token),
    },
  });

  return NextResponse.json(data, { status: response.status });
}

export async function DELETE(request, { params }) {
  const token = getRequestAuthToken(request);
  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { response, data } = await backendRequest(`/comments/${params.id}`, {
    method: 'DELETE',
    headers: {
      ...authHeadersFromToken(token),
    },
  });

  return NextResponse.json(data, { status: response.status });
}
