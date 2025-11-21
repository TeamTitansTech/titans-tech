'use client';

import { forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { type GibsStageData, ServiceType } from '@/data/types/services.types';
import { GibsForm } from '../forms/GibsForm';
import { isDataTouched } from './utils';

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
    if (typeof value !== 'number' || isNaN(value)) {
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

export const validateGibsData = (data: GibsSectionData, serviceType: ServiceType): string[] => {
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

  if (serviceType === ServiceType.MAINTENANCE) {
    if (!stages.outerBeforeAdjustment && !stages.innerBeforeAdjustment) {
      errors.push(
        'GIBS: For maintenance inspections, you must fill at least one "Before Adjustment" section',
      );
    }
  }

  if (serviceType === ServiceType.INSPECTION) {
    const hasAfterStage =
      stages.outerAfterAdjustment ||
      stages.outerFreeHangingAfterInstall ||
      stages.innerAfterAdjustment ||
      stages.innerAfterToolInstallation;

    if (!hasAfterStage) {
      errors.push(
        'GIBS: For routine inspections, you must fill at least one completed measurement section',
      );
    }
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
  innerBeforeAdjustment?: GibsStageData;
  innerAfterAdjustment?: GibsStageData;
  innerBeforeToolInstallation?: GibsStageData;
  innerAfterToolInstallation?: GibsStageData;
  notes?: string;
}

export interface GibsSectionRef {
  getData: () => GibsSectionData;
  validate: (serviceType: ServiceType) => string[];
  reset: () => void;
  isTouched: () => boolean;
  validateAndGetData: (serviceType: ServiceType) => {
    isValid: boolean;
    errors: string[];
    data?: GibsSectionData;
  };
}

interface GibsSectionProps {
  onSectionTouched?: () => void;
  serviceType: ServiceType;
  initialData?: GibsSectionData;
}

function useStageState(initialData?: GibsStageData) {
  const [data, setData] = useState<GibsStageData>(initialData || defaultGibsStageData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof GibsStageData, value: number) => {
    setData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const setFieldError = (field: keyof GibsStageData, error: string) => {
    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
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
  ({ onSectionTouched, serviceType, initialData }, ref) => {
    const t = useTranslations('inspections');

    const outerBeforeAdjustment = useStageState(initialData?.outerBeforeAdjustment);
    const outerAfterAdjustment = useStageState(initialData?.outerAfterAdjustment);
    const outerFreeHangingAfterInstall = useStageState(initialData?.outerFreeHangingAfterInstall);
    const innerBeforeAdjustment = useStageState(initialData?.innerBeforeAdjustment);
    const innerAfterAdjustment = useStageState(initialData?.innerAfterAdjustment);
    const innerBeforeToolInstallation = useStageState(initialData?.innerBeforeToolInstallation);
    const innerAfterToolInstallation = useStageState(initialData?.innerAfterToolInstallation);

    const [notes, setNotes] = useState(initialData?.notes || '');
    const [includeBeforeMeasurements, setIncludeBeforeMeasurements] = useState(false);

    // UI state for collapsibles
    const [isBeforeOpen, setIsBeforeOpen] = useState(true);
    const [isAfterOpen, setIsAfterOpen] = useState(true);

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

      validateAndGetData: (
        serviceType: ServiceType,
      ): { isValid: boolean; errors: string[]; data?: GibsSectionData } => {
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

        if (serviceType === ServiceType.MAINTENANCE) {
          if (!stages.outerBeforeAdjustment && !stages.innerBeforeAdjustment) {
            validationErrors.push(
              'GIBS: For maintenance inspections, you must fill at least one "Before Adjustment" section',
            );
          }
        }

        if (serviceType === ServiceType.INSPECTION) {
          const hasAfterStage =
            stages.outerAfterAdjustment ||
            stages.outerFreeHangingAfterInstall ||
            stages.innerAfterAdjustment ||
            stages.innerAfterToolInstallation;

          if (!hasAfterStage) {
            validationErrors.push(
              'GIBS: For routine inspections, you must fill at least one completed measurement section',
            );
          }
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

      validate: (serviceType: ServiceType): string[] => {
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

        if (serviceType === ServiceType.MAINTENANCE) {
          if (!stages.outerBeforeAdjustment && !stages.innerBeforeAdjustment) {
            validationErrors.push(
              'GIBS: For maintenance inspections, you must fill at least one "Before Adjustment" section',
            );
          }
        }

        if (serviceType === ServiceType.INSPECTION) {
          const hasAfterStage =
            stages.outerAfterAdjustment ||
            stages.outerFreeHangingAfterInstall ||
            stages.innerAfterAdjustment ||
            stages.innerAfterToolInstallation;

          if (!hasAfterStage) {
            validationErrors.push(
              'GIBS: For routine inspections, you must fill at least one completed measurement section',
            );
          }
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
        innerBeforeAdjustment.setData(defaultGibsStageData);
        innerAfterAdjustment.setData(defaultGibsStageData);
        innerBeforeToolInstallation.setData(defaultGibsStageData);
        innerAfterToolInstallation.setData(defaultGibsStageData);
        setNotes('');
      },
    }));

    return (
      <div className="p-6 space-y-6">
        {/* Include Before Measurements Checkbox - Only for Maintenance */}
        {serviceType === ServiceType.MAINTENANCE && (
          <div className="flex items-center space-x-2 pb-4 border-b">
            <Checkbox
              id="includeBeforeMeasurements"
              checked={includeBeforeMeasurements}
              onCheckedChange={(checked) => {
                setIncludeBeforeMeasurements(Boolean(checked));
                onSectionTouched?.();
              }}
            />
            <Label
              htmlFor="includeBeforeMeasurements"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t('form.gibsSection.includeBeforeMeasurements')}
            </Label>
          </div>
        )}

        {includeBeforeMeasurements ? (
          <div className="space-y-8">
            {/* Before Maintenance Section */}
            <Collapsible open={isBeforeOpen} onOpenChange={setIsBeforeOpen}>
              <div className="space-y-4">
                <CollapsibleTrigger className="flex items-center justify-between w-full group">
                  <h4 className="text-lg font-semibold">
                    {t('form.gibsSection.beforeMaintenance')}
                  </h4>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isBeforeOpen ? '' : 'rotate-180'
                    }`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Tabs defaultValue="outer" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="outer">OUTER SLIDE</TabsTrigger>
                      <TabsTrigger value="inner">INNER SLIDE</TabsTrigger>
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
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Divider */}
            <div className="border-t-2 border-border" />

            {/* After Maintenance Section */}
            <Collapsible open={isAfterOpen} onOpenChange={setIsAfterOpen}>
              <div className="space-y-4">
                <CollapsibleTrigger className="flex items-center justify-between w-full group">
                  <h4 className="text-lg font-semibold">
                    {t('form.gibsSection.afterMaintenance')}
                  </h4>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isAfterOpen ? '' : 'rotate-180'
                    }`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Tabs defaultValue="outer" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="outer">OUTER SLIDE</TabsTrigger>
                      <TabsTrigger value="inner">INNER SLIDE</TabsTrigger>
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
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>
        ) : (
          <>
            <Tabs defaultValue="outer" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="outer">OUTER SLIDE</TabsTrigger>
                <TabsTrigger value="inner">INNER SLIDE</TabsTrigger>
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
          </>
        )}

        {/* Global Notes */}
        <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
          <Label htmlFor="gibs-notes" className="text-sm font-medium">
            Notes
          </Label>
          <Textarea
            id="gibs-notes"
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              onSectionTouched?.();
            }}
            placeholder="Enter any additional notes about the GIBS measurements..."
            rows={4}
            className="text-sm"
          />
        </div>
      </div>
    );
  },
);

GibsSection.displayName = 'GibsSection';
