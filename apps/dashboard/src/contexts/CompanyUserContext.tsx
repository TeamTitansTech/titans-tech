'use client';
import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { UserResponseDto } from '@titans-tech/shared/backend-dtos';
import { getCurrentUser } from '@/data/services/auth.api';
import { usePathname } from 'next/navigation';

interface CompanyUserContextType {
  companyUser: UserResponseDto | null;
  setCompanyUser: (user: UserResponseDto | null) => void;
  isLoading: boolean;
  refetchUser: () => Promise<void>;
}

const CompanyUserContext = createContext<CompanyUserContextType | undefined>(undefined);

export function CompanyUserProvider({ children }: { children: ReactNode }) {
  const [companyUser, setCompanyUser] = useState<UserResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  // Check if we're on a client portal route (not admin)
  const isClientRoute = pathname && !pathname.startsWith('/admin');

  const fetchUser = useCallback(async () => {
    // Only fetch user data for client routes
    if (!isClientRoute) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getCurrentUser();
      if (response.data) {
        setCompanyUser(response.data);
      } else {
        setCompanyUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      setCompanyUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [isClientRoute]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const refetchUser = async () => {
    await fetchUser();
  };

  return (
    <CompanyUserContext.Provider value={{ companyUser, setCompanyUser, isLoading, refetchUser }}>
      {children}
    </CompanyUserContext.Provider>
  );
}

export function useCompanyUser() {
  const context = useContext(CompanyUserContext);
  if (context === undefined) {
    throw new Error('useCompanyUser must be used within a CompanyUserProvider');
  }
  return context;
}
