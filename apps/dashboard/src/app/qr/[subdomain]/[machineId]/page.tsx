import { getCookie } from '@/lib/cookies';
import { getPublicMachineInfo } from '@/data/services/public.api';
import { getCurrentUser } from '@/data/services/auth.api';
import { notFound, redirect } from 'next/navigation';
import { PublicMachinePageClient } from './PublicMachinePageClient';
import { hasPermissionForResource } from '@/lib/permissions';

interface QRPageProps {
  params: Promise<{ machineId: string; subdomain: string }>;
}

/**
 * QR Code Page (Public Access)
 *
 * This page is accessed when a user scans a machine's QR code.
 * The QR URL format: http://{subdomain}.domain.com/qr/{machineId}
 * Which gets rewritten to: /qr/{subdomain}/{machineId}
 *
 * Render logic:
 * - Authenticated user with permission: Redirect to machine details page (with full layout)
 * - Authenticated user without permission: Redirect to home
 * - Unauthenticated user: Show public service request form (no sidebar/header)
 */
export default async function QRPage({ params }: QRPageProps) {
  const { machineId } = await params;
  const authToken = await getCookie('auth_token');
  const isLoggedIn = Boolean(authToken);

  if (isLoggedIn) {
    // Authenticated user: check permission and redirect to machine details
    const userResponse = await getCurrentUser();

    if (userResponse.errors || !userResponse.data) {
      // Token invalid, show public form
      const publicInfo = await getPublicMachineInfo(machineId);
      if (publicInfo.errors || !publicInfo.data) {
        notFound();
      }
      return <PublicMachinePageClient machine={publicInfo.data} />;
    }

    const user = userResponse.data;

    // Get basic machine info to check permission
    const publicInfo = await getPublicMachineInfo(machineId);
    if (publicInfo.errors || !publicInfo.data) {
      notFound();
    }

    // Check permission using branch info
    const canViewMachine = hasPermissionForResource(
      user,
      { branchId: publicInfo.data.branch.id },
      'readMachines',
    );

    if (!canViewMachine) {
      // Redirect to home on the subdomain
      redirect(`/`);
    }

    // Redirect to the proper machine details page with full layout
    // This will go through the proxy and use the subdomain layout
    redirect(`/machines/${machineId}`);
  }

  // Unauthenticated user: show public service request form
  const response = await getPublicMachineInfo(machineId);

  if (response.errors || !response.data) {
    notFound();
  }

  return <PublicMachinePageClient machine={response.data} />;
}
