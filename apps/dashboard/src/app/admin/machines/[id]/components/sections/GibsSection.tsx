'use client';

import { forwardRef, useImperativeHandle, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { GibsStageData } from '@/data/types/services.types';
import { YesNoDncType } from '@/data/types/services.types';
import { GibsForm } from '../forms/GibsForm';
import { isDataTouched } from './utils';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';

export const defaultGibsStageData: GibsStageData = {
  point1: 0,
  point2: 0,
  point3: 0,
  point4: 0,
  point5: 0,
  point6: 0,
  point7: 0,
  point8: 0,
  point9: 0,
  point10: 0,
  point11: 0,
  point12: 0,
  point13: 0,
  point14: 0,
  point15: 0,
  point16: 0,
};

export const validateGibsStageData = (data: GibsStageData): string[] => {
  const errors: string[] = [];
  const requiredFields: (keyof GibsStageData)[] = [
    'point1',
    'point2',
    'point3',
    'point4',
    'point5',
    'point6',
    'point7',
    'point8',
    'point9',
    'point10',
    'point11',
    'point12',
    'point13',
    'point14',
    'point15',
    'point16',
  ];

  requiredFields.forEach((field) => {
    const value = data[field];
    // Only validate if field exists in data
    if (value !== undefined && (typeof value !== 'number' || isNaN(value))) {
      errors.push(`${String(field)} is required and must be a valid number`);
    }
  });

  return errors;
};

export const defaultGibsData: GibsSectionData = {
  outerBeforeAdjustment: undefined,
  outerAfterAdjustment: undefined,
  outerFreeHangingAfterInstall: undefined,
  innerBeforeAdjustment: undefined,
  innerAfterAdjustment: undefined,
  innerBeforeToolInstallation: undefined,
  innerAfterToolInstallation: undefined,
  notes: undefined,
};

export const validateGibsData = (data: GibsSectionData): string[] => {
  const errors: string[] = [];

  const stages = {
    outerBeforeAdjustment: !!data.outerBeforeAdjustment,
    outerAfterAdjustment: !!data.outerAfterAdjustment,
    outerFreeHangingAfterInstall: !!data.outerFreeHangingAfterInstall,
    innerBeforeAdjustment: !!data.innerBeforeAdjustment,
    innerAfterAdjustment: !!data.innerAfterAdjustment,
    innerBeforeToolInstallation: !!data.innerBeforeToolInstallation,
    innerAfterToolInstallation: !!data.innerAfterToolInstallation,
  };

  const hasAnyStage = Object.values(stages).some((stage) => stage);

  if (!hasAnyStage) {
    errors.push('GIBS: You must fill at least one measurement section');
  }

  if (data.outerBeforeAdjustment) {
    const stageErrors = validateGibsStageData(data.outerBeforeAdjustment);
    errors.push(...stageErrors.map((e) => `GIBS outerBeforeAdjustment: ${e}`));
  }
  if (data.outerAfterAdjustment) {
    const stageErrors = validateGibsStageData(data.outerAfterAdjustment);
    errors.push(...stageErrors.map((e) => `GIBS outerAfterAdjustment: ${e}`));
  }
  if (data.outerFreeHangingAfterInstall) {
    const stageErrors = validateGibsStageData(data.outerFreeHangingAfterInstall);
    errors.push(...stageErrors.map((e) => `GIBS outerFreeHangingAfterInstall: ${e}`));
  }
  if (data.innerBeforeAdjustment) {
    const stageErrors = validateGibsStageData(data.innerBeforeAdjustment);
    errors.push(...stageErrors.map((e) => `GIBS innerBeforeAdjustment: ${e}`));
  }
  if (data.innerAfterAdjustment) {
    const stageErrors = validateGibsStageData(data.innerAfterAdjustment);
    errors.push(...stageErrors.map((e) => `GIBS innerAfterAdjustment: ${e}`));
  }
  if (data.innerBeforeToolInstallation) {
    const stageErrors = validateGibsStageData(data.innerBeforeToolInstallation);
    errors.push(...stageErrors.map((e) => `GIBS innerBeforeToolInstallation: ${e}`));
  }
  if (data.innerAfterToolInstallation) {
    const stageErrors = validateGibsStageData(data.innerAfterToolInstallation);
    errors.push(...stageErrors.map((e) => `GIBS innerAfterToolInstallation: ${e}`));
  }

  return errors;
};

export interface GibsSectionData {
  outerBeforeAdjustment?: GibsStageData;
  outerAfterAdjustment?: GibsStageData;
  outerFreeHangingAfterInstall?: GibsStageData;
  haveInnerGibsBeenAdjusted?: 'YES' | 'NO' | 'DNC';
  innerBeforeAdjustment?: GibsStageData;
  innerAfterAdjustment?: GibsStageData;
  innerBeforeToolInstallation?: GibsStageData;
  innerAfterToolInstallation?: GibsStageData;
  notes?: string;
}

export interface GibsSectionRef {
  getData: () => GibsSectionData;
  validate: () => string[];
  reset: () => void;
  isTouched: () => boolean;
  validateAndGetData: () => {
    isValid: boolean;
    errors: string[];
    data?: GibsSectionData;
  };
}

interface GibsSectionProps {
  onSectionTouched?: () => void;
  initialData?: GibsSectionData;
}

function useStageState(initialData?: GibsStageData) {
  const [data, setData] = useState<GibsStageData>(initialData || defaultGibsStageData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof GibsStageData, value: number) => {
    setData((prev: GibsStageData) => ({ ...prev, [field]: value }));
    const fieldKey = String(field);
    if (errors[fieldKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldKey];
        return newErrors;
      });
    }
  };

  const setFieldError = (field: keyof GibsStageData, error: string) => {
    const fieldKey = String(field);
    if (error) {
      setErrors((prev) => ({ ...prev, [fieldKey]: error }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldKey];
        return newErrors;
      });
    }
  };

  const validateField = (field: keyof GibsStageData): string => {
    const value = data[field];
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return 'Invalid number';
    }
    return '';
  };

  const handleBlur = (field: keyof GibsStageData) => {
    const error = validateField(field);
    setFieldError(field, error);
  };

  return { data, setData, errors, updateField, handleBlur };
}

