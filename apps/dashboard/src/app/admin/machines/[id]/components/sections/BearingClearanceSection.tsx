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
import { buildBearingFields, sanitizeBearingDataForSubmission } from './bearingClearanceUtils';

// Default data structure - numeric fields default to undefined to show empty inputs
export const defaultBearingData: BearingClearanceData = {
  totalClearance_RH: undefined,
  totalClearance_LH: undefined,
  mainBearings_RH: undefined,
  mainBearings_LH: undefined,
  upperConnectionBearings_RH: undefined,
  upperConnectionBearings_LH: undefined,
  wristPinToMatingPart_RH: undefined,
  wristPinToMatingPart_LH: undefined,
  wristPinToBushing_RH: undefined,
  wristPinToBushing_LH: undefined,
  slideAdjNutToScrewSleeve_RH: undefined,
  slideAdjNutToScrewSleeve_LH: undefined,
  extraDoubleLockOpen_RH: undefined,
  extraDoubleLockOpen_LH: undefined,
  ballBoxArea_RH: undefined,
  ballBoxArea_LH: undefined,
  hasBeenAdjusted: undefined,
  combinedWith: '',
  matingPart: MatingPartType.BUSHING,
};

// Required fields for validation - only totalClearance (LH or RH) is required
const ALERT_FIELD_PAIRS: {
  key: string;
  lh: keyof BearingClearanceData;
  rh: keyof BearingClearanceData;
}[] = [{ key: 'totalClearance', lh: 'totalClearance_LH', rh: 'totalClearance_RH' }];

// For backward compatibility - flat list of field keys
const ALERT_REQUIRED_FIELDS = ALERT_FIELD_PAIRS.map((pair) => pair.key);

// Helper to check if a value is filled
const isValueFilled = (value: unknown): boolean => {
  return value !== undefined && value !== null && !(typeof value === 'number' && isNaN(value));
};

