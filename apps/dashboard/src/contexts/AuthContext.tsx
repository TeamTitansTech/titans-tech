'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSysAdmin } from '@/contexts/SysAdminContext';
import { useCompanyUser } from '@/contexts/CompanyUserContext';
import { responseHandler } from '@/data/helpers/responseHandler';
import { SysAdminResponseDto, UserResponseDto } from '@titans-tech/shared/backend-dtos';
import { getCookie } from '@/lib/cookies';
import { useInternalRouter } from '@/hooks/useInternalRouter';

const PUBLIC_PATHS = new Set(['/admin', '/', '/forgot-password', '/reset-password']);

function isPublicRoute(pathname: string | null): boolean {
  if (!pathname) return false;

  if (PUBLIC_PATHS.has(pathname)) return true;

  return false;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { sysAdminUser, setSysAdminUser } = useSysAdmin();
  const { companyUser, setCompanyUser } = useCompanyUser();
  const pathname = usePathname();
  const router = useInternalRouter();
  const [isLoading, setIsLoading] = useState(true);

  const isPublicPath = isPublicRoute(pathname);

  useEffect(() => {
    async function loadUser() {
      if (sysAdminUser || companyUser) {
        setIsLoading(false);
        return;
      }

      // Skip auth check for public paths
      if (isPublicPath) {
        setIsLoading(false);
        return;
      }

      const authToken = await getCookie('auth_token');
      if (!authToken) {
        router.replace('/');
        return;
      }

      const isSysPanel = (await getCookie('is_sys_panel')) === 'true';

      try {
        if (isSysPanel) {
          const result = await responseHandler<SysAdminResponseDto>('/auth/admin/me');
          if (result.data) {
            setSysAdminUser(result.data);
          } else if (result.status === 401) {
            router.replace('/login');
            return;
          }
        } else {
          const result = await responseHandler<UserResponseDto>('/users/me');
          if (result.data) {
            setCompanyUser(result.data);
          } else if (result.status === 401) {
            router.replace('/login');
            return;
          }
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setIsLoading(false);
      }
    }

    void loadUser();
  }, [pathname, sysAdminUser, companyUser, setSysAdminUser, setCompanyUser, isPublicPath, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
