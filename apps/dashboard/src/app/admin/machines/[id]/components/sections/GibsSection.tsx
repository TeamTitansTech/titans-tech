'use client';

import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { GibsStageData, Attachment } from '@/data/types/services.types';
import { YesNoDncType } from '@/data/types/services.types';
import { GibsForm } from '../forms/GibsForm';
import { isDataTouched } from './utils';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { DocumentUpload } from '@/components/ui/document-upload';
import { Typography } from '@/components/ui/typography';

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
  outerBefore: undefined,
  outerData: undefined,
  outerFreeHangingData: undefined,
  innerBefore: undefined,
  innerData: undefined,
  innerBeforeTool: undefined,
  innerDataTool: undefined,
  notes: undefined,
};

export const validateGibsData = (data: GibsSectionData): string[] => {
  const errors: string[] = [];

  const stages = {
    outerBefore: !!data.outerBefore,
    outerData: !!data.outerData,
    outerFreeHangingData: !!data.outerFreeHangingData,
    innerBefore: !!data.innerBefore,
    innerData: !!data.innerData,
    innerBeforeTool: !!data.innerBeforeTool,
    innerDataTool: !!data.innerDataTool,
  };

  const hasAnyStage = Object.values(stages).some((stage) => stage);

  if (!hasAnyStage) {
    errors.push('GIBS: You must fill at least one measurement section');
  }

  if (data.outerBefore) {
    const stageErrors = validateGibsStageData(data.outerBefore);
    errors.push(...stageErrors.map((e) => `GIBS outerBefore: ${e}`));
  }
  if (data.outerData) {
    const stageErrors = validateGibsStageData(data.outerData);
    errors.push(...stageErrors.map((e) => `GIBS outerData: ${e}`));
  }
  if (data.outerFreeHangingData) {
    const stageErrors = validateGibsStageData(data.outerFreeHangingData);
    errors.push(...stageErrors.map((e) => `GIBS outerFreeHangingData: ${e}`));
  }
  if (data.innerBefore) {
    const stageErrors = validateGibsStageData(data.innerBefore);
    errors.push(...stageErrors.map((e) => `GIBS innerBefore: ${e}`));
  }
  if (data.innerData) {
    const stageErrors = validateGibsStageData(data.innerData);
    errors.push(...stageErrors.map((e) => `GIBS innerData: ${e}`));
  }
  if (data.innerBeforeTool) {
    const stageErrors = validateGibsStageData(data.innerBeforeTool);
    errors.push(...stageErrors.map((e) => `GIBS innerBeforeTool: ${e}`));
  }
  if (data.innerDataTool) {
    const stageErrors = validateGibsStageData(data.innerDataTool);
    errors.push(...stageErrors.map((e) => `GIBS innerDataTool: ${e}`));
  }

  return errors;
};

export interface GibsSectionData {
  outerBefore?: GibsStageData;
  outerData?: GibsStageData;
  outerFreeHangingData?: GibsStageData;
  haveInnerGibsBeenAdjusted?: 'YES' | 'NO' | 'DNC';
  innerBefore?: GibsStageData;
  innerData?: GibsStageData;
  innerBeforeTool?: GibsStageData;
  innerDataTool?: GibsStageData;
  notes?: string;
  attachments?: Attachment[];
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

