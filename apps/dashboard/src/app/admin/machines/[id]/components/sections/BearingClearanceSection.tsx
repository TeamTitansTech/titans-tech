'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChevronDown } from 'lucide-react';
import {
  type BearingClearanceData,
  MatingPartType,
  ServiceType,
  YesNoNaDncType,
} from '@/data/types/services.types';
import { BearingTabContent } from '../shared/BearingTabContent';
import { ShutdownAdjustmentFields } from '../shared/ShutdownAdjustmentFields';
import { useBearingClearanceState } from '../../hooks/useBearingClearanceState';
import { isDataTouched } from './utils';
import { buildBearingFields, validateHasBeenAdjustedFields } from './bearingClearanceUtils';

// Default data structure
export const defaultBearingData: BearingClearanceData = {
  totalClearance_RH: 0,
  totalClearance_LH: 0,
  mainBearings_RH: 0,
  mainBearings_LH: 0,
  upperConnectionBearings_RH: 0,
  upperConnectionBearings_LH: 0,
  wristPinToMatingPart_RH: 0,
  wristPinToMatingPart_LH: 0,
  wristPinToBushing_RH: 0,
  wristPinToBushing_LH: 0,
  slideAdjNutToScrewSleeve_RH: 0,
  slideAdjNutToScrewSleeve_LH: 0,
  extraDoubleLockOpen_RH: 0,
  extraDoubleLockOpen_LH: 0,
  ballBoxArea_RH: 0,
  ballBoxArea_LH: 0,
  hasBeenAdjusted: YesNoNaDncType.NO,
  combinedWith: '',
  matingPart: MatingPartType.BUSHING,
};

// Validation function
export const validateBearingClearanceData = (data: BearingClearanceData): string[] => {
  const errors: string[] = [];
  const requiredNumericFields: (keyof BearingClearanceData)[] = [
    'totalClearance_RH',
    'totalClearance_LH',
    'mainBearings_RH',
    'mainBearings_LH',
    'upperConnectionBearings_RH',
    'upperConnectionBearings_LH',
    'wristPinToMatingPart_RH',
    'wristPinToMatingPart_LH',
    'wristPinToBushing_RH',
    'wristPinToBushing_LH',
    'slideAdjNutToScrewSleeve_RH',
    'slideAdjNutToScrewSleeve_LH',
    'extraDoubleLockOpen_RH',
    'extraDoubleLockOpen_LH',
    'ballBoxArea_RH',
    'ballBoxArea_LH',
  ];

  requiredNumericFields.forEach((field) => {
    const value = data[field];
    // Only validate if field exists in data
    if (value !== undefined && (typeof value !== 'number' || isNaN(value))) {
      errors.push(`${String(field)} is required and must be a valid number`);
    }
  });

  return errors;
};

export interface BearingClearanceSectionData {
  outerBefore?: BearingClearanceData;
  outerData?: BearingClearanceData;
  innerBefore?: BearingClearanceData;
  innerData?: BearingClearanceData;
}

export interface BearingClearanceSectionRef {
  getData: () => BearingClearanceSectionData;
  validate: (serviceType: ServiceType) => string[];
  validateAndGetData: (serviceType: ServiceType) => {
    isValid: boolean;
    errors: string[];
    data?: BearingClearanceSectionData;
  };
  reset: () => void;
  isTouched: () => boolean;
}

interface BearingClearanceSectionProps {
  onSectionTouched: () => void;
  serviceType: ServiceType;
  initialData?: any; // Will be BearingClearanceSectionData from the hook
}

export const BearingClearanceSection = forwardRef<
  BearingClearanceSectionRef,
  BearingClearanceSectionProps
