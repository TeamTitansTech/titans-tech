import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function handler(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const apiPath = '/' + path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${API_BASE_URL}${apiPath}${searchParams ? `?${searchParams}` : ''}`;

  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Forward content-type if present
  const contentType = request.headers.get('content-type');
  if (contentType) headers['Content-Type'] = contentType;

  const body =
    request.method !== 'GET' && request.method !== 'HEAD'
      ? await request.text().catch(() => undefined)
      : undefined;

  const response = await fetch(url, {
    method: request.method,
    headers,
    body,
  });

  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await response.json().catch(() => null);
  return NextResponse.json(data, { status: response.status });
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
