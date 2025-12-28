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

interface BranchSettingsSectionProps {
  branchId: string;
}

export function BranchSettingsSection({ branchId }: BranchSettingsSectionProps) {
  const t = useTranslations('settings.branchSettings');
  const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>('INCHES');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <CardTitle className="text-base">{t('title')}</CardTitle>
        </div>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="measurement-unit">{t('defaultUnit')}</Label>
              <p className="text-sm text-muted-foreground">{t('defaultUnitDescription')}</p>
            </div>
            <Select
              value={measurementUnit}
              onValueChange={(value) => handleUnitChange(value as MeasurementUnit)}
              disabled={isSaving}
            >
              <SelectTrigger className="w-[140px]" id="measurement-unit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCHES">{t('inches')}</SelectItem>
                <SelectItem value="MM">{t('mm')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