>(({ onSectionTouched, serviceType, initialData }, ref) => {
  const t = useTranslations('inspections');

  // Use custom hook for state management
  const {
    initialOuterBeforeData,
    initialOuterAfterData,
    initialInnerBeforeData,
    initialInnerAfterData,
    includeBeforeMeasurements,
    setIncludeBeforeMeasurements,
    outerBeforeData,
    outerAfterData,
    innerBeforeData,
    innerAfterData,
    outerBeforeHasBeenAdjusted,
    setOuterBeforeHasBeenAdjusted,
    outerAfterHasBeenAdjusted,
    setOuterAfterHasBeenAdjusted,
    innerBeforeHasBeenAdjusted,
    setInnerBeforeHasBeenAdjusted,
    innerAfterHasBeenAdjusted,
    setInnerAfterHasBeenAdjusted,
    outerCombinedWith,
    setOuterCombinedWith,
    outerMatingPart,
    setOuterMatingPart,
    innerCombinedWith,
    setInnerCombinedWith,
    innerMatingPart,
    setInnerMatingPart,
    slideMotorMounts,
    setSlideMotorMounts,
    powerCordHoses,
    setPowerCordHoses,
    chainsGearsSprockets,
    setChainsGearsSprockets,
    lockingClamps,
    setLockingClamps,
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
  } = useBearingClearanceState({ initialData });

  // UI state
  const [isBeforeOpen, setIsBeforeOpen] = useState(true);
  const [isAfterOpen, setIsAfterOpen] = useState(true);

  // Wrapper update functions to call onSectionTouched
  const updateOuterBeforeField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean,
  ) => {
    baseUpdateOuterBefore(field, value);
    onSectionTouched();
  };

  const updateOuterAfterField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean,
  ) => {
    baseUpdateOuterAfter(field, value);
    onSectionTouched();
  };

  const updateInnerBeforeField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean,
  ) => {
    baseUpdateInnerBefore(field, value);
    onSectionTouched();
  };

  const updateInnerAfterField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean,
  ) => {
    baseUpdateInnerAfter(field, value);
    onSectionTouched();
  };

  // Validation on blur
  const validateField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean | undefined,
  ): string => {
    if (
      field === 'combinedWith' ||
      field === 'matingPart' ||
      field === 'hasBeenAdjusted' ||
      field === 'slideMotorMounts' ||
      field === 'powerCordHoses' ||
      field === 'chainsGearsSprockets' ||
      field === 'lockingClamps' ||
      field === 'notes'
    ) {
      return '';
    }

    const numValue = Number(value);
    if (isNaN(numValue)) {
      return t('form.error.invalidNumber');
    }

    return '';
  };

  // Blur handlers
  const handleBlurOuterBefore = (field: keyof BearingClearanceData) => {
    const error = validateField(field, outerBeforeData[field]);
    setOuterBeforeFieldError(field, error);
  };

  const handleBlurOuterAfter = (field: keyof BearingClearanceData) => {
    const error = validateField(field, outerAfterData[field]);
    setOuterAfterFieldError(field, error);
  };

  const handleBlurInnerBefore = (field: keyof BearingClearanceData) => {
    const error = validateField(field, innerBeforeData[field]);
    setInnerBeforeFieldError(field, error);
  };

  const handleBlurInnerAfter = (field: keyof BearingClearanceData) => {
    const error = validateField(field, innerAfterData[field]);
    setInnerAfterFieldError(field, error);
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getData: (): BearingClearanceSectionData => {
      const outerBeforeTouched = isDataTouched(outerBeforeData, initialOuterBeforeData);
      const outerAfterTouched = isDataTouched(outerAfterData, initialOuterAfterData);
      const innerBeforeTouched = isDataTouched(innerBeforeData, initialInnerBeforeData);
      const innerAfterTouched = isDataTouched(innerAfterData, initialInnerAfterData);

      // Check if there's any existing data (either initial or modified)
      const hasOuterData =
        outerAfterTouched || isDataTouched(initialOuterAfterData, defaultBearingData);
      const hasInnerData =
        innerAfterTouched || isDataTouched(initialInnerAfterData, defaultBearingData);

      const sharedFields = {
        slideMotorMounts,
        powerCordHoses,
        chainsGearsSprockets,
        lockingClamps,
        notes,
      };

      const outerBeforeFields = buildBearingFields(
        {
          hasBeenAdjusted: outerBeforeHasBeenAdjusted || YesNoNaDncType.NO,
          combinedWith: outerCombinedWith,
          matingPart: outerMatingPart,
        },
        sharedFields,
      );

      const outerAfterFields = buildBearingFields(
        {
          hasBeenAdjusted: outerAfterHasBeenAdjusted || YesNoNaDncType.NO,
          combinedWith: outerCombinedWith,
          matingPart: outerMatingPart,
        },
        sharedFields,
      );

      const innerBeforeFields = buildBearingFields(
        {
          hasBeenAdjusted: innerBeforeHasBeenAdjusted || YesNoNaDncType.NO,
          combinedWith: innerCombinedWith,
          matingPart: innerMatingPart,
        },
        sharedFields,
      );

      const innerAfterFields = buildBearingFields(
        {
          hasBeenAdjusted: innerAfterHasBeenAdjusted || YesNoNaDncType.NO,
          combinedWith: innerCombinedWith,
          matingPart: innerMatingPart,
        },
        sharedFields,
      );

      return {
        outerBefore:
          includeBeforeMeasurements && outerBeforeTouched
            ? { ...outerBeforeData, ...outerBeforeFields }
            : undefined,
        outerData: hasOuterData
          ? { ...(outerAfterTouched ? outerAfterData : initialOuterAfterData), ...outerAfterFields }
          : undefined,
        innerBefore:
          includeBeforeMeasurements && innerBeforeTouched
            ? { ...innerBeforeData, ...innerBeforeFields }
            : undefined,
        innerData: hasInnerData
          ? { ...(innerAfterTouched ? innerAfterData : initialInnerAfterData), ...innerAfterFields }
          : undefined,
      };
    },

    validate: (serviceType: ServiceType): string[] => {
      const errors: string[] = [];

      const outerBeforeTouched = isDataTouched(outerBeforeData, initialOuterBeforeData);
      const outerAfterTouched = isDataTouched(outerAfterData, initialOuterAfterData);
      const innerBeforeTouched = isDataTouched(innerBeforeData, initialInnerBeforeData);
      const innerAfterTouched = isDataTouched(innerAfterData, initialInnerAfterData);

      // Validate before measurements if checkbox is enabled
      if (includeBeforeMeasurements) {
        if (serviceType === ServiceType.MAINTENANCE) {
          if (!outerBeforeTouched || !innerBeforeTouched) {
            errors.push(
              'Bearing Clearance: When "Include Before Measurements" is enabled for maintenance, you must fill all "Before" sections (Outer Before and Inner Before)',
            );
          } else {
            errors.push(
              ...validateBearingClearanceData(outerBeforeData).map((e) => `Outer Before: ${e}`),
            );
            errors.push(
              ...validateBearingClearanceData(innerBeforeData).map((e) => `Inner Before: ${e}`),
            );
          }
        }

        if (outerBeforeTouched) {
          errors.push(
            ...validateBearingClearanceData(outerBeforeData).map((e) => `Outer Before: ${e}`),
          );
        }
        if (innerBeforeTouched) {
          errors.push(
            ...validateBearingClearanceData(innerBeforeData).map((e) => `Inner Before: ${e}`),
          );
        }
      }

      // Validate after measurements
      if (outerAfterTouched) {
        errors.push(...validateBearingClearanceData(outerAfterData).map((e) => `Outer Data: ${e}`));
      }
      if (innerAfterTouched) {
        errors.push(...validateBearingClearanceData(innerAfterData).map((e) => `Inner Data: ${e}`));
      }

      // Check if there's any existing data (either initial or modified)
      const hasOuterData =
        outerAfterTouched || isDataTouched(initialOuterAfterData, defaultBearingData);
      const hasInnerData =
        innerAfterTouched || isDataTouched(initialInnerAfterData, defaultBearingData);

      // Validate at least one measurement set (either initial or new)
      if (!hasOuterData && !hasInnerData) {
        errors.push(
          'Bearing Clearance: You must fill at least one measurement section (Outer Data or Inner Data)',
        );
      }

      // Validate required "Has Been Adjusted" fields
      errors.push(
        ...validateHasBeenAdjustedFields({
          includeBeforeMeasurements,
          outerBeforeTouched,
          outerAfterTouched,
          innerBeforeTouched,
          innerAfterTouched,
          outerBeforeHasBeenAdjusted,
          outerAfterHasBeenAdjusted,
          innerBeforeHasBeenAdjusted,
          innerAfterHasBeenAdjusted,
        }),
      );

      return errors;
    },

    reset,

    isTouched: (): boolean => {
      const outerBeforeTouched = isDataTouched(outerBeforeData, initialOuterBeforeData);
      const outerAfterTouched = isDataTouched(outerAfterData, initialOuterAfterData);
      const innerBeforeTouched = isDataTouched(innerBeforeData, initialInnerBeforeData);
      const innerAfterTouched = isDataTouched(innerAfterData, initialInnerAfterData);
      return outerBeforeTouched || outerAfterTouched || innerBeforeTouched || innerAfterTouched;
    },

    validateAndGetData: (
      serviceType: ServiceType,
    ): { isValid: boolean; errors: string[]; data?: BearingClearanceSectionData } => {
      const errors: string[] = [];
      const outerBeforeTouched = isDataTouched(outerBeforeData, initialOuterBeforeData);
      const outerAfterTouched = isDataTouched(outerAfterData, initialOuterAfterData);
      const innerBeforeTouched = isDataTouched(innerBeforeData, initialInnerBeforeData);
      const innerAfterTouched = isDataTouched(innerAfterData, initialInnerAfterData);

      // Validate before measurements if checkbox is enabled
      if (includeBeforeMeasurements) {
        if (serviceType === ServiceType.MAINTENANCE) {
          if (!outerBeforeTouched || !innerBeforeTouched) {
            errors.push(
              'Bearing Clearance: When "Include Before Measurements" is enabled for maintenance, you must fill all "Before" sections (Outer Before and Inner Before)',
            );
          } else {
            errors.push(
              ...validateBearingClearanceData(outerBeforeData).map((e) => `Outer Before: ${e}`),
            );
            errors.push(
              ...validateBearingClearanceData(innerBeforeData).map((e) => `Inner Before: ${e}`),
            );
          }
        }

        if (outerBeforeTouched) {
          errors.push(
            ...validateBearingClearanceData(outerBeforeData).map((e) => `Outer Before: ${e}`),
          );
        }
        if (innerBeforeTouched) {
          errors.push(
            ...validateBearingClearanceData(innerBeforeData).map((e) => `Inner Before: ${e}`),
          );
        }
      }

      // Validate after measurements
      if (outerAfterTouched) {
        errors.push(...validateBearingClearanceData(outerAfterData).map((e) => `Outer Data: ${e}`));
      }
      if (innerAfterTouched) {
        errors.push(...validateBearingClearanceData(innerAfterData).map((e) => `Inner Data: ${e}`));
      }

      // Check if there's any existing data (either initial or modified)
      const hasOuterData =
        outerAfterTouched || isDataTouched(initialOuterAfterData, defaultBearingData);
      const hasInnerData =
        innerAfterTouched || isDataTouched(initialInnerAfterData, defaultBearingData);

      // Validate at least one measurement set (either initial or new)
      if (!hasOuterData && !hasInnerData) {
        errors.push(
          'Bearing Clearance: You must fill at least one measurement section (Outer Data or Inner Data)',
        );
      }

      // Validate required "Has Been Adjusted" fields
      errors.push(
        ...validateHasBeenAdjustedFields({
          includeBeforeMeasurements,
          outerBeforeTouched,
          outerAfterTouched,
          innerBeforeTouched,
          innerAfterTouched,
          outerBeforeHasBeenAdjusted,
          outerAfterHasBeenAdjusted,
          innerBeforeHasBeenAdjusted,
          innerAfterHasBeenAdjusted,
        }),
      );

      if (errors.length > 0) {
        return { isValid: false, errors };
      }

      const sharedFields = {
        slideMotorMounts,
        powerCordHoses,
        chainsGearsSprockets,
        lockingClamps,
        notes,
      };

      const outerBeforeFields = buildBearingFields(
        {
          hasBeenAdjusted: outerBeforeHasBeenAdjusted || YesNoNaDncType.NO,
          combinedWith: outerCombinedWith,
          matingPart: outerMatingPart,
        },
        sharedFields,
      );

      const outerAfterFields = buildBearingFields(
        {
          hasBeenAdjusted: outerAfterHasBeenAdjusted || YesNoNaDncType.NO,
          combinedWith: outerCombinedWith,
          matingPart: outerMatingPart,
        },
        sharedFields,
      );

      const innerBeforeFields = buildBearingFields(
        {
          hasBeenAdjusted: innerBeforeHasBeenAdjusted || YesNoNaDncType.NO,
          combinedWith: innerCombinedWith,
          matingPart: innerMatingPart,
        },
        sharedFields,
      );

      const innerAfterFields = buildBearingFields(
        {
          hasBeenAdjusted: innerAfterHasBeenAdjusted || YesNoNaDncType.NO,
          combinedWith: innerCombinedWith,
          matingPart: innerMatingPart,
        },
        sharedFields,
      );

      const data: BearingClearanceSectionData = {
        outerBefore:
          includeBeforeMeasurements && outerBeforeTouched
            ? { ...outerBeforeData, ...outerBeforeFields }
            : undefined,
        outerData: hasOuterData
          ? { ...(outerAfterTouched ? outerAfterData : initialOuterAfterData), ...outerAfterFields }
          : undefined,
        innerBefore:
          includeBeforeMeasurements && innerBeforeTouched
            ? { ...innerBeforeData, ...innerBeforeFields }
            : undefined,
        innerData: hasInnerData
          ? { ...(innerAfterTouched ? innerAfterData : initialInnerAfterData), ...innerAfterFields }
          : undefined,
      };

      return { isValid: true, errors: [], data };
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
              onSectionTouched();
            }}
          />
          <Label
            htmlFor="includeBeforeMeasurements"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t('form.bearingClearanceSection.includeBeforeMeasurements')}
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
                  {t('form.bearingClearanceSection.beforeMaintenance')}
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
                    <BearingTabContent
                      hasBeenAdjusted={outerBeforeHasBeenAdjusted}
                      onHasBeenAdjustedChange={(value) => {
                        setOuterBeforeHasBeenAdjusted(value);
                        onSectionTouched();
                      }}
                      hasBeenAdjustedId="outerBeforeHasBeenAdjusted"
                      combinedWith={outerCombinedWith}
                      onCombinedWithChange={(value) => {
                        setOuterCombinedWith(value);
                        onSectionTouched();
                      }}
                      matingPart={outerMatingPart}
                      onMatingPartChange={(value) => {
                        setOuterMatingPart(value);
                        onSectionTouched();
                      }}
                      metadataPrefix="outer"
                      bearingData={outerBeforeData}
                      updateFn={updateOuterBeforeField}
                      errors={outerBeforeErrors}
                      handleBlur={handleBlurOuterBefore}
                    />
                  </TabsContent>

                  <TabsContent value="inner" className="space-y-6">
                    <BearingTabContent
                      hasBeenAdjusted={innerBeforeHasBeenAdjusted}
                      onHasBeenAdjustedChange={(value) => {
                        setInnerBeforeHasBeenAdjusted(value);
                        onSectionTouched();
                      }}
                      hasBeenAdjustedId="innerBeforeHasBeenAdjusted"
                      combinedWith={innerCombinedWith}
                      onCombinedWithChange={(value) => {
                        setInnerCombinedWith(value);
                        onSectionTouched();
                      }}
                      matingPart={innerMatingPart}
                      onMatingPartChange={(value) => {
                        setInnerMatingPart(value);
                        onSectionTouched();
                      }}
                      metadataPrefix="inner"
                      bearingData={innerBeforeData}
                      updateFn={updateInnerBeforeField}
                      errors={innerBeforeErrors}
                      handleBlur={handleBlurInnerBefore}
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
                  {t('form.bearingClearanceSection.afterMaintenance')}
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
                    <BearingTabContent
                      hasBeenAdjusted={outerAfterHasBeenAdjusted}
                      onHasBeenAdjustedChange={(value) => {
                        setOuterAfterHasBeenAdjusted(value);
                        onSectionTouched();
                      }}
                      hasBeenAdjustedId="outerAfterHasBeenAdjusted"
                      combinedWith={outerCombinedWith}
                      onCombinedWithChange={(value) => {
                        setOuterCombinedWith(value);
                        onSectionTouched();
                      }}
                      matingPart={outerMatingPart}
                      onMatingPartChange={(value) => {
                        setOuterMatingPart(value);
                        onSectionTouched();
                      }}
                      metadataPrefix="outerAfter"
                      bearingData={outerAfterData}
                      updateFn={updateOuterAfterField}
                      errors={outerAfterErrors}
                      handleBlur={handleBlurOuterAfter}
                    />
                  </TabsContent>

                  <TabsContent value="inner" className="space-y-6">
                    <BearingTabContent
                      hasBeenAdjusted={innerAfterHasBeenAdjusted}
                      onHasBeenAdjustedChange={(value) => {
                        setInnerAfterHasBeenAdjusted(value);
                        onSectionTouched();
                      }}
                      hasBeenAdjustedId="innerAfterHasBeenAdjusted"
                      combinedWith={innerCombinedWith}
                      onCombinedWithChange={(value) => {
                        setInnerCombinedWith(value);
                        onSectionTouched();
                      }}
                      matingPart={innerMatingPart}
                      onMatingPartChange={(value) => {
                        setInnerMatingPart(value);
                        onSectionTouched();
                      }}
                      metadataPrefix="innerAfter"
                      bearingData={innerAfterData}
                      updateFn={updateInnerAfterField}
                      errors={innerAfterErrors}
                      handleBlur={handleBlurInnerAfter}
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
              <BearingTabContent
                hasBeenAdjusted={outerAfterHasBeenAdjusted}
                onHasBeenAdjustedChange={(value) => {
                  setOuterAfterHasBeenAdjusted(value);
                  onSectionTouched();
                }}
                hasBeenAdjustedId="outerAfterHasBeenAdjustedRegular"
                combinedWith={outerCombinedWith}
                onCombinedWithChange={(value) => {
                  setOuterCombinedWith(value);
                  onSectionTouched();
                }}
                matingPart={outerMatingPart}
                onMatingPartChange={(value) => {
                  setOuterMatingPart(value);
                  onSectionTouched();
                }}
                metadataPrefix="outer"
                bearingData={outerAfterData}
                updateFn={updateOuterAfterField}
                errors={outerAfterErrors}
                handleBlur={handleBlurOuterAfter}
              />
            </TabsContent>

            <TabsContent value="inner" className="space-y-6">
              <BearingTabContent
                hasBeenAdjusted={innerAfterHasBeenAdjusted}
                onHasBeenAdjustedChange={(value) => {
                  setInnerAfterHasBeenAdjusted(value);
                  onSectionTouched();
                }}
                hasBeenAdjustedId="innerAfterHasBeenAdjustedRegular"
                combinedWith={innerCombinedWith}
                onCombinedWithChange={(value) => {
                  setInnerCombinedWith(value);
                  onSectionTouched();
                }}
                matingPart={innerMatingPart}
                onMatingPartChange={(value) => {
                  setInnerMatingPart(value);
                  onSectionTouched();
                }}
                metadataPrefix="inner"
                bearingData={innerAfterData}
                updateFn={updateInnerAfterField}
                errors={innerAfterErrors}
                handleBlur={handleBlurInnerAfter}
              />
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Shared Fields - Shutdown Adjustment Mechanism */}
      <ShutdownAdjustmentFields
        slideMotorMounts={slideMotorMounts}
        onSlideMotorMountsChange={(value) => {
          setSlideMotorMounts(value);
          onSectionTouched();
        }}
        powerCordHoses={powerCordHoses}
        onPowerCordHosesChange={(value) => {
          setPowerCordHoses(value);
          onSectionTouched();
        }}
        chainsGearsSprockets={chainsGearsSprockets}
        onChainsGearsSprocketsChange={(value) => {
          setChainsGearsSprockets(value);
          onSectionTouched();
        }}
        lockingClamps={lockingClamps}
        onLockingClampsChange={(value) => {
          setLockingClamps(value);
          onSectionTouched();
        }}
        notes={notes}
        onNotesChange={(value) => {
          setNotes(value);
          onSectionTouched();
        }}
      />
    </div>
  );
});

BearingClearanceSection.displayName = 'BearingClearanceSection';
