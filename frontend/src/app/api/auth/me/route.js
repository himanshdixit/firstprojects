import { NextResponse } from 'next/server';
import { backendRequest, authHeadersFromToken } from '@/lib/serverApi';
import { getRequestAuthToken } from '@/lib/auth/requestAuth';

export async function GET(request) {
  const token = getRequestAuthToken(request);

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { response, data } = await backendRequest('/auth/profile', {
    method: 'GET',
    headers: {
      ...authHeadersFromToken(token),
    },
  });

  return NextResponse.json(data, { status: response.status });
}

export async function PATCH(request) {
  const token = getRequestAuthToken(request);

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

  const { response, data } = await backendRequest('/auth/profile', {
    method: 'PATCH',
    body,
    headers: {
      ...authHeadersFromToken(token),
    },
  });

  return NextResponse.json(data, { status: response.status });
}
