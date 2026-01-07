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
import { getAllBranches, type CompanyBranch } from '@/data/services/company-branches.api';
import { useState, useEffect } from 'react';
import { CompanyCreationModal } from './CompanyCreationModal';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

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
  const tBranches = useTranslations('settings.branches');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [branches, setBranches] = useState<CompanyBranch[] | null>(null);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

  // Fetch branches when selected company changes
  useEffect(() => {
    let cancelled = false;

    const fetchBranches = async () => {
      if (!selectedCompanyId) {
        if (!cancelled) {
          setBranches(null);
          setIsLoadingBranches(false);
        }
        return;
      }

      if (!cancelled) {
        setIsLoadingBranches(true);
      }

      const response = await getAllBranches({ companyId: selectedCompanyId });

      if (cancelled) return;

      if (response.errors) {
        toast.error(tBranches('loadingFailed'));
        setBranches(null);
      } else {
        setBranches(response.data || []);
      }
      setIsLoadingBranches(false);
    };

    fetchBranches();

    return () => {
      cancelled = true;
    };
  }, [selectedCompanyId, tBranches]);

  const handleUserAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleBranchUpdated = async () => {
    if (!selectedCompanyId) return;

    setIsLoadingBranches(true);
    const response = await getAllBranches({ companyId: selectedCompanyId });
    if (response.errors) {
      toast.error(tBranches('loadingFailed'));
    } else {
      setBranches(response.data || []);
    }
    setIsLoadingBranches(false);
  };

  // Wrapper to clear selected branch when company changes
  const handleSelectCompany = (companyId: string) => {
    setSelectedBranchId('');
    onSelectCompany(companyId);
  };

  return (
    <div className="space-y-6" data-testid="company-management-section">
      <Card data-testid="company-management-card">
        <CardContent className="pt-6 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-3 items-start">
              <Building2 className="h-5 w-5 mt-0.5 shrink-0" />
              <div>
                <h2 className="text-base font-semibold sm:text-lg">{t('title')}</h2>
                <p className="text-xs text-muted-foreground mt-1 sm:text-sm">{t('description')}</p>
              </div>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="shrink-0 w-full sm:w-auto"
              data-testid="create-company-button"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('createCompany')}
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-select">{t('selectCompany')}</Label>
            <Select
              value={selectedCompanyId}
              onValueChange={handleSelectCompany}
              disabled={isLoading}
              data-testid="company-selector"
            >
              <SelectTrigger id="company-select" data-testid="company-select-trigger">
                <SelectValue placeholder={t('selectCompanyPlaceholder')} />
              </SelectTrigger>
              <SelectContent data-testid="company-select-content">
                {companies.map((company) => (
                  <SelectItem
                    key={company.id}
                    value={company.id}
                    data-testid={`company-option-${company.id}`}
                  >
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCompany && <CompanyCard company={selectedCompany} />}

          <CompanyColorsSection selectedCompany={selectedCompany} />

          {selectedCompanyId && !isLoadingBranches && (
            <BranchesSection
              companyId={selectedCompanyId}
              selectedBranchId={selectedBranchId}
              onSelectBranch={setSelectedBranchId}
              onUserAdded={handleUserAdded}
              initialBranches={branches}
              onBranchUpdated={handleBranchUpdated}
            />
          )}

          {selectedBranchId && (
            <BranchUserManagement key={refreshKey} branchId={selectedBranchId} />
          )}
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
