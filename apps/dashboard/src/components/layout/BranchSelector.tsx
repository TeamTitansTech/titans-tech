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

  if (!companyUser) return null;

  // Get all branches user has access to
  const accessibleBranches = companyUser.branches;

  // Don't show selector if user has only one branch
  if (accessibleBranches.length <= 1) return null;

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
