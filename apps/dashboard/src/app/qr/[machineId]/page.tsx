import { redirect } from 'next/navigation';
import { getCookie } from '@/lib/cookies';
import { jwtVerify } from 'jose';

type JwtPayload = {
  id: string;
  isSysAdmin: boolean;
  companyId?: string;
};

type MachineCompanyInfo = {
  companyId: string;
  companyName: string;
  companySlug: string;
};

async function getMachineCompanyInfo(machineId: string): Promise<MachineCompanyInfo | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/machines/${machineId}/company`, {
      cache: 'no-store',
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Error fetching machine company info:', error);
    return null;
  }
}

export default async function QRCodeRedirectPage({
  params,
}: {
  params: Promise<{ machineId: string }>;
}) {
  const { machineId } = await params;

  // Check if user is authenticated
  const authToken = await getCookie('auth_token');

  // Get machine's company info (needed for both authenticated and non-authenticated users)
  const machineCompany = await getMachineCompanyInfo(machineId);

  if (!machineCompany) {
    // Machine not found or error - redirect to root
    redirect('/');
  }

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

  if (!authToken) {
    // Not authenticated - redirect to company login with return URL
    const loginUrl = `${protocol}://${machineCompany.companySlug}.${rootDomain}/?redirect=${encodeURIComponent(`/machines/${machineId}`)}`;
    redirect(loginUrl);
  }

  // User is authenticated - verify JWT and redirect accordingly
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_JWT_SECRET);
    const { payload } = await jwtVerify(authToken, secret);
    const jwtPayload = payload as unknown as JwtPayload;

    // SysAdmin user - redirect to admin panel
    if (jwtPayload.isSysAdmin) {
      redirect(`/admin/machines/${machineId}`);
    }

    // Company user - verify if belongs to same company as machine
    if (jwtPayload.companyId === machineCompany.companyId) {
      // User belongs to the same company - redirect to subdomain
      const machineUrl = `${protocol}://${machineCompany.companySlug}.${rootDomain}/machines/${machineId}`;
      redirect(machineUrl);
    }

    // User is authenticated but belongs to DIFFERENT company
    // This shouldn't happen normally, but redirect to their own company dashboard
    // They would need to logout and login with correct company
    redirect('/dashboard');
  } catch (error) {
    console.error('Error decoding JWT:', error);
    // Invalid token - redirect to login
    const loginUrl = `${protocol}://${machineCompany.companySlug}.${rootDomain}/?redirect=${encodeURIComponent(`/machines/${machineId}`)}`;
    redirect(loginUrl);
  }
}
