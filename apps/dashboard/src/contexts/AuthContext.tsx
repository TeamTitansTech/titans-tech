'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSysAdmin } from '@/contexts/SysAdminContext';
import { useCompanyUser } from '@/contexts/CompanyUserContext';
import { responseHandler } from '@/data/helpers/responseHandler';
import { SysAdminResponseDto, UserResponseDto } from '@titans-tech/shared';
import { getCookie } from '@/lib/cookies';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { sysAdminUser, setSysAdminUser } = useSysAdmin();
  const { companyUser, setCompanyUser } = useCompanyUser();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (sysAdminUser || companyUser) {
        setIsLoading(false);
        return;
      }

      const isSysPanel = (await getCookie('is_sys_panel')) === 'true';

      try {
        if (isSysPanel) {
          const result = await responseHandler<SysAdminResponseDto>('/auth/admin/me');
          if (result.data) {
            setSysAdminUser(result.data);
          }
        } else {
          const result = await responseHandler<UserResponseDto>('/users/me');
          if (result.data) {
            setCompanyUser(result.data);
          }
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setIsLoading(false);
      }
    }

    void loadUser();
  }, [pathname, sysAdminUser, companyUser, setSysAdminUser, setCompanyUser]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
