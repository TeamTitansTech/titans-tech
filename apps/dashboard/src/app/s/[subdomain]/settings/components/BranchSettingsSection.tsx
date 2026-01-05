'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Settings, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getBranch,
  updateBranch,
  type MeasurementUnit,
} from '@/data/services/company-branches.api';
import { toast } from 'sonner';
import { useCompanyUser } from '@/contexts/CompanyUserContext';
import { hasPermissionInBranch } from '@titans-tech/shared/types';

interface BranchSettingsSectionProps {
  branchId: string;
}

export function BranchSettingsSection({ branchId }: BranchSettingsSectionProps) {
  const t = useTranslations('settings.branchSettings');
  const { companyUser } = useCompanyUser();
  const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>('INCHES');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Check if user has permission to update branch settings
  const canUpdateBranches = hasPermissionInBranch(companyUser, branchId, 'updateBranches');

  useEffect(() => {
    const fetchBranchSettings = async () => {
      setIsLoading(true);
      const response = await getBranch({ branchId });

      if (response.data) {
        setMeasurementUnit(response.data.defaultMeasurementUnit || 'INCHES');
      }
      setIsLoading(false);
    };

    fetchBranchSettings();
  }, [branchId]);

  const handleUnitChange = async (value: MeasurementUnit) => {
    setIsSaving(true);
    const previousValue = measurementUnit;
    setMeasurementUnit(value);

    const response = await updateBranch({
      branchId,
      data: { defaultMeasurementUnit: value },
    });

    if (response.errors) {
      setMeasurementUnit(previousValue);
      toast.error(t('saveError'));
    } else {
      toast.success(t('saved'));
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <CardTitle className="text-base">{t('title')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="branch-settings-section">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <CardTitle className="text-base">{t('title')}</CardTitle>
        </div>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {canUpdateBranches ? (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="measurement-unit">{t('defaultUnit')}</Label>
                <p className="text-sm text-muted-foreground">{t('defaultUnitDescription')}</p>
              </div>
              <Select
                value={measurementUnit}
                onValueChange={(value) => handleUnitChange(value as MeasurementUnit)}
                disabled={isSaving}
                data-testid="measurement-unit-select"
              >
                <SelectTrigger
                  className="w-[140px]"
                  id="measurement-unit"
                  data-testid="measurement-unit-trigger"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCHES" data-testid="measurement-unit-inches">
                    {t('inches')}
                  </SelectItem>
                  <SelectItem value="MM" data-testid="measurement-unit-mm">
                    {t('mm')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div
              className="rounded-lg bg-muted p-4 text-center"
              data-testid="no-update-permission-message"
            >
              <p className="text-sm text-muted-foreground">
                {t('noUpdatePermission') ||
                  'Você não tem permissão para alterar as configurações desta filial.'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
