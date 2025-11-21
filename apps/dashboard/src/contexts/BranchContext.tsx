'use client';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useCompanyUser } from './CompanyUserContext';

interface BranchContextType {
  selectedBranchId: string | null;
  setSelectedBranchId: (branchId: string | null) => void;
  selectedBranchName: string | null;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const { companyUser } = useCompanyUser();

  useEffect(() => {
    if (!companyUser || selectedBranchId) {
      return;
    }

    const accessibleBranches = companyUser.branches;

    if (accessibleBranches.length === 1) {
      setSelectedBranchId(accessibleBranches[0].branchId);
    }
  }, [companyUser, selectedBranchId]);

  const selectedBranchName =
    companyUser?.branches.find((b) => b.branchId === selectedBranchId)?.branch.name || null;

  return (
    <BranchContext.Provider
      value={{
        selectedBranchId,
        setSelectedBranchId,
        selectedBranchName,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
}
