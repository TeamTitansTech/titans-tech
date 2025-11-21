'use client';
import { useBranch } from '@/contexts/BranchContext';
import { useCompanyUser } from '@/contexts/CompanyUserContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin } from 'lucide-react';

export function BranchSelector() {
  const { companyUser } = useCompanyUser();
  const { selectedBranchId, setSelectedBranchId } = useBranch();

  console.log('[BranchSelector] Component rendered');
  console.log('[BranchSelector] companyUser:', companyUser);
  console.log('[BranchSelector] selectedBranchId:', selectedBranchId);

  if (!companyUser) {
    console.log('[BranchSelector] No companyUser - returning null');
    return null;
  }

  const accessibleBranches = companyUser.branches;
  console.log('[BranchSelector] accessibleBranches:', accessibleBranches);
  console.log('[BranchSelector] accessibleBranches.length:', accessibleBranches.length);

  if (accessibleBranches.length <= 1) {
    console.log('[BranchSelector] Only 1 or 0 branches - returning null');
    return null;
  }

  return (
    <Select value={selectedBranchId || ''} onValueChange={setSelectedBranchId}>
      <SelectTrigger className="w-[200px]">
        <MapPin className="w-4 h-4 mr-2" />
        <SelectValue placeholder="Select branch" />
      </SelectTrigger>
      <SelectContent>
        {accessibleBranches.map((userBranch) => (
          <SelectItem key={userBranch.branchId} value={userBranch.branchId}>
            {userBranch.branch.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