// Validation function - validates that at least LH or RH is filled for each field
// Returns field keys that are missing (not full error messages)
export const validateBearingClearanceData = (data: BearingClearanceData): string[] => {
  const missingFields: string[] = [];

  // Validate required alert fields - at least one of LH or RH must be filled
  ALERT_FIELD_PAIRS.forEach(({ key, lh, rh }) => {
    const lhValue = data[lh];
    const rhValue = data[rh];
    // Field is missing if NEITHER LH nor RH is filled
    if (!isValueFilled(lhValue) && !isValueFilled(rhValue)) {
      missingFields.push(key);
    }
  });

  return missingFields;
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
  initialData?: BearingClearanceSectionData;
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
    value: string | number | boolean | undefined,
  ) => {
    baseUpdateOuterBefore(field, value as string | number | boolean);
    onSectionTouched();
  };

  const updateOuterAfterField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean | undefined,
  ) => {
    baseUpdateOuterAfter(field, value as string | number | boolean);
    onSectionTouched();
  };

  const updateInnerBeforeField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean | undefined,
  ) => {
    baseUpdateInnerBefore(field, value as string | number | boolean);
    onSectionTouched();
  };

  const updateInnerAfterField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean | undefined,
  ) => {
    baseUpdateInnerAfter(field, value as string | number | boolean);
    onSectionTouched();
  };

  // Validation on blur - only validates when user enters an invalid number
  // Empty/undefined values are allowed (user can leave fields empty)
  const validateField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean | undefined,
  ): string => {
    // Non-numeric fields don't need validation
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

    // Empty/undefined values are valid (user can leave fields empty)
    if (value === undefined || value === null || value === '') {
      return '';
    }

    // Only show error if user entered something that's not a valid number
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
      const v = t.raw('form.bearingClearance.validation') as Record<string, string>;
      const fields = t.raw('form.bearingClearance.fields') as Record<string, string>;

      // Helper to get translated field names
      const getFieldName = (fieldKey: string) => fields[fieldKey] || fieldKey;

      const outerBeforeTouched = isDataTouched(outerBeforeData, initialOuterBeforeData);
      const outerAfterTouched = isDataTouched(outerAfterData, initialOuterAfterData);
      const innerBeforeTouched = isDataTouched(innerBeforeData, initialInnerBeforeData);
      const innerAfterTouched = isDataTouched(innerAfterData, initialInnerAfterData);

      // Validate before measurements if checkbox is enabled
      if (includeBeforeMeasurements) {
        if (serviceType === ServiceType.MAINTENANCE) {
          if (!outerBeforeTouched || !innerBeforeTouched) {
            errors.push(v.beforeMeasurementsRequired);
          }
        }
      }

      // Check if there's any existing data (either initial or modified)
      const hasOuterData =
        outerAfterTouched || isDataTouched(initialOuterAfterData, defaultBearingData);
      const hasInnerData =
        innerAfterTouched || isDataTouched(initialInnerAfterData, defaultBearingData);

      // Collect all missing fields
      const missingFieldsList: string[] = [];

      // If outer has data, validate its specific fields; otherwise list all required fields
      if (hasOuterData) {
        const outerDataToValidate = outerAfterTouched ? outerAfterData : initialOuterAfterData;
        const outerMissing = validateBearingClearanceData(outerDataToValidate);
        outerMissing.forEach((fieldKey) => {
          missingFieldsList.push(`${v.outerData}: ${getFieldName(fieldKey)}`);
        });
        // Check hasBeenAdjusted for outer
        if (!outerAfterHasBeenAdjusted) {
          missingFieldsList.push(`${v.outerData}: ${getFieldName('hasBeenAdjusted')}`);
        }
      } else {
        // Outer section not filled - list all required fields for outer
        ALERT_REQUIRED_FIELDS.forEach((fieldKey) => {
          missingFieldsList.push(`${v.outerData}: ${getFieldName(String(fieldKey))}`);
        });
        // Also add hasBeenAdjusted as required
        missingFieldsList.push(`${v.outerData}: ${getFieldName('hasBeenAdjusted')}`);
      }

      // If inner has data, validate its specific fields; otherwise list all required fields
      if (hasInnerData) {
        const innerDataToValidate = innerAfterTouched ? innerAfterData : initialInnerAfterData;
        const innerMissing = validateBearingClearanceData(innerDataToValidate);
        innerMissing.forEach((fieldKey) => {
          missingFieldsList.push(`${v.innerData}: ${getFieldName(fieldKey)}`);
        });
        // Check hasBeenAdjusted for inner
        if (!innerAfterHasBeenAdjusted) {
          missingFieldsList.push(`${v.innerData}: ${getFieldName('hasBeenAdjusted')}`);
        }
      } else {
        // Inner section not filled - list all required fields for inner
        ALERT_REQUIRED_FIELDS.forEach((fieldKey) => {
          missingFieldsList.push(`${v.innerData}: ${getFieldName(String(fieldKey))}`);
        });
        // Also add hasBeenAdjusted as required
        missingFieldsList.push(`${v.innerData}: ${getFieldName('hasBeenAdjusted')}`);
      }

      // Format as numbered list with header if there are missing fields
      if (missingFieldsList.length > 0) {
        const numberedList = missingFieldsList
          .map((field, index) => `${index + 1}) ${field}`)
          .join('\n');
        errors.push(`${v.sectionHeader}\n${numberedList}`);
      }

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
      const v = t.raw('form.bearingClearance.validation') as Record<string, string>;
      const fields = t.raw('form.bearingClearance.fields') as Record<string, string>;

      // Helper to get translated field names
      const getFieldName = (fieldKey: string) => fields[fieldKey] || fieldKey;

      const outerBeforeTouched = isDataTouched(outerBeforeData, initialOuterBeforeData);
      const outerAfterTouched = isDataTouched(outerAfterData, initialOuterAfterData);
      const innerBeforeTouched = isDataTouched(innerBeforeData, initialInnerBeforeData);
      const innerAfterTouched = isDataTouched(innerAfterData, initialInnerAfterData);

      // Validate before measurements if checkbox is enabled
      if (includeBeforeMeasurements) {
        if (serviceType === ServiceType.MAINTENANCE) {
          if (!outerBeforeTouched || !innerBeforeTouched) {
            errors.push(v.beforeMeasurementsRequired);
          }
        }
      }

      // Check if there's any existing data (either initial or modified)
      const hasOuterData =
        outerAfterTouched || isDataTouched(initialOuterAfterData, defaultBearingData);
      const hasInnerData =
        innerAfterTouched || isDataTouched(initialInnerAfterData, defaultBearingData);

      // Collect all missing fields
      const missingFieldsList: string[] = [];

      // If outer has data, validate its specific fields; otherwise list all required fields
      if (hasOuterData) {
        const outerDataToValidate = outerAfterTouched ? outerAfterData : initialOuterAfterData;
        const outerMissing = validateBearingClearanceData(outerDataToValidate);
        outerMissing.forEach((fieldKey) => {
          missingFieldsList.push(`${v.outerData}: ${getFieldName(fieldKey)}`);
        });
        // Check hasBeenAdjusted for outer
        if (!outerAfterHasBeenAdjusted) {
          missingFieldsList.push(`${v.outerData}: ${getFieldName('hasBeenAdjusted')}`);
        }
      } else {
        // Outer section not filled - list all required fields for outer
        ALERT_REQUIRED_FIELDS.forEach((fieldKey) => {
          missingFieldsList.push(`${v.outerData}: ${getFieldName(String(fieldKey))}`);
        });
        // Also add hasBeenAdjusted as required
        missingFieldsList.push(`${v.outerData}: ${getFieldName('hasBeenAdjusted')}`);
      }

      // If inner has data, validate its specific fields; otherwise list all required fields
      if (hasInnerData) {
        const innerDataToValidate = innerAfterTouched ? innerAfterData : initialInnerAfterData;
        const innerMissing = validateBearingClearanceData(innerDataToValidate);
        innerMissing.forEach((fieldKey) => {
          missingFieldsList.push(`${v.innerData}: ${getFieldName(fieldKey)}`);
        });
        // Check hasBeenAdjusted for inner
        if (!innerAfterHasBeenAdjusted) {
          missingFieldsList.push(`${v.innerData}: ${getFieldName('hasBeenAdjusted')}`);
        }
      } else {
        // Inner section not filled - list all required fields for inner
        ALERT_REQUIRED_FIELDS.forEach((fieldKey) => {
          missingFieldsList.push(`${v.innerData}: ${getFieldName(String(fieldKey))}`);
        });
        // Also add hasBeenAdjusted as required
        missingFieldsList.push(`${v.innerData}: ${getFieldName('hasBeenAdjusted')}`);
      }

      // Format as numbered list with header if there are missing fields
      if (missingFieldsList.length > 0) {
        const numberedList = missingFieldsList
          .map((field, index) => `${index + 1}) ${field}`)
          .join('\n');
        errors.push(`${v.sectionHeader}\n${numberedList}`);
      }

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

      // Sanitize data before submission (convert undefined numeric fields to 0)
      const data: BearingClearanceSectionData = {
        outerBefore:
          includeBeforeMeasurements && outerBeforeTouched
            ? sanitizeBearingDataForSubmission({ ...outerBeforeData, ...outerBeforeFields })
            : undefined,
        outerData: hasOuterData
          ? sanitizeBearingDataForSubmission({
              ...(outerAfterTouched ? outerAfterData : initialOuterAfterData),
              ...outerAfterFields,
            })
          : undefined,
        innerBefore:
          includeBeforeMeasurements && innerBeforeTouched
            ? sanitizeBearingDataForSubmission({ ...innerBeforeData, ...innerBeforeFields })
            : undefined,
        innerData: hasInnerData
          ? sanitizeBearingDataForSubmission({
              ...(innerAfterTouched ? innerAfterData : initialInnerAfterData),
              ...innerAfterFields,
            })
          : undefined,
      };

      return { isValid: true, errors: [], data };
    },
  }));

  return (
    <div className="space-y-6">
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
