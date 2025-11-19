'use client';

import { useState, forwardRef, useImperativeHandle, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronDown } from 'lucide-react';
import { type GibsData, ServiceType, YesNoDncType } from '@/data/types/services.types';
import { GibsForm } from '../forms/GibsForm';
import { isDataTouched } from './utils';
import { useGibsState } from '../../hooks/useGibsState';
import { type GibsStageData } from '@/hooks/useGibsCalculations';

// Helper function to convert old GibsData (point1-16) to new GibsStageData (position1-16)
const convertGibsDataToStageData = (data: GibsData): GibsStageData => {
  return {
    position1: data.point1,
    position2: data.point2,
    position3: data.point3,
    position4: data.point4,
    position5: data.point5,
    position6: data.point6,
    position7: data.point7,
    position8: data.point8,
    position9: data.point9,
    position10: data.point10,
    position11: data.point11,
    position12: data.point12,
    position13: data.point13,
    position14: data.point14,
    position15: data.point15,
    position16: data.point16,
  };
};

// Helper function to convert field names from position* to point*
const convertPositionFieldToPointField = (field: keyof GibsStageData): keyof GibsData | null => {
  const match = field.match(/^position(\d+)$/);
  if (match) {
    return `point${match[1]}` as keyof GibsData;
  }
  return null;
};

export const defaultGibsData: GibsData = {
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
  leftTop: 0,
  leftBottom: 0,
  rightTop: 0,
  rightBottom: 0,
  frontTop: 0,
  frontBottom: 0,
  backTop: 0,
  backBottom: 0,
};

