import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { backendRequest, authHeadersFromToken } from '@/lib/serverApi';

const TOKEN_COOKIE = 'auth_token';

export async function PATCH(request, { params }) {
  const token = cookies().get(TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const contentType = request.headers.get('content-type') || '';
  let body;
  if (contentType.includes('multipart/form-data')) {
    body = await request.formData();
  } else {
    const jsonBody = await request.json();
    body = JSON.stringify(jsonBody);
  }

  const { response, data } = await backendRequest(`/admin/users/${params.id}`, {
    method: 'PATCH',
    body,
    headers: {
      ...authHeadersFromToken(token),
    },
  });

  return NextResponse.json(data, { status: response.status });
}

export async function DELETE(_request, { params }) {
  const token = cookies().get(TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { response, data } = await backendRequest(`/admin/users/${params.id}`, {
    method: 'DELETE',
    headers: {
      ...authHeadersFromToken(token),
    },
  });

  return NextResponse.json(data, { status: response.status });
}
