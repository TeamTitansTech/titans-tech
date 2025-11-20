'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { UserResponseDto } from '@titans-tech/shared/backend-dtos';

interface CompanyUserContextType {
  companyUser: UserResponseDto | null;
  setCompanyUser: (user: UserResponseDto | null) => void;
}

const CompanyUserContext = createContext<CompanyUserContextType | undefined>(undefined);

export function CompanyUserProvider({ children }: { children: ReactNode }) {
  const [companyUser, setCompanyUser] = useState<UserResponseDto | null>(null);

  return (
    <CompanyUserContext.Provider value={{ companyUser, setCompanyUser }}>
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
