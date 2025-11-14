'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronDown } from 'lucide-react';
import {
  type BearingClearanceData,
  MatingPartType,
  ServiceType,
  YesNoNaDncType,
  ConditionOkNaDncBrokenWornType,
  ConditionOkNaDncBrokenLooseType,
  ConditionOkNaDncDamagedType,
} from '@/data/types/services.types';
import { BearingClearanceForm } from '../forms/BearingClearanceForm';
import { isDataTouched } from './utils';

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
    if (typeof value !== 'number' || isNaN(value)) {
      errors.push(`${String(field)} is required and must be a valid number`);
    }
  });

  return errors;
};

export interface BearingClearanceSectionData {
  outerBefore?: BearingClearanceData;
  outerAfter?: BearingClearanceData;
  innerBefore?: BearingClearanceData;
  innerAfter?: BearingClearanceData;
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

  // State
  const [includeBeforeMeasurements, setIncludeBeforeMeasurements] = useState(
    !!(initialData?.outerBefore || initialData?.innerBefore),
  );
  const [isBeforeOpen, setIsBeforeOpen] = useState(true);
  const [isAfterOpen, setIsAfterOpen] = useState(true);
  const [outerBeforeData, setOuterBeforeData] = useState<BearingClearanceData>(
    initialData?.outerBefore || defaultBearingData,
  );
  const [outerAfterData, setOuterAfterData] = useState<BearingClearanceData>(
    initialData?.outerAfter || defaultBearingData,
  );
  const [innerBeforeData, setInnerBeforeData] = useState<BearingClearanceData>(
    initialData?.innerBefore || defaultBearingData,
  );
  const [innerAfterData, setInnerAfterData] = useState<BearingClearanceData>(
    initialData?.innerAfter || defaultBearingData,
  );

  // Separate states for before and after maintenance
  const [beforeHasBeenAdjusted, setBeforeHasBeenAdjusted] = useState<YesNoNaDncType | undefined>(
    (initialData?.outerBefore || initialData?.innerBefore)?.hasBeenAdjusted,
  );
  const [afterHasBeenAdjusted, setAfterHasBeenAdjusted] = useState<YesNoNaDncType | undefined>(
    (initialData?.outerAfter || initialData?.innerAfter)?.hasBeenAdjusted,
  );

  // Tab-specific fields (separate for Outer and Inner)
  const [outerCombinedWith, setOuterCombinedWith] = useState(
    (initialData?.outerAfter || initialData?.outerBefore)?.combinedWith || '',
  );
  const [outerMatingPart, setOuterMatingPart] = useState<MatingPartType>(
    (initialData?.outerAfter || initialData?.outerBefore)?.matingPart || MatingPartType.BUSHING,
  );
  const [innerCombinedWith, setInnerCombinedWith] = useState(
    (initialData?.innerAfter || initialData?.innerBefore)?.combinedWith || '',
  );
  const [innerMatingPart, setInnerMatingPart] = useState<MatingPartType>(
    (initialData?.innerAfter || initialData?.innerBefore)?.matingPart || MatingPartType.BUSHING,
  );

  // Shared fields (Shutdown Adjustment Mechanism)
  const [slideMotorMounts, setSlideMotorMounts] = useState<
    ConditionOkNaDncBrokenWornType | undefined
  >((initialData?.outerAfter || initialData?.outerBefore)?.slideMotorMounts);
  const [powerCordHoses, setPowerCordHoses] = useState<ConditionOkNaDncDamagedType | undefined>(
    (initialData?.outerAfter || initialData?.outerBefore)?.powerCordHoses,
  );
  const [chainsGearsSprockets, setChainsGearsSprockets] = useState<
    ConditionOkNaDncBrokenLooseType | undefined
  >((initialData?.outerAfter || initialData?.outerBefore)?.chainsGearsSprockets);
  const [lockingClamps, setLockingClamps] = useState<ConditionOkNaDncDamagedType | undefined>(
    (initialData?.outerAfter || initialData?.outerBefore)?.lockingClamps,
  );
  const [notes, setNotes] = useState(
    (initialData?.outerAfter || initialData?.outerBefore)?.notes || '',
  );

  const [outerBeforeErrors, setOuterBeforeErrors] = useState<Record<string, string>>({});
  const [outerAfterErrors, setOuterAfterErrors] = useState<Record<string, string>>({});
  const [innerBeforeErrors, setInnerBeforeErrors] = useState<Record<string, string>>({});
  const [innerAfterErrors, setInnerAfterErrors] = useState<Record<string, string>>({});

