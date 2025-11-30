'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Plus, Building2 } from 'lucide-react';
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
import { CompanyColorsSection } from './CompanyColorsSection';
import { type Company } from '@/data/services/companies.api';
import { useState } from 'react';
import { CompanyCreationModal } from './CompanyCreationModal';
import { Card, CardContent } from '@/components/ui/card';

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
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3 flex-1 items-center">
              <Building2 className="h-5 w-5 mt-0.5" />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{t('title')}</h2>
                <p className="text-sm text-muted-foreground mt-1">{t('description')}</p>
              </div>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              {t('createCompany')}
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-select">{t('selectCompany')}</Label>
            <Select value={selectedCompanyId} onValueChange={onSelectCompany} disabled={isLoading}>
              <SelectTrigger id="company-select">
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

          {selectedCompany && <CompanyCard company={selectedCompany} />}

          <CompanyColorsSection selectedCompany={selectedCompany} />

          {selectedCompanyId && (
            <BranchesSection
              companyId={selectedCompanyId}
              selectedBranchId={selectedBranchId}
              onSelectBranch={setSelectedBranchId}
            />
          )}

          {selectedBranchId && <BranchUserManagement branchId={selectedBranchId} />}
        </CardContent>
      </Card>

      <CompanyCreationModal
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
