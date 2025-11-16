'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
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
  leftTop: undefined,
  leftBottom: undefined,
  rightTop: undefined,
  rightBottom: undefined,
  frontTop: undefined,
  frontBottom: undefined,
  backTop: undefined,
  backBottom: undefined,
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
      setOuterBeforeFieldError,
      setOuterAfterFieldError,
      setInnerBeforeFieldError,
      setInnerAfterFieldError,
      reset,
    } = useGibsState();

    // UI state
    const [isBeforeOpen, setIsBeforeOpen] = useState(true);
    const [isAfterOpen, setIsAfterOpen] = useState(true);

    // Wrapper update functions to call onSectionTouched
    const updateOuterBeforeField = (field: keyof GibsData, value: string | number | undefined) => {
      baseUpdateOuterBefore(field, value);
      onSectionTouched?.();
    };

    const updateOuterAfterField = (field: keyof GibsData, value: string | number | undefined) => {
      baseUpdateOuterAfter(field, value);
      onSectionTouched?.();
    };

    const updateInnerBeforeField = (field: keyof GibsData, value: string | number | undefined) => {
      baseUpdateInnerBefore(field, value);
      onSectionTouched?.();
    };

    const updateInnerAfterField = (field: keyof GibsData, value: string | number | undefined) => {
      baseUpdateInnerAfter(field, value);
      onSectionTouched?.();
    };

    // Validation on blur
    const validateField = (
      field: keyof GibsData,
      value: string | number | boolean | undefined,
    ): string => {
      // Optional directional fields
      if (
        [
          'leftTop',
          'leftBottom',
          'rightTop',
          'rightBottom',
          'frontTop',
          'frontBottom',
          'backTop',
          'backBottom',
        ].includes(String(field))
      ) {
        if (value === undefined || value === '') return '';
      }

      const numValue = Number(value);
      if (isNaN(numValue)) {
        return t('form.error.invalidNumber');
      }

      return '';
    };

    // Blur handlers
    const handleBlurOuterBefore = (field: keyof GibsData) => {
      const error = validateField(field, outerBeforeData[field]);
      setOuterBeforeFieldError(field, error);
    };

    const handleBlurOuterAfter = (field: keyof GibsData) => {
      const error = validateField(field, outerAfterData[field]);
      setOuterAfterFieldError(field, error);
    };

    const handleBlurInnerBefore = (field: keyof GibsData) => {
      const error = validateField(field, innerBeforeData[field]);
      setInnerBeforeFieldError(field, error);
    };

    const handleBlurInnerAfter = (field: keyof GibsData) => {
      const error = validateField(field, innerAfterData[field]);
      setInnerAfterFieldError(field, error);
    };

    // Expose methods to parent via ref
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

          {/* Global Has Been Adjusted */}
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
                        <TabsTrigger value="outer">{t('form.common.outer')}</TabsTrigger>
                        <TabsTrigger value="inner">{t('form.common.inner')}</TabsTrigger>
                      </TabsList>

                      <TabsContent value="outer" className="space-y-6">
                        <GibsForm
                          data={outerBeforeData}
                          updateFn={updateOuterBeforeField}
                          errors={outerBeforeErrors}
                          handleBlur={handleBlurOuterBefore}
                          title="Outer Before"
                        />
                      </TabsContent>

                      <TabsContent value="inner" className="space-y-6">
                        <GibsForm
                          data={innerBeforeData}
                          updateFn={updateInnerBeforeField}
                          errors={innerBeforeErrors}
                          handleBlur={handleBlurInnerBefore}
                          title="Inner Before"
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
                        <TabsTrigger value="outer">{t('form.common.outer')}</TabsTrigger>
                        <TabsTrigger value="inner">{t('form.common.inner')}</TabsTrigger>
                      </TabsList>

                      <TabsContent value="outer" className="space-y-6">
                        <GibsForm
                          data={outerAfterData}
                          updateFn={updateOuterAfterField}
                          errors={outerAfterErrors}
                          handleBlur={handleBlurOuterAfter}
                          title="Outer After"
                        />
                      </TabsContent>

                      <TabsContent value="inner" className="space-y-6">
                        <GibsForm
                          data={innerAfterData}
                          updateFn={updateInnerAfterField}
                          errors={innerAfterErrors}
                          handleBlur={handleBlurInnerAfter}
                          title="Inner After"
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
                    data={outerAfterData}
                    updateFn={updateOuterAfterField}
                    errors={outerAfterErrors}
                    handleBlur={handleBlurOuterAfter}
                    title="Outer After"
                  />
                </TabsContent>

                <TabsContent value="inner" className="space-y-6">
                  <GibsForm
                    data={innerAfterData}
                    updateFn={updateInnerAfterField}
                    errors={innerAfterErrors}
                    handleBlur={handleBlurInnerAfter}
                    title="Inner After"
                  />
                </TabsContent>
              </Tabs>
            </>
          )}

          {/* Global Notes Field */}
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
