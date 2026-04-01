import { NextResponse } from 'next/server';
import { backendRequest } from '@/lib/serverApi';

export async function POST(request) {
  const body = JSON.stringify(await request.json());

  const { response, data } = await backendRequest('/contacts', {
    method: 'POST',
    body,
  });

  return NextResponse.json(data, { status: response.status });
}
