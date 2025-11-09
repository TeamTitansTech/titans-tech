'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSysAdmin } from '@/contexts/SysAdminContext';
import { useCompanyUser } from '@/contexts/CompanyUserContext';

// This will be called client-side to get the cookie
async function getAuthToken() {
  try {
    const response = await fetch('/api/auth/verify', {
      credentials: 'include',
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error('Failed to verify auth:', error);
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { sysAdminUser, setSysAdminUser } = useSysAdmin();
  const { companyUser, setCompanyUser } = useCompanyUser();
  const pathname = usePathname();

  useEffect(() => {
    // Skip auth check on public routes
    const publicRoutes = ['/login', '/admin/login', '/auth-test'];
    if (publicRoutes.some((route) => pathname.startsWith(route))) {
      return;
    }

    // Only restore context if not already set
    if (!sysAdminUser && !companyUser) {
      getAuthToken().then((data) => {
        if (data) {
          if (data.isSysAdmin) {
            setSysAdminUser(data.user);
          } else {
            setCompanyUser(data.user);
          }
        }
      });
    }
  }, [pathname, sysAdminUser, companyUser, setSysAdminUser, setCompanyUser]);

  return <>{children}</>;
}
