import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

interface JWTPayload {
  id: string;
  isSysAdmin?: boolean;
  companyId?: string;
  isCompanyAdmin?: boolean;
  isCompanyManager?: boolean;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No token found' }, { status: 401 });
    }

    // Verify the JWT
    const secret = new TextEncoder().encode(process.env.AUTH_JWT_SECRET || 'your_jwt_secret_key');
    const { payload } = await jwtVerify(token, secret);
    const userPayload = payload as unknown as JWTPayload;

    // Fetch user data from backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const endpoint = userPayload.isSysAdmin ? '/auth/admin/me' : '/users/me';

    const response = await fetch(`${apiUrl}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 401 });
    }

    const user = await response.json();

    return NextResponse.json({
      isSysAdmin: userPayload.isSysAdmin || false,
      user,
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