  // Update state when initialData changes (e.g., when loading saved data)
  // Use JSON.stringify for deep comparison since initialData is an object
  useEffect(() => {
    if (initialData && JSON.stringify(initialData) !== JSON.stringify(data)) {
      setData(initialData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialData)]);

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
    const outerBefore = useStageState(initialData?.outerBefore);
    const outerData = useStageState(initialData?.outerData);
    const outerFreeHangingData = useStageState(initialData?.outerFreeHangingData);
    const innerBefore = useStageState(initialData?.innerBefore);
    const innerData = useStageState(initialData?.innerData);
    const innerBeforeTool = useStageState(initialData?.innerBeforeTool);
    const innerDataTool = useStageState(initialData?.innerDataTool);

    const [notes, setNotes] = useState(initialData?.notes || '');
    const [attachments, setAttachments] = useState<Attachment[]>(initialData?.attachments ?? []);
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
          isDataTouched(outerBefore.data, defaultGibsStageData) ||
          isDataTouched(outerData.data, defaultGibsStageData) ||
          isDataTouched(outerFreeHangingData.data, defaultGibsStageData) ||
          isDataTouched(innerBefore.data, defaultGibsStageData) ||
          isDataTouched(innerData.data, defaultGibsStageData) ||
          isDataTouched(innerBeforeTool.data, defaultGibsStageData) ||
          isDataTouched(innerDataTool.data, defaultGibsStageData) ||
          !!notes
        );
      },

      validateAndGetData: (): { isValid: boolean; errors: string[]; data?: GibsSectionData } => {
        const validationErrors: string[] = [];

        const stages = {
          outerBefore: isDataTouched(outerBefore.data, defaultGibsStageData),
          outerData: isDataTouched(outerData.data, defaultGibsStageData),
          outerFreeHangingData: isDataTouched(outerFreeHangingData.data, defaultGibsStageData),
          innerBefore: isDataTouched(innerBefore.data, defaultGibsStageData),
          innerData: isDataTouched(innerData.data, defaultGibsStageData),
          innerBeforeTool: isDataTouched(innerBeforeTool.data, defaultGibsStageData),
          innerDataTool: isDataTouched(innerDataTool.data, defaultGibsStageData),
        };

        const hasAnyStage = Object.values(stages).some((stage) => stage);

        if (!hasAnyStage) {
          validationErrors.push('GIBS: You must fill at least one measurement section');
        }

        Object.entries(stages).forEach(([stageName, isTouched]) => {
          if (isTouched) {
            const stageMap: Record<string, typeof outerBefore> = {
              outerBefore,
              outerData,
              outerFreeHangingData,
              innerBefore,
              innerData,
              innerBeforeTool,
              innerDataTool,
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
              outerBefore: stages.outerBefore ? outerBefore.data : undefined,
              outerData: stages.outerData ? outerData.data : undefined,
              outerFreeHangingData: stages.outerFreeHangingData
                ? outerFreeHangingData.data
                : undefined,
              haveInnerGibsBeenAdjusted,
              innerBefore: stages.innerBefore ? innerBefore.data : undefined,
              innerData: stages.innerData ? innerData.data : undefined,
              innerBeforeTool: stages.innerBeforeTool ? innerBeforeTool.data : undefined,
              innerDataTool: stages.innerDataTool ? innerDataTool.data : undefined,
              notes: notes || undefined,
              attachments,
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
          outerBefore: isDataTouched(outerBefore.data, defaultGibsStageData),
          outerData: isDataTouched(outerData.data, defaultGibsStageData),
          outerFreeHangingData: isDataTouched(outerFreeHangingData.data, defaultGibsStageData),
          innerBefore: isDataTouched(innerBefore.data, defaultGibsStageData),
          innerData: isDataTouched(innerData.data, defaultGibsStageData),
          innerBeforeTool: isDataTouched(innerBeforeTool.data, defaultGibsStageData),
          innerDataTool: isDataTouched(innerDataTool.data, defaultGibsStageData),
        };

        return {
          outerBefore: stages.outerBefore ? outerBefore.data : undefined,
          outerData: stages.outerData ? outerData.data : undefined,
          outerFreeHangingData: stages.outerFreeHangingData ? outerFreeHangingData.data : undefined,
          haveInnerGibsBeenAdjusted,
          innerBefore: stages.innerBefore ? innerBefore.data : undefined,
          innerData: stages.innerData ? innerData.data : undefined,
          innerBeforeTool: stages.innerBeforeTool ? innerBeforeTool.data : undefined,
          innerDataTool: stages.innerDataTool ? innerDataTool.data : undefined,
          notes: notes || undefined,
          attachments,
        };
      },

      validate: (): string[] => {
        const validationErrors: string[] = [];

        const stages = {
          outerBefore: isDataTouched(outerBefore.data, defaultGibsStageData),
          outerData: isDataTouched(outerData.data, defaultGibsStageData),
          outerFreeHangingData: isDataTouched(outerFreeHangingData.data, defaultGibsStageData),
          innerBefore: isDataTouched(innerBefore.data, defaultGibsStageData),
          innerData: isDataTouched(innerData.data, defaultGibsStageData),
          innerBeforeTool: isDataTouched(innerBeforeTool.data, defaultGibsStageData),
          innerDataTool: isDataTouched(innerDataTool.data, defaultGibsStageData),
        };

        const hasAnyStage = Object.values(stages).some((stage) => stage);

        if (!hasAnyStage) {
          validationErrors.push('GIBS: You must fill at least one measurement section');
        }

        Object.entries(stages).forEach(([stageName, isTouched]) => {
          if (isTouched) {
            const stageMap: Record<string, typeof outerBefore> = {
              outerBefore,
              outerData,
              outerFreeHangingData,
              innerBefore,
              innerData,
              innerBeforeTool,
              innerDataTool,
            };

            const stageErrors = validateGibsStageData(stageMap[stageName].data);
            validationErrors.push(...stageErrors.map((e) => `GIBS ${stageName}: ${e}`));
          }
        });

        return validationErrors;
      },

      reset: () => {
        outerBefore.setData(defaultGibsStageData);
        outerData.setData(defaultGibsStageData);
        outerFreeHangingData.setData(defaultGibsStageData);
        setHaveInnerGibsBeenAdjusted(undefined);
        innerBefore.setData(defaultGibsStageData);
        innerData.setData(defaultGibsStageData);
        innerBeforeTool.setData(defaultGibsStageData);
        innerDataTool.setData(defaultGibsStageData);
        setNotes('');
      },
    }));

    return (
      <div className="space-y-6">
        <Tabs defaultValue="outer" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="outer">{t('form.common.outer')}</TabsTrigger>
            <TabsTrigger value="inner">{t('form.common.inner')}</TabsTrigger>
          </TabsList>
          <TabsContent value="outer" className="space-y-4">
            <GibsForm
              slideType="outer"
              beforeAdjustment={{
                data: outerBefore.data,
                onUpdate: wrapUpdateFn(outerBefore.updateField),
                errors: outerBefore.errors,
                handleBlur: outerBefore.handleBlur,
              }}
              afterAdjustment={{
                data: outerData.data,
                onUpdate: wrapUpdateFn(outerData.updateField),
                errors: outerData.errors,
                handleBlur: outerData.handleBlur,
              }}
              afterInstall={{
                data: outerFreeHangingData.data,
                onUpdate: wrapUpdateFn(outerFreeHangingData.updateField),
                errors: outerFreeHangingData.errors,
                handleBlur: outerFreeHangingData.handleBlur,
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
                data: innerBefore.data,
                onUpdate: wrapUpdateFn(innerBefore.updateField),
                errors: innerBefore.errors,
                handleBlur: innerBefore.handleBlur,
              }}
              afterAdjustment={{
                data: innerData.data,
                onUpdate: wrapUpdateFn(innerData.updateField),
                errors: innerData.errors,
                handleBlur: innerData.handleBlur,
              }}
              beforeToolInstall={{
                data: innerBeforeTool.data,
                onUpdate: wrapUpdateFn(innerBeforeTool.updateField),
                errors: innerBeforeTool.errors,
                handleBlur: innerBeforeTool.handleBlur,
              }}
              afterToolInstall={{
                data: innerDataTool.data,
                onUpdate: wrapUpdateFn(innerDataTool.updateField),
                errors: innerDataTool.errors,
                handleBlur: innerDataTool.handleBlur,
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

        {/* Section Attachments */}
        <div className="pt-4 border-t">
          <Typography variant="h4" className="mb-3">
            {t('form.common.attachments')}
          </Typography>
          <DocumentUpload
            value={attachments}
            onChange={(files) => {
              setAttachments(files);
              onSectionTouched?.();
            }}
            maxFiles={10}
          />
        </div>
      </div>
    );
  },
);

GibsSection.displayName = 'GibsSection';