export const validateGibsData = (data: GibsData): string[] => {
  const errors: string[] = [];
  const requiredFields: (keyof GibsData)[] = [
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

export interface GibsSectionData {
  outerBefore?: GibsData;
  outerAfter?: GibsData;
  innerBefore?: GibsData;
  innerAfter?: GibsData;
  hasBeenAdjusted?: YesNoDncType;
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
}

export const GibsSection = forwardRef<GibsSectionRef, GibsSectionProps>(
  ({ onSectionTouched, serviceType }, ref) => {
    const t = useTranslations('inspections');

    // Use custom hook for state management
    const {
      includeBeforeMeasurements,
      setIncludeBeforeMeasurements,
      outerBeforeData,
      outerAfterData,
      innerBeforeData,
      innerAfterData,
      hasBeenAdjusted,
      setHasBeenAdjusted,
      notes,
      setNotes,
      outerBeforeErrors,
      outerAfterErrors,
      innerBeforeErrors,
      innerAfterErrors,
      updateOuterBeforeField: baseUpdateOuterBefore,
      updateOuterAfterField: baseUpdateOuterAfter,
      updateInnerBeforeField: baseUpdateInnerBefore,
      updateInnerAfterField: baseUpdateInnerAfter,
      reset,
    } = useGibsState();

    // UI state
    const [isBeforeOpen, setIsBeforeOpen] = useState(true);
    const [isAfterOpen, setIsAfterOpen] = useState(true);

    // Convert GibsData to format expected by GibsForm (with stage structure)
    // Using useMemo to prevent unnecessary re-renders that could cause input to lose focus
    // Note: GibsForm with type="outer" renders multiple stages, so we need to provide all of them
    const outerBeforeFormData = useMemo(
      () => ({
        outerBeforeAdjustment: convertGibsDataToStageData(outerBeforeData),
        outerAfterAdjustment: convertGibsDataToStageData(outerAfterData),
      }),
      [outerBeforeData, outerAfterData],
    );
    const outerAfterFormData = useMemo(
      () => ({
        outerAfterAdjustment: convertGibsDataToStageData(outerAfterData),
        outerAfterInstallation: convertGibsDataToStageData(outerAfterData),
      }),
      [outerAfterData],
    );
    const innerBeforeFormData = useMemo(
      () => ({
        innerBeforeAdjustment: convertGibsDataToStageData(innerBeforeData),
        innerAfterAdjustment: convertGibsDataToStageData(innerAfterData),
        innerBeforeInstallation: convertGibsDataToStageData(innerBeforeData),
      }),
      [innerBeforeData, innerAfterData],
    );
    const innerAfterFormData = useMemo(
      () => ({
        innerAfterAdjustment: convertGibsDataToStageData(innerAfterData),
        innerAfterInstallation: convertGibsDataToStageData(innerAfterData),
      }),
      [innerAfterData],
    );

    // Adapter update functions that convert from GibsStageData format back to GibsData format
    const updateOuterBeforeFieldAdapter = (
      stage:
        | 'outerBeforeAdjustment'
        | 'outerAfterAdjustment'
        | 'outerAfterInstallation'
        | 'innerBeforeAdjustment'
        | 'innerAfterAdjustment'
        | 'innerBeforeInstallation'
        | 'innerAfterInstallation',
      field: keyof GibsStageData,
      value: number | undefined,
    ) => {
      const pointField = convertPositionFieldToPointField(field);
      if (pointField) {
        baseUpdateOuterBefore(pointField, value);
        onSectionTouched?.();
      }
    };

    const updateOuterAfterFieldAdapter = (
      stage:
        | 'outerBeforeAdjustment'
        | 'outerAfterAdjustment'
        | 'outerAfterInstallation'
        | 'innerBeforeAdjustment'
        | 'innerAfterAdjustment'
        | 'innerBeforeInstallation'
        | 'innerAfterInstallation',
      field: keyof GibsStageData,
      value: number | undefined,
    ) => {
      const pointField = convertPositionFieldToPointField(field);
      if (pointField) {
        baseUpdateOuterAfter(pointField, value);
        onSectionTouched?.();
      }
    };

    const updateInnerBeforeFieldAdapter = (
      stage:
        | 'outerBeforeAdjustment'
        | 'outerAfterAdjustment'
        | 'outerAfterInstallation'
        | 'innerBeforeAdjustment'
        | 'innerAfterAdjustment'
        | 'innerBeforeInstallation'
        | 'innerAfterInstallation',
      field: keyof GibsStageData,
      value: number | undefined,
    ) => {
      const pointField = convertPositionFieldToPointField(field);
      if (pointField) {
        baseUpdateInnerBefore(pointField, value);
        onSectionTouched?.();
      }
    };

    const updateInnerAfterFieldAdapter = (
      stage:
        | 'outerBeforeAdjustment'
        | 'outerAfterAdjustment'
        | 'outerAfterInstallation'
        | 'innerBeforeAdjustment'
        | 'innerAfterAdjustment'
        | 'innerBeforeInstallation'
        | 'innerAfterInstallation',
      field: keyof GibsStageData,
      value: number | undefined,
    ) => {
      const pointField = convertPositionFieldToPointField(field);
      if (pointField) {
        baseUpdateInnerAfter(pointField, value);
        onSectionTouched?.();
      }
    };

    useImperativeHandle(ref, () => ({
      getData: (): GibsSectionData => {
        const outerBeforeTouched = isDataTouched(outerBeforeData, defaultGibsData);
        const outerAfterTouched = isDataTouched(outerAfterData, defaultGibsData);
        const innerBeforeTouched = isDataTouched(innerBeforeData, defaultGibsData);
        const innerAfterTouched = isDataTouched(innerAfterData, defaultGibsData);

        return {
          outerBefore:
            includeBeforeMeasurements && outerBeforeTouched ? outerBeforeData : undefined,
          outerAfter: outerAfterTouched ? outerAfterData : undefined,
          innerBefore:
            includeBeforeMeasurements && innerBeforeTouched ? innerBeforeData : undefined,
          innerAfter: innerAfterTouched ? innerAfterData : undefined,
          hasBeenAdjusted,
          notes: notes || undefined,
        };
      },

      validate: (serviceType: ServiceType): string[] => {
        const errors: string[] = [];
        const outerBeforeTouched = isDataTouched(outerBeforeData, defaultGibsData);
        const outerAfterTouched = isDataTouched(outerAfterData, defaultGibsData);
        const innerBeforeTouched = isDataTouched(innerBeforeData, defaultGibsData);
        const innerAfterTouched = isDataTouched(innerAfterData, defaultGibsData);

        // Validate before measurements if checkbox is enabled
        if (includeBeforeMeasurements) {
          if (serviceType === ServiceType.MAINTENANCE) {
            if (!outerBeforeTouched || !innerBeforeTouched) {
              errors.push(
                'Gibs: When "Include Before Measurements" is enabled for maintenance, you must fill all "Before" sections (Outer Before and Inner Before)',
              );
            } else {
              errors.push(
                ...validateGibsData(outerBeforeData).map((e) => `Gibs Outer Before: ${e}`),
              );
              errors.push(
                ...validateGibsData(innerBeforeData).map((e) => `Gibs Inner Before: ${e}`),
              );
            }
          }

          if (outerBeforeTouched) {
            errors.push(...validateGibsData(outerBeforeData).map((e) => `Gibs Outer Before: ${e}`));
          }
          if (innerBeforeTouched) {
            errors.push(...validateGibsData(innerBeforeData).map((e) => `Gibs Inner Before: ${e}`));
          }
        }

        // Validate after measurements
        if (outerAfterTouched) {
          errors.push(...validateGibsData(outerAfterData).map((e) => `Gibs Outer After: ${e}`));
        }
        if (innerAfterTouched) {
          errors.push(...validateGibsData(innerAfterData).map((e) => `Gibs Inner After: ${e}`));
        }

        // Validate at least one measurement set
        if (!outerAfterTouched && !innerAfterTouched) {
          errors.push(
            'Gibs: You must fill at least one "After" section (Outer After or Inner After)',
          );
        }

        return errors;
      },

      reset,

      isTouched: (): boolean => {
        const outerBeforeTouched = isDataTouched(outerBeforeData, defaultGibsData);
        const outerAfterTouched = isDataTouched(outerAfterData, defaultGibsData);
        const innerBeforeTouched = isDataTouched(innerBeforeData, defaultGibsData);
        const innerAfterTouched = isDataTouched(innerAfterData, defaultGibsData);
        return outerBeforeTouched || outerAfterTouched || innerBeforeTouched || innerAfterTouched;
      },

      validateAndGetData: (
        serviceType: ServiceType,
      ): { isValid: boolean; errors: string[]; data?: GibsSectionData } => {
        const errors: string[] = [];
        const outerBeforeTouched = isDataTouched(outerBeforeData, defaultGibsData);
        const outerAfterTouched = isDataTouched(outerAfterData, defaultGibsData);
        const innerBeforeTouched = isDataTouched(innerBeforeData, defaultGibsData);
        const innerAfterTouched = isDataTouched(innerAfterData, defaultGibsData);

        // Validate before measurements if checkbox is enabled
        if (includeBeforeMeasurements) {
          if (serviceType === ServiceType.MAINTENANCE) {
            if (!outerBeforeTouched || !innerBeforeTouched) {
              errors.push(
                'Gibs: When "Include Before Measurements" is enabled for maintenance, you must fill all "Before" sections (Outer Before and Inner Before)',
              );
            } else {
              errors.push(
                ...validateGibsData(outerBeforeData).map((e) => `Gibs Outer Before: ${e}`),
              );
              errors.push(
                ...validateGibsData(innerBeforeData).map((e) => `Gibs Inner Before: ${e}`),
              );
            }
          }

          if (outerBeforeTouched) {
            errors.push(...validateGibsData(outerBeforeData).map((e) => `Gibs Outer Before: ${e}`));
          }
          if (innerBeforeTouched) {
            errors.push(...validateGibsData(innerBeforeData).map((e) => `Gibs Inner Before: ${e}`));
          }
        }

        // Validate after measurements
        if (outerAfterTouched) {
          errors.push(...validateGibsData(outerAfterData).map((e) => `Gibs Outer After: ${e}`));
        }
        if (innerAfterTouched) {
          errors.push(...validateGibsData(innerAfterData).map((e) => `Gibs Inner After: ${e}`));
        }

        // Validate at least one measurement set
        if (!outerAfterTouched && !innerAfterTouched) {
          errors.push(
            'Gibs: You must fill at least one "After" section (Outer After or Inner After)',
          );
        }

        if (errors.length > 0) {
          return { isValid: false, errors };
        }

        const data: GibsSectionData = {
          outerBefore:
            includeBeforeMeasurements && outerBeforeTouched ? outerBeforeData : undefined,
          outerAfter: outerAfterTouched ? outerAfterData : undefined,
          innerBefore:
            includeBeforeMeasurements && innerBeforeTouched ? innerBeforeData : undefined,
          innerAfter: innerAfterTouched ? innerAfterData : undefined,
          hasBeenAdjusted,
          notes: notes || undefined,
        };

        return { isValid: true, errors: [], data };
      },
    }));

    return (
      <div className="border rounded-lg p-6 bg-card">
        <h3 className="text-base font-semibold mb-4">Gibs</h3>

        <div className="space-y-6">
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

          <div className="space-y-2">
            <Label htmlFor="hasBeenAdjusted" className="text-xs font-semibold">
              {t('form.gibs.hasBeenAdjusted')}
            </Label>
            <Select
              value={hasBeenAdjusted}
              onValueChange={(value: YesNoDncType) => {
                setHasBeenAdjusted(value);
                onSectionTouched?.();
              }}
            >
              <SelectTrigger id="hasBeenAdjusted">
                <SelectValue placeholder={t('form.common.selectOption')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={YesNoDncType.YES}>Sim</SelectItem>
                <SelectItem value={YesNoDncType.NO}>Não</SelectItem>
                <SelectItem value={YesNoDncType.DNC}>DNC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {includeBeforeMeasurements ? (
            <div className="space-y-8">
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
                        <TabsTrigger value="outer">{t('form.common.outer')}</TabsTrigger>
                        <TabsTrigger value="inner">{t('form.common.inner')}</TabsTrigger>
                      </TabsList>

                      <TabsContent value="outer" className="space-y-6">
                        <GibsForm
                          data={outerBeforeFormData}
                          updateFn={updateOuterBeforeFieldAdapter}
                          errors={outerBeforeErrors}
                          type="outer"
                        />
                      </TabsContent>

                      <TabsContent value="inner" className="space-y-6">
                        <GibsForm
                          data={innerBeforeFormData}
                          updateFn={updateInnerBeforeFieldAdapter}
                          errors={innerBeforeErrors}
                          type="inner"
                        />
                      </TabsContent>
                    </Tabs>
                  </CollapsibleContent>
                </div>
              </Collapsible>

              <div className="border-t-2 border-border" />

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
                        <TabsTrigger value="outer">{t('form.common.outer')}</TabsTrigger>
                        <TabsTrigger value="inner">{t('form.common.inner')}</TabsTrigger>
                      </TabsList>

                      <TabsContent value="outer" className="space-y-6">
                        <GibsForm
                          data={outerAfterFormData}
                          updateFn={updateOuterAfterFieldAdapter}
                          errors={outerAfterErrors}
                          type="outer"
                        />
                      </TabsContent>

                      <TabsContent value="inner" className="space-y-6">
                        <GibsForm
                          data={innerAfterFormData}
                          updateFn={updateInnerAfterFieldAdapter}
                          errors={innerAfterErrors}
                          type="inner"
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
                  <TabsTrigger value="outer">{t('form.common.outer')}</TabsTrigger>
                  <TabsTrigger value="inner">{t('form.common.inner')}</TabsTrigger>
                </TabsList>

                <TabsContent value="outer" className="space-y-6">
                  <GibsForm
                    data={outerAfterFormData}
                    updateFn={updateOuterAfterFieldAdapter}
                    errors={outerAfterErrors}
                    type="outer"
                  />
                </TabsContent>

                <TabsContent value="inner" className="space-y-6">
                  <GibsForm
                    data={innerAfterFormData}
                    updateFn={updateInnerAfterFieldAdapter}
                    errors={innerAfterErrors}
                    type="inner"
                  />
                </TabsContent>
              </Tabs>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="gibsNotes" className="text-xs font-semibold">
              {t('form.common.notes')}
            </Label>
            <Textarea
              id="gibsNotes"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                onSectionTouched?.();
              }}
              className="min-h-[100px]"
              placeholder={t('form.common.notesPlaceholder')}
            />
          </div>
        </div>
      </div>
    );
  },
);

GibsSection.displayName = 'GibsSection';
