import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const apiPath = '/' + path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${API_BASE_URL}${apiPath}${searchParams ? `?${searchParams}` : ''}`;

  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  const response = await fetch(url, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const data = await response.json().catch(() => null);
  return NextResponse.json(data, { status: response.status });
}
