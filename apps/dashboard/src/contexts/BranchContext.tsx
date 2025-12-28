'use client';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useCompanyUser } from './CompanyUserContext';

export type MeasurementUnit = 'INCHES' | 'MM';

interface BranchContextType {
  selectedBranchId: string | null;
  setSelectedBranchId: (branchId: string | null) => void;
  selectedBranchName: string | null;
  defaultMeasurementUnit: MeasurementUnit;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const { companyUser } = useCompanyUser();

  // Auto-select branch if user has access to only one branch
  useEffect(() => {
    if (!companyUser || selectedBranchId) return;

    // Get all branches user has access to (any permission)
    const accessibleBranches = companyUser.branches;

    // Auto-select if user has access to exactly one branch
    if (accessibleBranches.length === 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedBranchId(accessibleBranches[0].branchId);
    }
  }, [companyUser, selectedBranchId]);

  // Get selected branch data
  const selectedBranch = companyUser?.branches.find((b) => b.branchId === selectedBranchId)?.branch;
  const selectedBranchName = selectedBranch?.name || null;
  const defaultMeasurementUnit: MeasurementUnit =
    selectedBranch?.defaultMeasurementUnit || 'INCHES';

  return (
    <BranchContext.Provider
      value={{
        selectedBranchId,
        setSelectedBranchId,
        selectedBranchName,
        defaultMeasurementUnit,
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

/**
 * Safe version of useBranch that returns null when outside BranchProvider.
 * Useful for components that may be used in both admin and company contexts.
 */
export function useBranchSafe() {
  return useContext(BranchContext);
}