export const GibsSection = forwardRef<GibsSectionRef, GibsSectionProps>(
  ({ onSectionTouched, initialData }, ref) => {
    const outerBeforeAdjustment = useStageState(initialData?.outerBeforeAdjustment);
    const outerAfterAdjustment = useStageState(initialData?.outerAfterAdjustment);
    const outerFreeHangingAfterInstall = useStageState(initialData?.outerFreeHangingAfterInstall);
    const innerBeforeAdjustment = useStageState(initialData?.innerBeforeAdjustment);
    const innerAfterAdjustment = useStageState(initialData?.innerAfterAdjustment);
    const innerBeforeToolInstallation = useStageState(initialData?.innerBeforeToolInstallation);
    const innerAfterToolInstallation = useStageState(initialData?.innerAfterToolInstallation);

    const [notes, setNotes] = useState(initialData?.notes || '');
    const [haveInnerGibsBeenAdjusted, setHaveInnerGibsBeenAdjusted] = useState<
      'YES' | 'NO' | 'DNC' | undefined
    >(initialData?.haveInnerGibsBeenAdjusted);
    const t = useTranslations('inspections');
    const tCommon = useTranslations('common');

    const wrapUpdateFn = (updateFn: (field: keyof GibsStageData, value: number) => void) => {
      return (field: keyof GibsStageData, value: number) => {
        updateFn(field, value);
        onSectionTouched?.();
      };
    };

    useImperativeHandle(ref, () => ({
      isTouched: (): boolean => {
        return (
          isDataTouched(outerBeforeAdjustment.data, defaultGibsStageData) ||
          isDataTouched(outerAfterAdjustment.data, defaultGibsStageData) ||
          isDataTouched(outerFreeHangingAfterInstall.data, defaultGibsStageData) ||
          isDataTouched(innerBeforeAdjustment.data, defaultGibsStageData) ||
          isDataTouched(innerAfterAdjustment.data, defaultGibsStageData) ||
          isDataTouched(innerBeforeToolInstallation.data, defaultGibsStageData) ||
          isDataTouched(innerAfterToolInstallation.data, defaultGibsStageData) ||
          !!notes
        );
      },

      validateAndGetData: (): { isValid: boolean; errors: string[]; data?: GibsSectionData } => {
        const validationErrors: string[] = [];

        const stages = {
          outerBeforeAdjustment: isDataTouched(outerBeforeAdjustment.data, defaultGibsStageData),
          outerAfterAdjustment: isDataTouched(outerAfterAdjustment.data, defaultGibsStageData),
          outerFreeHangingAfterInstall: isDataTouched(
            outerFreeHangingAfterInstall.data,
            defaultGibsStageData,
          ),
          innerBeforeAdjustment: isDataTouched(innerBeforeAdjustment.data, defaultGibsStageData),
          innerAfterAdjustment: isDataTouched(innerAfterAdjustment.data, defaultGibsStageData),
          innerBeforeToolInstallation: isDataTouched(
            innerBeforeToolInstallation.data,
            defaultGibsStageData,
          ),
          innerAfterToolInstallation: isDataTouched(
            innerAfterToolInstallation.data,
            defaultGibsStageData,
          ),
        };

        const hasAnyStage = Object.values(stages).some((stage) => stage);

        if (!hasAnyStage) {
          validationErrors.push('GIBS: You must fill at least one measurement section');
        }

        Object.entries(stages).forEach(([stageName, isTouched]) => {
          if (isTouched) {
            const stageMap: Record<string, typeof outerBeforeAdjustment> = {
              outerBeforeAdjustment,
              outerAfterAdjustment,
              outerFreeHangingAfterInstall,
              innerBeforeAdjustment,
              innerAfterAdjustment,
              innerBeforeToolInstallation,
              innerAfterToolInstallation,
            };

            const stageErrors = validateGibsStageData(stageMap[stageName].data);
            validationErrors.push(...stageErrors.map((e) => `GIBS ${stageName}: ${e}`));
          }
        });

        const isValid = validationErrors.length === 0;

        if (isValid) {
          return {
            isValid: true,
            errors: [],
            data: {
              outerBeforeAdjustment: stages.outerBeforeAdjustment
                ? outerBeforeAdjustment.data
                : undefined,
              outerAfterAdjustment: stages.outerAfterAdjustment
                ? outerAfterAdjustment.data
                : undefined,
              outerFreeHangingAfterInstall: stages.outerFreeHangingAfterInstall
                ? outerFreeHangingAfterInstall.data
                : undefined,
              haveInnerGibsBeenAdjusted,
              innerBeforeAdjustment: stages.innerBeforeAdjustment
                ? innerBeforeAdjustment.data
                : undefined,
              innerAfterAdjustment: stages.innerAfterAdjustment
                ? innerAfterAdjustment.data
                : undefined,
              innerBeforeToolInstallation: stages.innerBeforeToolInstallation
                ? innerBeforeToolInstallation.data
                : undefined,
              innerAfterToolInstallation: stages.innerAfterToolInstallation
                ? innerAfterToolInstallation.data
                : undefined,
              notes: notes || undefined,
            },
          };
        }

        return {
          isValid: false,
          errors: validationErrors,
        };
      },

      getData: (): GibsSectionData => {
        const stages = {
          outerBeforeAdjustment: isDataTouched(outerBeforeAdjustment.data, defaultGibsStageData),
          outerAfterAdjustment: isDataTouched(outerAfterAdjustment.data, defaultGibsStageData),
          outerFreeHangingAfterInstall: isDataTouched(
            outerFreeHangingAfterInstall.data,
            defaultGibsStageData,
          ),
          innerBeforeAdjustment: isDataTouched(innerBeforeAdjustment.data, defaultGibsStageData),
          innerAfterAdjustment: isDataTouched(innerAfterAdjustment.data, defaultGibsStageData),
          innerBeforeToolInstallation: isDataTouched(
            innerBeforeToolInstallation.data,
            defaultGibsStageData,
          ),
          innerAfterToolInstallation: isDataTouched(
            innerAfterToolInstallation.data,
            defaultGibsStageData,
          ),
        };

        return {
          outerBeforeAdjustment: stages.outerBeforeAdjustment
            ? outerBeforeAdjustment.data
            : undefined,
          outerAfterAdjustment: stages.outerAfterAdjustment ? outerAfterAdjustment.data : undefined,
          outerFreeHangingAfterInstall: stages.outerFreeHangingAfterInstall
            ? outerFreeHangingAfterInstall.data
            : undefined,
          haveInnerGibsBeenAdjusted,
          innerBeforeAdjustment: stages.innerBeforeAdjustment
            ? innerBeforeAdjustment.data
            : undefined,
          innerAfterAdjustment: stages.innerAfterAdjustment ? innerAfterAdjustment.data : undefined,
          innerBeforeToolInstallation: stages.innerBeforeToolInstallation
            ? innerBeforeToolInstallation.data
            : undefined,
          innerAfterToolInstallation: stages.innerAfterToolInstallation
            ? innerAfterToolInstallation.data
            : undefined,
          notes: notes || undefined,
        };
      },

      validate: (): string[] => {
        const validationErrors: string[] = [];

        const stages = {
          outerBeforeAdjustment: isDataTouched(outerBeforeAdjustment.data, defaultGibsStageData),
          outerAfterAdjustment: isDataTouched(outerAfterAdjustment.data, defaultGibsStageData),
          outerFreeHangingAfterInstall: isDataTouched(
            outerFreeHangingAfterInstall.data,
            defaultGibsStageData,
          ),
          innerBeforeAdjustment: isDataTouched(innerBeforeAdjustment.data, defaultGibsStageData),
          innerAfterAdjustment: isDataTouched(innerAfterAdjustment.data, defaultGibsStageData),
          innerBeforeToolInstallation: isDataTouched(
            innerBeforeToolInstallation.data,
            defaultGibsStageData,
          ),
          innerAfterToolInstallation: isDataTouched(
            innerAfterToolInstallation.data,
            defaultGibsStageData,
          ),
        };

        const hasAnyStage = Object.values(stages).some((stage) => stage);

        if (!hasAnyStage) {
          validationErrors.push('GIBS: You must fill at least one measurement section');
        }

        Object.entries(stages).forEach(([stageName, isTouched]) => {
          if (isTouched) {
            const stageMap: Record<string, typeof outerBeforeAdjustment> = {
              outerBeforeAdjustment,
              outerAfterAdjustment,
              outerFreeHangingAfterInstall,
              innerBeforeAdjustment,
              innerAfterAdjustment,
              innerBeforeToolInstallation,
              innerAfterToolInstallation,
            };

            const stageErrors = validateGibsStageData(stageMap[stageName].data);
            validationErrors.push(...stageErrors.map((e) => `GIBS ${stageName}: ${e}`));
          }
        });

        return validationErrors;
      },

      reset: () => {
        outerBeforeAdjustment.setData(defaultGibsStageData);
        outerAfterAdjustment.setData(defaultGibsStageData);
        outerFreeHangingAfterInstall.setData(defaultGibsStageData);
        setHaveInnerGibsBeenAdjusted(undefined);
        innerBeforeAdjustment.setData(defaultGibsStageData);
        innerAfterAdjustment.setData(defaultGibsStageData);
        innerBeforeToolInstallation.setData(defaultGibsStageData);
        innerAfterToolInstallation.setData(defaultGibsStageData);
        setNotes('');
      },
    }));

    return (
      <div className="p-6 space-y-6">
        <Tabs defaultValue="outer" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="outer">{t('form.common.outer')}</TabsTrigger>
            <TabsTrigger value="inner">{t('form.common.inner')}</TabsTrigger>
          </TabsList>

          <TabsContent value="outer" className="space-y-4">
            <GibsForm
              slideType="outer"
              beforeAdjustment={{
                data: outerBeforeAdjustment.data,
                onUpdate: wrapUpdateFn(outerBeforeAdjustment.updateField),
                errors: outerBeforeAdjustment.errors,
                handleBlur: outerBeforeAdjustment.handleBlur,
              }}
              afterAdjustment={{
                data: outerAfterAdjustment.data,
                onUpdate: wrapUpdateFn(outerAfterAdjustment.updateField),
                errors: outerAfterAdjustment.errors,
                handleBlur: outerAfterAdjustment.handleBlur,
              }}
              afterInstall={{
                data: outerFreeHangingAfterInstall.data,
                onUpdate: wrapUpdateFn(outerFreeHangingAfterInstall.updateField),
                errors: outerFreeHangingAfterInstall.errors,
                handleBlur: outerFreeHangingAfterInstall.handleBlur,
              }}
            />
            <div className="mt-4">
              <Label htmlFor="have-inner-gibs-been-adjusted" className="text-xs">
                {t('form.gibs.haveInnerGibsBeenAdjusted')}
              </Label>
              <Select
                value={haveInnerGibsBeenAdjusted}
                onValueChange={(value) => {
                  setHaveInnerGibsBeenAdjusted(value as 'YES' | 'NO' | 'DNC');
                  onSectionTouched?.();
                }}
              >
                <SelectTrigger className="mt-1" id="have-inner-gibs-been-adjusted">
                  <SelectValue placeholder={t('form.placeholders.select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={YesNoDncType.YES}>{tCommon('status.yes')}</SelectItem>
                  <SelectItem value={YesNoDncType.NO}>{tCommon('status.no')}</SelectItem>
                  <SelectItem value={YesNoDncType.DNC}>{tCommon('status.dnc')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="inner" className="space-y-4">
            <GibsForm
              slideType="inner"
              beforeAdjustment={{
                data: innerBeforeAdjustment.data,
                onUpdate: wrapUpdateFn(innerBeforeAdjustment.updateField),
                errors: innerBeforeAdjustment.errors,
                handleBlur: innerBeforeAdjustment.handleBlur,
              }}
              afterAdjustment={{
                data: innerAfterAdjustment.data,
                onUpdate: wrapUpdateFn(innerAfterAdjustment.updateField),
                errors: innerAfterAdjustment.errors,
                handleBlur: innerAfterAdjustment.handleBlur,
              }}
              beforeToolInstall={{
                data: innerBeforeToolInstallation.data,
                onUpdate: wrapUpdateFn(innerBeforeToolInstallation.updateField),
                errors: innerBeforeToolInstallation.errors,
                handleBlur: innerBeforeToolInstallation.handleBlur,
              }}
              afterToolInstall={{
                data: innerAfterToolInstallation.data,
                onUpdate: wrapUpdateFn(innerAfterToolInstallation.updateField),
                errors: innerAfterToolInstallation.errors,
                handleBlur: innerAfterToolInstallation.handleBlur,
              }}
            />
          </TabsContent>
        </Tabs>

        <div>
          <Label htmlFor="notes" className="text-xs font-medium mb-2 block">
            {t('form.common.notes')}
          </Label>
          <Input
            id="gibs-notes"
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              onSectionTouched?.();
            }}
            placeholder={t('form.common.additionalNotes')}
            className="text-sm"
          />
        </div>
      </div>
    );
  },
);

GibsSection.displayName = 'GibsSection';
