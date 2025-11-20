'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { SysAdminResponseDto } from '@titans-tech/shared/backend-dtos';

interface SysAdminContextType {
  sysAdminUser: SysAdminResponseDto | null;
  setSysAdminUser: (user: SysAdminResponseDto | null) => void;
}

const SysAdminContext = createContext<SysAdminContextType | undefined>(undefined);

export function SysAdminProvider({ children }: { children: ReactNode }) {
  const [sysAdminUser, setSysAdminUser] = useState<SysAdminResponseDto | null>(null);

  return (
    <SysAdminContext.Provider value={{ sysAdminUser, setSysAdminUser }}>
      {children}
    </SysAdminContext.Provider>
  );
}

export function useSysAdmin() {
  const context = useContext(SysAdminContext);
  if (context === undefined) {
    throw new Error('useSysAdmin must be used within a SysAdminProvider');
  }
  return context;
}
