'use client';

import { forwardRef, useImperativeHandle, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { type GibsStageData, ServiceType } from '@/data/types/services.types';
import { GibsForm } from '../forms/GibsForm';
import { isDataTouched } from './utils';
import { SectionContainer } from '../shared/SectionContainer';

// Default empty stage data
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

// Default data for the entire GIBS section (all 7 stages empty)
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

// Validate the entire GIBS section
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

  // For MAINTENANCE, require at least one "before" stage
  if (serviceType === ServiceType.MAINTENANCE) {
    if (!stages.outerBeforeAdjustment && !stages.innerBeforeAdjustment) {
      errors.push(
        'GIBS: For maintenance inspections, you must fill at least one "Before Adjustment" section',
      );
    }
  }

  // For INSPECTION, require at least one "after" stage
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

  // Validate each stage that has data
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
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSectionTouched?: () => void;
  initialData?: any; // GibsCheck data from API
}

// Custom hook for managing a single stage's state
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
  ({ isOpen, onOpenChange, onSectionTouched, initialData }, ref) => {
    // State for all 7 stages
    const outerBeforeAdjustment = useStageState(initialData?.outerBeforeAdjustment);
    const outerAfterAdjustment = useStageState(initialData?.outerAfterAdjustment);
    const outerFreeHangingAfterInstall = useStageState(initialData?.outerFreeHangingAfterInstall);
    const innerBeforeAdjustment = useStageState(initialData?.innerBeforeAdjustment);
    const innerAfterAdjustment = useStageState(initialData?.innerAfterAdjustment);
    const innerBeforeToolInstallation = useStageState(initialData?.innerBeforeToolInstallation);
    const innerAfterToolInstallation = useStageState(initialData?.innerAfterToolInstallation);

    // Global notes
    const [notes, setNotes] = useState(initialData?.notes || '');

    // Wrapper functions to call onSectionTouched
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

        // For MAINTENANCE, require at least one "before" stage
        if (serviceType === ServiceType.MAINTENANCE) {
          if (!stages.outerBeforeAdjustment && !stages.innerBeforeAdjustment) {
            validationErrors.push(
              'GIBS: For maintenance inspections, you must fill at least one "Before Adjustment" section',
            );
          }
        }

        // For INSPECTION, require at least one "after" stage
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

        // Validate each touched stage
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

        // For MAINTENANCE, require at least one "before" stage
        if (serviceType === ServiceType.MAINTENANCE) {
          if (!stages.outerBeforeAdjustment && !stages.innerBeforeAdjustment) {
            validationErrors.push(
              'GIBS: For maintenance inspections, you must fill at least one "Before Adjustment" section',
            );
          }
        }

        // For INSPECTION, require at least one "after" stage
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

        // Validate each touched stage
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
      <SectionContainer title="GIBS" isOpen={isOpen} onOpenChange={onOpenChange}>
        <div className="space-y-6">
          {/* Main tabs: OUTER SLIDE vs INNER SLIDE */}
          <Tabs defaultValue="outer" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="outer">OUTER SLIDE</TabsTrigger>
              <TabsTrigger value="inner">INNER SLIDE</TabsTrigger>
            </TabsList>

            {/* OUTER SLIDE - with collapsible sections */}
            <TabsContent value="outer" className="space-y-6">
              <GibsForm
                slideType="outer"
                beforeAdjustmentData={outerBeforeAdjustment.data}
                afterAdjustmentData={outerAfterAdjustment.data}
                afterInstallData={outerFreeHangingAfterInstall.data}
                onBeforeAdjustmentUpdate={wrapUpdateFn(outerBeforeAdjustment.updateField)}
                onAfterAdjustmentUpdate={wrapUpdateFn(outerAfterAdjustment.updateField)}
                onAfterInstallUpdate={wrapUpdateFn(outerFreeHangingAfterInstall.updateField)}
                beforeAdjustmentErrors={outerBeforeAdjustment.errors}
                afterAdjustmentErrors={outerAfterAdjustment.errors}
                afterInstallErrors={outerFreeHangingAfterInstall.errors}
                handleBeforeBlur={outerBeforeAdjustment.handleBlur}
                handleAfterBlur={outerAfterAdjustment.handleBlur}
                handleAfterInstallBlur={outerFreeHangingAfterInstall.handleBlur}
                data={outerBeforeAdjustment.data}
                updateFn={wrapUpdateFn(outerBeforeAdjustment.updateField)}
                errors={outerBeforeAdjustment.errors}
                handleBlur={outerBeforeAdjustment.handleBlur}
                title="Outer Slide"
              />
            </TabsContent>

            {/* INNER SLIDE - with tabs */}
            <TabsContent value="inner" className="space-y-6">
              <GibsForm
                slideType="inner"
                beforeAdjustmentData={innerBeforeAdjustment.data}
                afterAdjustmentData={innerAfterAdjustment.data}
                onBeforeAdjustmentUpdate={wrapUpdateFn(innerBeforeAdjustment.updateField)}
                onAfterAdjustmentUpdate={wrapUpdateFn(innerAfterAdjustment.updateField)}
                beforeAdjustmentErrors={innerBeforeAdjustment.errors}
                afterAdjustmentErrors={innerAfterAdjustment.errors}
                handleBeforeBlur={innerBeforeAdjustment.handleBlur}
                handleAfterBlur={innerAfterAdjustment.handleBlur}
                data={innerBeforeAdjustment.data}
                updateFn={wrapUpdateFn(innerBeforeAdjustment.updateField)}
                errors={innerBeforeAdjustment.errors}
                handleBlur={innerBeforeAdjustment.handleBlur}
                title="Inner Slide"
              />

              {/* Tool Installation measurements */}
              <div className="mt-6 space-y-4">
                <h3 className="font-semibold">Tool Installation Measurements</h3>
                <Tabs defaultValue="beforeTool" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="beforeTool">Before Tool Installation</TabsTrigger>
                    <TabsTrigger value="afterTool">After Tool Installation</TabsTrigger>
                  </TabsList>

                  <TabsContent value="beforeTool" className="mt-4">
                    <GibsForm
                      slideType="inner"
                      beforeAdjustmentData={innerBeforeToolInstallation.data}
                      onBeforeAdjustmentUpdate={wrapUpdateFn(
                        innerBeforeToolInstallation.updateField,
                      )}
                      beforeAdjustmentErrors={innerBeforeToolInstallation.errors}
                      handleBeforeBlur={innerBeforeToolInstallation.handleBlur}
                      data={innerBeforeToolInstallation.data}
                      updateFn={wrapUpdateFn(innerBeforeToolInstallation.updateField)}
                      errors={innerBeforeToolInstallation.errors}
                      handleBlur={innerBeforeToolInstallation.handleBlur}
                      title="Before Tool Installation"
                    />
                  </TabsContent>

                  <TabsContent value="afterTool" className="mt-4">
                    <GibsForm
                      slideType="inner"
                      beforeAdjustmentData={innerAfterToolInstallation.data}
                      onBeforeAdjustmentUpdate={wrapUpdateFn(innerAfterToolInstallation.updateField)}
                      beforeAdjustmentErrors={innerAfterToolInstallation.errors}
                      handleBeforeBlur={innerAfterToolInstallation.handleBlur}
                      data={innerAfterToolInstallation.data}
                      updateFn={wrapUpdateFn(innerAfterToolInstallation.updateField)}
                      errors={innerAfterToolInstallation.errors}
                      handleBlur={innerAfterToolInstallation.handleBlur}
                      title="After Tool Installation"
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>
          </Tabs>

          {/* Global Notes (Always Visible) */}
          <div className="space-y-2 p-4 border rounded-lg">
            <Label htmlFor="gibs-notes" className="font-medium">
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
            />
          </div>
        </div>
      </SectionContainer>
    );
  },
);

GibsSection.displayName = 'GibsSection';
