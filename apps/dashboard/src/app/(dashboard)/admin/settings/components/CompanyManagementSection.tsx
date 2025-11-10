'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CompanyCard } from './CompanyCard';
import { BranchesSection } from './BranchesSection';
import { BranchUserManagement } from './BranchUserManagement';
import { type Company } from '@/data/services/companies.api';
import { useState } from 'react';
import { CreateCompanyDialog } from './CreateCompanyDialog';

interface CompanyManagementSectionProps {
  companies: Company[];
  selectedCompanyId: string;
  onSelectCompany: (companyId: string) => void;
  isLoading: boolean;
  selectedCompany?: Company;
}

export function CompanyManagementSection({
  companies,
  selectedCompanyId,
  onSelectCompany,
  isLoading,
  selectedCompany,
}: CompanyManagementSectionProps) {
  const t = useTranslations('adminSettings.companyManagement');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between max-w-4xl">
        <div className="space-y-2 flex-1 w-full sm:w-auto">
          <Label htmlFor="company-select">{t('selectCompany')}</Label>
          <Select value={selectedCompanyId} onValueChange={onSelectCompany} disabled={isLoading}>
            <SelectTrigger id="company-select" className="w-full sm:w-[400px]">
              <SelectValue placeholder={t('selectCompanyPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setIsCreateDialogOpen(true)} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          {t('createCompany')}
        </Button>
      </div>

      {selectedCompany && <CompanyCard company={selectedCompany} />}

      {selectedCompanyId && (
        <BranchesSection
          companyId={selectedCompanyId}
          selectedBranchId={selectedBranchId}
          onSelectBranch={setSelectedBranchId}
        />
      )}

      {selectedBranchId && <BranchUserManagement branchId={selectedBranchId} />}

      <CreateCompanyDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          // Refresh companies list
          window.location.reload();
        }}
      />
    </div>
  );
}
