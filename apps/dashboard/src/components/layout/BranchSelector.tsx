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
import { useTranslations } from 'next-intl';

export function BranchSelector() {
  const { companyUser } = useCompanyUser();
  const { selectedBranchId, setSelectedBranchId } = useBranch();
  const t = useTranslations('common');

  if (!companyUser) return null;

  const accessibleBranches = companyUser.branches;
  if (accessibleBranches.length === 0) return null;

  // If only one branch, show it but make it disabled
  const isDisabled = accessibleBranches.length === 1;

  return (
    <Select
      value={selectedBranchId || ''}
      onValueChange={setSelectedBranchId}
      disabled={isDisabled}
    >
      <SelectTrigger className="w-full">
        <MapPin className="w-4 h-4 mr-2" />
        <SelectValue placeholder={t('selectBranch')} />
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