  // Update functions
  const updateOuterBeforeField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean,
  ) => {
    setOuterBeforeData((prev) => ({ ...prev, [field]: value }));
    setOuterBeforeErrors((prev) => ({ ...prev, [field]: '' }));
    onSectionTouched();
  };

  const updateOuterAfterField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean,
  ) => {
    setOuterAfterData((prev) => ({ ...prev, [field]: value }));
    setOuterAfterErrors((prev) => ({ ...prev, [field]: '' }));
    onSectionTouched();
  };

  const updateInnerBeforeField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean,
  ) => {
    setInnerBeforeData((prev) => ({ ...prev, [field]: value }));
    setInnerBeforeErrors((prev) => ({ ...prev, [field]: '' }));
    onSectionTouched();
  };

  const updateInnerAfterField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean,
  ) => {
    setInnerAfterData((prev) => ({ ...prev, [field]: value }));
    setInnerAfterErrors((prev) => ({ ...prev, [field]: '' }));
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
    setOuterBeforeErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleBlurOuterAfter = (field: keyof BearingClearanceData) => {
    const error = validateField(field, outerAfterData[field]);
    setOuterAfterErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleBlurInnerBefore = (field: keyof BearingClearanceData) => {
    const error = validateField(field, innerBeforeData[field]);
    setInnerBeforeErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleBlurInnerAfter = (field: keyof BearingClearanceData) => {
    const error = validateField(field, innerAfterData[field]);
    setInnerAfterErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getData: (): BearingClearanceSectionData => {
      const outerBeforeTouched = isDataTouched(outerBeforeData, defaultBearingData);
      const outerAfterTouched = isDataTouched(outerAfterData, defaultBearingData);
      const innerBeforeTouched = isDataTouched(innerBeforeData, defaultBearingData);
      const innerAfterTouched = isDataTouched(innerAfterData, defaultBearingData);

      // Shared fields for before measurements
      const beforeSharedFields = {
        hasBeenAdjusted: beforeHasBeenAdjusted || YesNoNaDncType.NO,
        slideMotorMounts,
        powerCordHoses,
        chainsGearsSprockets,
        lockingClamps,
        notes,
      };

      // Shared fields for after measurements
      const afterSharedFields = {
        hasBeenAdjusted: afterHasBeenAdjusted || YesNoNaDncType.NO,
        slideMotorMounts,
        powerCordHoses,
        chainsGearsSprockets,
        lockingClamps,
        notes,
      };

      // Outer-specific fields for before
      const outerBeforeFields = {
        combinedWith: outerCombinedWith,
        matingPart: outerMatingPart,
        ...beforeSharedFields,
      };

      // Outer-specific fields for after
      const outerAfterFields = {
        combinedWith: outerCombinedWith,
        matingPart: outerMatingPart,
        ...afterSharedFields,
      };

      // Inner-specific fields for before
      const innerBeforeFields = {
        combinedWith: innerCombinedWith,
        matingPart: innerMatingPart,
        ...beforeSharedFields,
      };

      // Inner-specific fields for after
      const innerAfterFields = {
        combinedWith: innerCombinedWith,
        matingPart: innerMatingPart,
        ...afterSharedFields,
      };

      return {
        outerBefore:
          includeBeforeMeasurements && outerBeforeTouched
            ? { ...outerBeforeData, ...outerBeforeFields }
            : undefined,
        outerAfter: outerAfterTouched ? { ...outerAfterData, ...outerAfterFields } : undefined,
        innerBefore:
          includeBeforeMeasurements && innerBeforeTouched
            ? { ...innerBeforeData, ...innerBeforeFields }
            : undefined,
        innerAfter: innerAfterTouched ? { ...innerAfterData, ...innerAfterFields } : undefined,
      };
    },

    validate: (serviceType: ServiceType): string[] => {
      const errors: string[] = [];

      const outerBeforeTouched = isDataTouched(outerBeforeData, defaultBearingData);
      const outerAfterTouched = isDataTouched(outerAfterData, defaultBearingData);
      const innerBeforeTouched = isDataTouched(innerBeforeData, defaultBearingData);
      const innerAfterTouched = isDataTouched(innerAfterData, defaultBearingData);

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

      // Require at least one measurement set
      if (!outerAfterTouched && !innerAfterTouched) {
        errors.push(
          'Bearing Clearance: You must fill at least one measurement section (Outer Data or Inner Data)',
        );
      }

      // Validate required shared fields
      if (includeBeforeMeasurements && !beforeHasBeenAdjusted) {
        errors.push(
          'Bearing Clearance: "Has Been Adjusted" field is required for before measurements',
        );
      }
      if (!afterHasBeenAdjusted) {
        errors.push(
          'Bearing Clearance: "Has Been Adjusted" field is required for after measurements',
        );
      }

      return errors;
    },

    reset: () => {
      setIncludeBeforeMeasurements(false);
      setOuterBeforeData(defaultBearingData);
      setOuterAfterData(defaultBearingData);
      setInnerBeforeData(defaultBearingData);
      setInnerAfterData(defaultBearingData);
      setBeforeHasBeenAdjusted(undefined);
      setAfterHasBeenAdjusted(undefined);
      setOuterCombinedWith('');
      setOuterMatingPart(MatingPartType.BUSHING);
      setInnerCombinedWith('');
      setInnerMatingPart(MatingPartType.BUSHING);
      setSlideMotorMounts(undefined);
      setPowerCordHoses(undefined);
      setChainsGearsSprockets(undefined);
      setLockingClamps(undefined);
      setNotes('');
      setOuterBeforeErrors({});
      setOuterAfterErrors({});
      setInnerBeforeErrors({});
      setInnerAfterErrors({});
    },

    isTouched: (): boolean => {
      const outerBeforeTouched = isDataTouched(outerBeforeData, defaultBearingData);
      const outerAfterTouched = isDataTouched(outerAfterData, defaultBearingData);
      const innerBeforeTouched = isDataTouched(innerBeforeData, defaultBearingData);
      const innerAfterTouched = isDataTouched(innerAfterData, defaultBearingData);
      return outerBeforeTouched || outerAfterTouched || innerBeforeTouched || innerAfterTouched;
    },

    validateAndGetData: (
      serviceType: ServiceType,
    ): { isValid: boolean; errors: string[]; data?: BearingClearanceSectionData } => {
      const errors: string[] = [];
      const outerBeforeTouched = isDataTouched(outerBeforeData, defaultBearingData);
      const outerAfterTouched = isDataTouched(outerAfterData, defaultBearingData);
      const innerBeforeTouched = isDataTouched(innerBeforeData, defaultBearingData);
      const innerAfterTouched = isDataTouched(innerAfterData, defaultBearingData);

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

      // Require at least one measurement set
      if (!outerAfterTouched && !innerAfterTouched) {
        errors.push(
          'Bearing Clearance: You must fill at least one measurement section (Outer Data or Inner Data)',
        );
      }

      // Validate required shared fields
      if (includeBeforeMeasurements && !beforeHasBeenAdjusted) {
        errors.push(
          'Bearing Clearance: "Has Been Adjusted" field is required for before measurements',
        );
      }
      if (!afterHasBeenAdjusted) {
        errors.push(
          'Bearing Clearance: "Has Been Adjusted" field is required for after measurements',
        );
      }

      if (errors.length > 0) {
        return { isValid: false, errors };
      }

      // Shared fields for before measurements
      const beforeSharedFields = {
        hasBeenAdjusted: beforeHasBeenAdjusted || YesNoNaDncType.NO,
        slideMotorMounts,
        powerCordHoses,
        chainsGearsSprockets,
        lockingClamps,
        notes,
      };

      // Shared fields for after measurements
      const afterSharedFields = {
        hasBeenAdjusted: afterHasBeenAdjusted || YesNoNaDncType.NO,
        slideMotorMounts,
        powerCordHoses,
        chainsGearsSprockets,
        lockingClamps,
        notes,
      };

      // Outer-specific fields for before
      const outerBeforeFields = {
        combinedWith: outerCombinedWith,
        matingPart: outerMatingPart,
        ...beforeSharedFields,
      };

      // Outer-specific fields for after
      const outerAfterFields = {
        combinedWith: outerCombinedWith,
        matingPart: outerMatingPart,
        ...afterSharedFields,
      };

      // Inner-specific fields for before
      const innerBeforeFields = {
        combinedWith: innerCombinedWith,
        matingPart: innerMatingPart,
        ...beforeSharedFields,
      };

      // Inner-specific fields for after
      const innerAfterFields = {
        combinedWith: innerCombinedWith,
        matingPart: innerMatingPart,
        ...afterSharedFields,
      };

      const data: BearingClearanceSectionData = {
        outerBefore:
          includeBeforeMeasurements && outerBeforeTouched
            ? { ...outerBeforeData, ...outerBeforeFields }
            : undefined,
        outerAfter: outerAfterTouched ? { ...outerAfterData, ...outerAfterFields } : undefined,
        innerBefore:
          includeBeforeMeasurements && innerBeforeTouched
            ? { ...innerBeforeData, ...innerBeforeFields }
            : undefined,
        innerAfter: innerAfterTouched ? { ...innerAfterData, ...innerAfterFields } : undefined,
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
                {/* Has Been Adjusted - Before Maintenance */}
                <div className="mb-6 pt-4">
                  <Label
                    htmlFor="hasBeenAdjustedBefore"
                    className="text-xs font-semibold mb-2 block"
                  >
                    {t('form.bearingClearanceSection.hasBeenAdjusted')}
                  </Label>
                  <Select
                    value={beforeHasBeenAdjusted}
                    onValueChange={(value) => {
                      setBeforeHasBeenAdjusted(value as YesNoNaDncType);
                      onSectionTouched();
                    }}
                  >
                    <SelectTrigger id="hasBeenAdjustedBefore" className="text-sm w-full max-w-xs">
                      <SelectValue placeholder={t('form.common.selectOption')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YES">{t('form.enums.yesNoNaDnc.yes')}</SelectItem>
                      <SelectItem value="NO">{t('form.enums.yesNoNaDnc.no')}</SelectItem>
                      <SelectItem value="NA">{t('form.enums.yesNoNaDnc.na')}</SelectItem>
                      <SelectItem value="DNC">{t('form.enums.yesNoNaDnc.dnc')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Tabs defaultValue="outer" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="outer">{t('form.common.outer')}</TabsTrigger>
                    <TabsTrigger value="inner">{t('form.common.inner')}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="outer" className="space-y-6">
                    <div className="pt-6 border-t">
                      <div className="grid grid-cols-2 gap-6 items-end">
                        {/* Combined With */}
                        <div>
                          <Label
                            htmlFor="outerCombinedWith"
                            className="text-xs font-semibold mb-2 block"
                          >
                            {t('form.bearingClearanceSection.combinedWith')}
                          </Label>
                          <Input
                            id="outerCombinedWith"
                            type="text"
                            value={outerCombinedWith}
                            onChange={(e) => {
                              setOuterCombinedWith(e.target.value);
                              onSectionTouched();
                            }}
                            placeholder={t('form.common.referenceMeasurement')}
                            className="text-sm"
                          />
                        </div>

                        {/* Mating Part Type */}
                        <div>
                          <Label
                            htmlFor="outerMatingPart"
                            className="text-xs font-semibold mb-2 block"
                          >
                            {t('form.bearingClearanceSection.matingPartType')}
                          </Label>
                          <Select
                            value={outerMatingPart}
                            onValueChange={(value) => {
                              setOuterMatingPart(value as MatingPartType);
                              onSectionTouched();
                            }}
                          >
                            <SelectTrigger id="outerMatingPart" className="text-sm">
                              <SelectValue placeholder={t('form.common.selectMatingPart')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={MatingPartType.BUSHING}>
                                {t('form.enums.matingPartType.bushing')}
                              </SelectItem>
                              <SelectItem value={MatingPartType.CONNECTION}>
                                {t('form.enums.matingPartType.connection')}
                              </SelectItem>
                              <SelectItem value={MatingPartType.NUT_SCREW_SLEEVE}>
                                {t('form.enums.matingPartType.nutScrewSleeve')}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <BearingClearanceForm
                      title=""
                      data={outerBeforeData}
                      updateFn={updateOuterBeforeField}
                      errors={outerBeforeErrors}
                      handleBlur={handleBlurOuterBefore}
                    />
                  </TabsContent>

                  <TabsContent value="inner" className="space-y-6">
                    <div className="pt-6 border-t">
                      <div className="grid grid-cols-2 gap-6 items-end">
                        {/* Combined With */}
                        <div>
                          <Label
                            htmlFor="innerCombinedWith"
                            className="text-xs font-semibold mb-2 block"
                          >
                            {t('form.bearingClearanceSection.combinedWith')}
                          </Label>
                          <Input
                            id="innerCombinedWith"
                            type="text"
                            value={innerCombinedWith}
                            onChange={(e) => {
                              setInnerCombinedWith(e.target.value);
                              onSectionTouched();
                            }}
                            placeholder={t('form.common.referenceMeasurement')}
                            className="text-sm"
                          />
                        </div>

                        {/* Mating Part Type */}
                        <div>
                          <Label
                            htmlFor="innerMatingPart"
                            className="text-xs font-semibold mb-2 block"
                          >
                            {t('form.bearingClearanceSection.matingPartType')}
                          </Label>
                          <Select
                            value={innerMatingPart}
                            onValueChange={(value) => {
                              setInnerMatingPart(value as MatingPartType);
                              onSectionTouched();
                            }}
                          >
                            <SelectTrigger id="innerMatingPart" className="text-sm">
                              <SelectValue placeholder={t('form.common.selectMatingPart')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={MatingPartType.BUSHING}>
                                {t('form.enums.matingPartType.bushing')}
                              </SelectItem>
                              <SelectItem value={MatingPartType.CONNECTION}>
                                {t('form.enums.matingPartType.connection')}
                              </SelectItem>
                              <SelectItem value={MatingPartType.NUT_SCREW_SLEEVE}>
                                {t('form.enums.matingPartType.nutScrewSleeve')}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <BearingClearanceForm
                      title=""
                      data={innerBeforeData}
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
                {/* Has Been Adjusted - After Maintenance */}
                <div className="mb-6 pt-4">
                  <Label
                    htmlFor="hasBeenAdjustedAfter"
                    className="text-xs font-semibold mb-2 block"
                  >
                    {t('form.bearingClearanceSection.hasBeenAdjusted')}
                  </Label>
                  <Select
                    value={afterHasBeenAdjusted}
                    onValueChange={(value) => {
                      setAfterHasBeenAdjusted(value as YesNoNaDncType);
                      onSectionTouched();
                    }}
                  >
                    <SelectTrigger id="hasBeenAdjustedAfter" className="text-sm w-full max-w-xs">
                      <SelectValue placeholder={t('form.common.selectOption')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YES">{t('form.enums.yesNoNaDnc.yes')}</SelectItem>
                      <SelectItem value="NO">{t('form.enums.yesNoNaDnc.no')}</SelectItem>
                      <SelectItem value="NA">{t('form.enums.yesNoNaDnc.na')}</SelectItem>
                      <SelectItem value="DNC">{t('form.enums.yesNoNaDnc.dnc')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Tabs defaultValue="outer" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="outer">{t('form.common.outer')}</TabsTrigger>
                    <TabsTrigger value="inner">{t('form.common.inner')}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="outer" className="space-y-6">
                    <div className="pt-6 border-t">
                      <div className="grid grid-cols-2 gap-6 items-end">
                        {/* Combined With */}
                        <div>
                          <Label
                            htmlFor="outerCombinedWithAfter"
                            className="text-xs font-semibold mb-2 block"
                          >
                            {t('form.bearingClearanceSection.combinedWith')}
                          </Label>
                          <Input
                            id="outerCombinedWithAfter"
                            type="text"
                            value={outerCombinedWith}
                            onChange={(e) => {
                              setOuterCombinedWith(e.target.value);
                              onSectionTouched();
                            }}
                            placeholder={t('form.common.referenceMeasurement')}
                            className="text-sm"
                          />
                        </div>

                        {/* Mating Part Type */}
                        <div>
                          <Label
                            htmlFor="outerMatingPartAfter"
                            className="text-xs font-semibold mb-2 block"
                          >
                            {t('form.bearingClearanceSection.matingPartType')}
                          </Label>
                          <Select
                            value={outerMatingPart}
                            onValueChange={(value) => {
                              setOuterMatingPart(value as MatingPartType);
                              onSectionTouched();
                            }}
                          >
                            <SelectTrigger id="outerMatingPartAfter" className="text-sm">
                              <SelectValue placeholder={t('form.common.selectMatingPart')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={MatingPartType.BUSHING}>
                                {t('form.enums.matingPartType.bushing')}
                              </SelectItem>
                              <SelectItem value={MatingPartType.CONNECTION}>
                                {t('form.enums.matingPartType.connection')}
                              </SelectItem>
                              <SelectItem value={MatingPartType.NUT_SCREW_SLEEVE}>
                                {t('form.enums.matingPartType.nutScrewSleeve')}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <BearingClearanceForm
                      title=""
                      data={outerAfterData}
                      updateFn={updateOuterAfterField}
                      errors={outerAfterErrors}
                      handleBlur={handleBlurOuterAfter}
                    />
                  </TabsContent>

                  <TabsContent value="inner" className="space-y-6">
                    <div className="pt-6 border-t">
                      <div className="grid grid-cols-2 gap-6 items-end">
                        {/* Combined With */}
                        <div>
                          <Label
                            htmlFor="innerCombinedWithAfter"
                            className="text-xs font-semibold mb-2 block"
                          >
                            {t('form.bearingClearanceSection.combinedWith')}
                          </Label>
                          <Input
                            id="innerCombinedWithAfter"
                            type="text"
                            value={innerCombinedWith}
                            onChange={(e) => {
                              setInnerCombinedWith(e.target.value);
                              onSectionTouched();
                            }}
                            placeholder={t('form.common.referenceMeasurement')}
                            className="text-sm"
                          />
                        </div>

                        {/* Mating Part Type */}
                        <div>
                          <Label
                            htmlFor="innerMatingPartAfter"
                            className="text-xs font-semibold mb-2 block"
                          >
                            {t('form.bearingClearanceSection.matingPartType')}
                          </Label>
                          <Select
                            value={innerMatingPart}
                            onValueChange={(value) => {
                              setInnerMatingPart(value as MatingPartType);
                              onSectionTouched();
                            }}
                          >
                            <SelectTrigger id="innerMatingPartAfter" className="text-sm">
                              <SelectValue placeholder={t('form.common.selectMatingPart')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={MatingPartType.BUSHING}>
                                {t('form.enums.matingPartType.bushing')}
                              </SelectItem>
                              <SelectItem value={MatingPartType.CONNECTION}>
                                {t('form.enums.matingPartType.connection')}
                              </SelectItem>
                              <SelectItem value={MatingPartType.NUT_SCREW_SLEEVE}>
                                {t('form.enums.matingPartType.nutScrewSleeve')}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <BearingClearanceForm
                      title=""
                      data={innerAfterData}
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
          {/* Has Been Adjusted - Shared Field */}
          <div className="mb-6">
            <Label htmlFor="hasBeenAdjustedRegular" className="text-xs font-semibold mb-2 block">
              {t('form.bearingClearanceSection.hasBeenAdjusted')}
            </Label>
            <Select
              value={afterHasBeenAdjusted}
              onValueChange={(value) => {
                setAfterHasBeenAdjusted(value as YesNoNaDncType);
                onSectionTouched();
              }}
            >
              <SelectTrigger id="hasBeenAdjustedRegular" className="text-sm w-full max-w-xs">
                <SelectValue placeholder={t('form.common.selectOption')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="YES">{t('form.enums.yesNoNaDnc.yes')}</SelectItem>
                <SelectItem value="NO">{t('form.enums.yesNoNaDnc.no')}</SelectItem>
                <SelectItem value="NA">{t('form.enums.yesNoNaDnc.na')}</SelectItem>
                <SelectItem value="DNC">{t('form.enums.yesNoNaDnc.dnc')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="outer" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="outer">{t('form.common.outer')}</TabsTrigger>
              <TabsTrigger value="inner">{t('form.common.inner')}</TabsTrigger>
            </TabsList>

            <TabsContent value="outer" className="space-y-6">
              <div className="pt-6 border-t">
                <div className="grid grid-cols-2 gap-6 items-end">
                  {/* Combined With */}
                  <div>
                    <Label htmlFor="outerCombinedWith" className="text-xs font-semibold mb-2 block">
                      {t('form.bearingClearanceSection.combinedWith')}
                    </Label>
                    <Input
                      id="outerCombinedWith"
                      type="text"
                      value={outerCombinedWith}
                      onChange={(e) => {
                        setOuterCombinedWith(e.target.value);
                        onSectionTouched();
                      }}
                      placeholder={t('form.common.referenceMeasurement')}
                      className="text-sm"
                    />
                  </div>

                  {/* Mating Part Type */}
                  <div>
                    <Label htmlFor="outerMatingPart" className="text-xs font-semibold mb-2 block">
                      {t('form.bearingClearanceSection.matingPartType')}
                    </Label>
                    <Select
                      value={outerMatingPart}
                      onValueChange={(value) => {
                        setOuterMatingPart(value as MatingPartType);
                        onSectionTouched();
                      }}
                    >
                      <SelectTrigger id="outerMatingPart" className="text-sm">
                        <SelectValue placeholder={t('form.common.selectMatingPart')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={MatingPartType.BUSHING}>
                          {t('form.enums.matingPartType.bushing')}
                        </SelectItem>
                        <SelectItem value={MatingPartType.CONNECTION}>
                          {t('form.enums.matingPartType.connection')}
                        </SelectItem>
                        <SelectItem value={MatingPartType.NUT_SCREW_SLEEVE}>
                          {t('form.enums.matingPartType.nutScrewSleeve')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <BearingClearanceForm
                title=""
                data={outerAfterData}
                updateFn={updateOuterAfterField}
                errors={outerAfterErrors}
                handleBlur={handleBlurOuterAfter}
              />
            </TabsContent>

            <TabsContent value="inner" className="space-y-6">
              <div className="pt-6 border-t">
                <div className="grid grid-cols-2 gap-6 items-end">
                  {/* Combined With */}
                  <div>
                    <Label htmlFor="innerCombinedWith" className="text-xs font-semibold mb-2 block">
                      {t('form.bearingClearanceSection.combinedWith')}
                    </Label>
                    <Input
                      id="innerCombinedWith"
                      type="text"
                      value={innerCombinedWith}
                      onChange={(e) => {
                        setInnerCombinedWith(e.target.value);
                        onSectionTouched();
                      }}
                      placeholder={t('form.common.referenceMeasurement')}
                      className="text-sm"
                    />
                  </div>

                  {/* Mating Part Type */}
                  <div>
                    <Label htmlFor="innerMatingPart" className="text-xs font-semibold mb-2 block">
                      {t('form.bearingClearanceSection.matingPartType')}
                    </Label>
                    <Select
                      value={innerMatingPart}
                      onValueChange={(value) => {
                        setInnerMatingPart(value as MatingPartType);
                        onSectionTouched();
                      }}
                    >
                      <SelectTrigger id="innerMatingPart" className="text-sm">
                        <SelectValue placeholder={t('form.common.selectMatingPart')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={MatingPartType.BUSHING}>
                          {t('form.enums.matingPartType.bushing')}
                        </SelectItem>
                        <SelectItem value={MatingPartType.CONNECTION}>
                          {t('form.enums.matingPartType.connection')}
                        </SelectItem>
                        <SelectItem value={MatingPartType.NUT_SCREW_SLEEVE}>
                          {t('form.enums.matingPartType.nutScrewSleeve')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <BearingClearanceForm
                title=""
                data={innerAfterData}
                updateFn={updateInnerAfterField}
                errors={innerAfterErrors}
                handleBlur={handleBlurInnerAfter}
              />
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Shared Fields - Shutdown Adjustment Mechanism */}
      <div className="space-y-6 pt-6 border-t">
        {/* Shutdown Adjustment Mechanism */}
        <div className="space-y-4">
          <h5 className="text-sm font-semibold">
            {t('form.bearingClearanceSection.shutdownAdjustmentMechanism')}
          </h5>

          <div className="grid grid-cols-2 gap-6">
            {/* Slide Motor/Mounts */}
            <div>
              <Label htmlFor="slideMotorMounts" className="text-xs font-medium mb-2 block">
                {t('form.bearingClearanceSection.slideMotorMounts')}
              </Label>
              <Select
                value={slideMotorMounts}
                onValueChange={(value) => {
                  setSlideMotorMounts(value as ConditionOkNaDncBrokenWornType);
                  onSectionTouched();
                }}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder={t('form.common.selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ConditionOkNaDncBrokenWornType.OK}>
                    {t('form.enums.conditionOkNaDncBrokenWorn.ok')}
                  </SelectItem>
                  <SelectItem value={ConditionOkNaDncBrokenWornType.NA}>
                    {t('form.enums.conditionOkNaDncBrokenWorn.na')}
                  </SelectItem>
                  <SelectItem value={ConditionOkNaDncBrokenWornType.DNC}>
                    {t('form.enums.conditionOkNaDncBrokenWorn.dnc')}
                  </SelectItem>
                  <SelectItem value={ConditionOkNaDncBrokenWornType.BROKEN}>
                    {t('form.enums.conditionOkNaDncBrokenWorn.broken')}
                  </SelectItem>
                  <SelectItem value={ConditionOkNaDncBrokenWornType.WORN}>
                    {t('form.enums.conditionOkNaDncBrokenWorn.worn')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Power Cord/Hoses */}
            <div>
              <Label htmlFor="powerCordHoses" className="text-xs font-medium mb-2 block">
                {t('form.bearingClearanceSection.powerCordHoses')}
              </Label>
              <Select
                value={powerCordHoses}
                onValueChange={(value) => {
                  setPowerCordHoses(value as ConditionOkNaDncDamagedType);
                  onSectionTouched();
                }}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder={t('form.common.selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ConditionOkNaDncDamagedType.OK}>
                    {t('form.enums.conditionOkNaDncDamaged.ok')}
                  </SelectItem>
                  <SelectItem value={ConditionOkNaDncDamagedType.NA}>
                    {t('form.enums.conditionOkNaDncDamaged.na')}
                  </SelectItem>
                  <SelectItem value={ConditionOkNaDncDamagedType.DNC}>
                    {t('form.enums.conditionOkNaDncDamaged.dnc')}
                  </SelectItem>
                  <SelectItem value={ConditionOkNaDncDamagedType.DAMAGED}>
                    {t('form.enums.conditionOkNaDncDamaged.damaged')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Chains & Gears/Sprockets */}
            <div>
              <Label htmlFor="chainsGearsSprockets" className="text-xs font-medium mb-2 block">
                {t('form.bearingClearanceSection.chainsGearsSprockets')}
              </Label>
              <Select
                value={chainsGearsSprockets}
                onValueChange={(value) => {
                  setChainsGearsSprockets(value as ConditionOkNaDncBrokenLooseType);
                  onSectionTouched();
                }}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder={t('form.common.selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ConditionOkNaDncBrokenLooseType.OK}>
                    {t('form.enums.conditionOkNaDncBrokenLoose.ok')}
                  </SelectItem>
                  <SelectItem value={ConditionOkNaDncBrokenLooseType.NA}>
                    {t('form.enums.conditionOkNaDncBrokenLoose.na')}
                  </SelectItem>
                  <SelectItem value={ConditionOkNaDncBrokenLooseType.DNC}>
                    {t('form.enums.conditionOkNaDncBrokenLoose.dnc')}
                  </SelectItem>
                  <SelectItem value={ConditionOkNaDncBrokenLooseType.BROKEN}>
                    {t('form.enums.conditionOkNaDncBrokenLoose.broken')}
                  </SelectItem>
                  <SelectItem value={ConditionOkNaDncBrokenLooseType.LOOSE}>
                    {t('form.enums.conditionOkNaDncBrokenLoose.loose')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Locking Clamps */}
            <div>
              <Label htmlFor="lockingClamps" className="text-xs font-medium mb-2 block">
                {t('form.bearingClearanceSection.lockingClamps')}
              </Label>
              <Select
                value={lockingClamps}
                onValueChange={(value) => {
                  setLockingClamps(value as ConditionOkNaDncDamagedType);
                  onSectionTouched();
                }}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder={t('form.common.selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ConditionOkNaDncDamagedType.OK}>
                    {t('form.enums.conditionOkNaDncDamaged.ok')}
                  </SelectItem>
                  <SelectItem value={ConditionOkNaDncDamagedType.NA}>
                    {t('form.enums.conditionOkNaDncDamaged.na')}
                  </SelectItem>
                  <SelectItem value={ConditionOkNaDncDamagedType.DNC}>
                    {t('form.enums.conditionOkNaDncDamaged.dnc')}
                  </SelectItem>
                  <SelectItem value={ConditionOkNaDncDamagedType.DAMAGED}>
                    {t('form.enums.conditionOkNaDncDamaged.damaged')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-xs font-medium mb-2 block">
              {t('form.common.notes')}
            </Label>
            <Input
              id="notes"
              type="text"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                onSectionTouched();
              }}
              placeholder={t('form.common.additionalNotes')}
              className="text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
});

BearingClearanceSection.displayName = 'BearingClearanceSection';
