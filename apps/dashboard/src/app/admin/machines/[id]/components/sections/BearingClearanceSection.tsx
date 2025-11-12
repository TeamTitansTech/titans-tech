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
  hasBeenAdjusted: '',
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
  reset: () => void;
}

interface BearingClearanceSectionProps {
  onSectionTouched: () => void;
  serviceType: ServiceType;
}

export const BearingClearanceSection = forwardRef<
  BearingClearanceSectionRef,
  BearingClearanceSectionProps
>(({ onSectionTouched, serviceType }, ref) => {
  const t = useTranslations('inspections');

  // State
  const [includeBeforeMeasurements, setIncludeBeforeMeasurements] = useState(false);
  const [isBeforeOpen, setIsBeforeOpen] = useState(true);
  const [isAfterOpen, setIsAfterOpen] = useState(true);
  const [outerBeforeData, setOuterBeforeData] = useState<BearingClearanceData>(defaultBearingData);
  const [outerAfterData, setOuterAfterData] = useState<BearingClearanceData>(defaultBearingData);
  const [innerBeforeData, setInnerBeforeData] = useState<BearingClearanceData>(defaultBearingData);
  const [innerAfterData, setInnerAfterData] = useState<BearingClearanceData>(defaultBearingData);

  // Tab-specific fields (separate for Outer and Inner)
  const [outerHasBeenAdjusted, setOuterHasBeenAdjusted] = useState('');
  const [outerCombinedWith, setOuterCombinedWith] = useState('');
  const [outerMatingPart, setOuterMatingPart] = useState<MatingPartType>(MatingPartType.BUSHING);
  const [innerHasBeenAdjusted, setInnerHasBeenAdjusted] = useState('');
  const [innerCombinedWith, setInnerCombinedWith] = useState('');
  const [innerMatingPart, setInnerMatingPart] = useState<MatingPartType>(MatingPartType.BUSHING);

  // Shared fields (Shutdown Adjustment Mechanism)
  const [slideMotorMounts, setSlideMotorMounts] = useState('');
  const [powerCordHoses, setPowerCordHoses] = useState('');
  const [chainsGearsSprockets, setChainsGearsSprockets] = useState('');
  const [lockingClamps, setLockingClamps] = useState('');
  const [notes, setNotes] = useState('');

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
    if (field === 'combinedWith' || field === 'matingPart' || field === 'hasBeenAdjusted') {
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

      // Shared fields for all measurements
      const sharedFields = {
        slideMotorMounts,
        powerCordHoses,
        chainsGearsSprockets,
        lockingClamps,
        notes,
      };

      // Outer-specific fields
      const outerFields = {
        hasBeenAdjusted: outerHasBeenAdjusted,
        combinedWith: outerCombinedWith,
        matingPart: outerMatingPart,
        ...sharedFields,
      };

      // Inner-specific fields
      const innerFields = {
        hasBeenAdjusted: innerHasBeenAdjusted,
        combinedWith: innerCombinedWith,
        matingPart: innerMatingPart,
        ...sharedFields,
      };

      return {
        outerBefore:
          includeBeforeMeasurements && outerBeforeTouched
            ? { ...outerBeforeData, ...outerFields }
            : undefined,
        outerAfter: outerAfterTouched ? { ...outerAfterData, ...outerFields } : undefined,
        innerBefore:
          includeBeforeMeasurements && innerBeforeTouched
            ? { ...innerBeforeData, ...innerFields }
            : undefined,
        innerAfter: innerAfterTouched ? { ...innerAfterData, ...innerFields } : undefined,
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

      return errors;
    },

    reset: () => {
      setIncludeBeforeMeasurements(false);
      setOuterBeforeData(defaultBearingData);
      setOuterAfterData(defaultBearingData);
      setInnerBeforeData(defaultBearingData);
      setInnerAfterData(defaultBearingData);
      setOuterHasBeenAdjusted('');
      setOuterCombinedWith('');
      setOuterMatingPart(MatingPartType.BUSHING);
      setInnerHasBeenAdjusted('');
      setInnerCombinedWith('');
      setInnerMatingPart(MatingPartType.BUSHING);
      setSlideMotorMounts('');
      setPowerCordHoses('');
      setChainsGearsSprockets('');
      setLockingClamps('');
      setNotes('');
      setOuterBeforeErrors({});
      setOuterAfterErrors({});
      setInnerBeforeErrors({});
      setInnerAfterErrors({});
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
            Include Before Measurements
          </Label>
        </div>
      )}

      {includeBeforeMeasurements ? (
        <div className="space-y-8">
          {/* Before Maintenance Section */}
          <Collapsible open={isBeforeOpen} onOpenChange={setIsBeforeOpen}>
            <div className="space-y-4">
              <CollapsibleTrigger className="flex items-center justify-between w-full group">
                <h4 className="text-lg font-semibold">Before Maintenance</h4>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isBeforeOpen ? '' : 'rotate-180'
                  }`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Tabs defaultValue="outer" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="outer">Outer</TabsTrigger>
                    <TabsTrigger value="inner">Inner</TabsTrigger>
                  </TabsList>

                  <TabsContent value="outer" className="space-y-6">
                    <div className="pt-6 border-t">
                      <div className="grid grid-cols-3 gap-6 items-end">
                        {/* Combined With */}
                        <div>
                          <Label
                            htmlFor="outerCombinedWith"
                            className="text-xs font-semibold mb-2 block"
                          >
                            Combined With
                          </Label>
                          <Input
                            id="outerCombinedWith"
                            type="text"
                            value={outerCombinedWith}
                            onChange={(e) => {
                              setOuterCombinedWith(e.target.value);
                              onSectionTouched();
                            }}
                            placeholder="Reference measurement"
                            className="text-sm"
                          />
                        </div>

                        {/* Mating Part Type */}
                        <div>
                          <Label
                            htmlFor="outerMatingPart"
                            className="text-xs font-semibold mb-2 block"
                          >
                            Mating Part Type
                          </Label>
                          <Select
                            value={outerMatingPart}
                            onValueChange={(value) => {
                              setOuterMatingPart(value as MatingPartType);
                              onSectionTouched();
                            }}
                          >
                            <SelectTrigger id="outerMatingPart" className="text-sm">
                              <SelectValue placeholder="Select mating part" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={MatingPartType.BUSHING}>Bushing</SelectItem>
                              <SelectItem value={MatingPartType.CONNECTION}>Connection</SelectItem>
                              <SelectItem value={MatingPartType.NUT_SCREW_SLEEVE}>
                                Nut Screw Sleeve
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Has Been Adjusted Select */}
                        <div>
                          <Label
                            htmlFor="outerHasBeenAdjusted"
                            className="text-xs font-semibold mb-2 block"
                          >
                            Has Been Adjusted
                          </Label>
                          <Select
                            value={outerHasBeenAdjusted}
                            onValueChange={(value) => {
                              setOuterHasBeenAdjusted(value);
                              onSectionTouched();
                            }}
                          >
                            <SelectTrigger id="outerHasBeenAdjusted" className="text-sm">
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Yes">Yes</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                              <SelectItem value="N/A">N/A</SelectItem>
                              <SelectItem value="DNC">DNC</SelectItem>
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
                      <div className="grid grid-cols-3 gap-6 items-end">
                        {/* Combined With */}
                        <div>
                          <Label
                            htmlFor="innerCombinedWith"
                            className="text-xs font-semibold mb-2 block"
                          >
                            Combined With
                          </Label>
                          <Input
                            id="innerCombinedWith"
                            type="text"
                            value={innerCombinedWith}
                            onChange={(e) => {
                              setInnerCombinedWith(e.target.value);
                              onSectionTouched();
                            }}
                            placeholder="Reference measurement"
                            className="text-sm"
                          />
                        </div>

                        {/* Mating Part Type */}
                        <div>
                          <Label
                            htmlFor="innerMatingPart"
                            className="text-xs font-semibold mb-2 block"
                          >
                            Mating Part Type
                          </Label>
                          <Select
                            value={innerMatingPart}
                            onValueChange={(value) => {
                              setInnerMatingPart(value as MatingPartType);
                              onSectionTouched();
                            }}
                          >
                            <SelectTrigger id="innerMatingPart" className="text-sm">
                              <SelectValue placeholder="Select mating part" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={MatingPartType.BUSHING}>Bushing</SelectItem>
                              <SelectItem value={MatingPartType.CONNECTION}>Connection</SelectItem>
                              <SelectItem value={MatingPartType.NUT_SCREW_SLEEVE}>
                                Nut Screw Sleeve
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Has Been Adjusted Select */}
                        <div>
                          <Label
                            htmlFor="innerHasBeenAdjusted"
                            className="text-xs font-semibold mb-2 block"
                          >
                            Has Been Adjusted
                          </Label>
                          <Select
                            value={innerHasBeenAdjusted}
                            onValueChange={(value) => {
                              setInnerHasBeenAdjusted(value);
                              onSectionTouched();
                            }}
                          >
                            <SelectTrigger id="innerHasBeenAdjusted" className="text-sm">
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Yes">Yes</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                              <SelectItem value="N/A">N/A</SelectItem>
                              <SelectItem value="DNC">DNC</SelectItem>
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
                <h4 className="text-lg font-semibold">After Maintenance</h4>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isAfterOpen ? '' : 'rotate-180'
                  }`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Tabs defaultValue="outer" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="outer">Outer</TabsTrigger>
                    <TabsTrigger value="inner">Inner</TabsTrigger>
                  </TabsList>

                  <TabsContent value="outer" className="space-y-6">
                    <BearingClearanceForm
                      title=""
                      data={outerAfterData}
                      updateFn={updateOuterAfterField}
                      errors={outerAfterErrors}
                      handleBlur={handleBlurOuterAfter}
                    />
                  </TabsContent>

                  <TabsContent value="inner" className="space-y-6">
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
        <Tabs defaultValue="outer" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="outer">Outer</TabsTrigger>
            <TabsTrigger value="inner">Inner</TabsTrigger>
          </TabsList>

          <TabsContent value="outer" className="space-y-6">
            <div className="pt-6 border-t">
              <div className="grid grid-cols-3 gap-6 items-end">
                {/* Combined With */}
                <div>
                  <Label htmlFor="outerCombinedWith" className="text-xs font-semibold mb-2 block">
                    Combined With
                  </Label>
                  <Input
                    id="outerCombinedWith"
                    type="text"
                    value={outerCombinedWith}
                    onChange={(e) => {
                      setOuterCombinedWith(e.target.value);
                      onSectionTouched();
                    }}
                    placeholder="Reference measurement"
                    className="text-sm"
                  />
                </div>

                {/* Mating Part Type */}
                <div>
                  <Label htmlFor="outerMatingPart" className="text-xs font-semibold mb-2 block">
                    Mating Part Type
                  </Label>
                  <Select
                    value={outerMatingPart}
                    onValueChange={(value) => {
                      setOuterMatingPart(value as MatingPartType);
                      onSectionTouched();
                    }}
                  >
                    <SelectTrigger id="outerMatingPart" className="text-sm">
                      <SelectValue placeholder="Select mating part" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={MatingPartType.BUSHING}>Bushing</SelectItem>
                      <SelectItem value={MatingPartType.CONNECTION}>Connection</SelectItem>
                      <SelectItem value={MatingPartType.NUT_SCREW_SLEEVE}>
                        Nut Screw Sleeve
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Has Been Adjusted Select */}
                <div>
                  <Label
                    htmlFor="outerHasBeenAdjusted"
                    className="text-xs font-semibold mb-2 block"
                  >
                    Has Been Adjusted
                  </Label>
                  <Select
                    value={outerHasBeenAdjusted}
                    onValueChange={(value) => {
                      setOuterHasBeenAdjusted(value);
                      onSectionTouched();
                    }}
                  >
                    <SelectTrigger id="outerHasBeenAdjusted" className="text-sm">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                      <SelectItem value="DNC">DNC</SelectItem>
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
              <div className="grid grid-cols-3 gap-6 items-end">
                {/* Combined With */}
                <div>
                  <Label htmlFor="innerCombinedWith" className="text-xs font-semibold mb-2 block">
                    Combined With
                  </Label>
                  <Input
                    id="innerCombinedWith"
                    type="text"
                    value={innerCombinedWith}
                    onChange={(e) => {
                      setInnerCombinedWith(e.target.value);
                      onSectionTouched();
                    }}
                    placeholder="Reference measurement"
                    className="text-sm"
                  />
                </div>

                {/* Mating Part Type */}
                <div>
                  <Label htmlFor="innerMatingPart" className="text-xs font-semibold mb-2 block">
                    Mating Part Type
                  </Label>
                  <Select
                    value={innerMatingPart}
                    onValueChange={(value) => {
                      setInnerMatingPart(value as MatingPartType);
                      onSectionTouched();
                    }}
                  >
                    <SelectTrigger id="innerMatingPart" className="text-sm">
                      <SelectValue placeholder="Select mating part" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={MatingPartType.BUSHING}>Bushing</SelectItem>
                      <SelectItem value={MatingPartType.CONNECTION}>Connection</SelectItem>
                      <SelectItem value={MatingPartType.NUT_SCREW_SLEEVE}>
                        Nut Screw Sleeve
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Has Been Adjusted Select */}
                <div>
                  <Label
                    htmlFor="innerHasBeenAdjusted"
                    className="text-xs font-semibold mb-2 block"
                  >
                    Has Been Adjusted
                  </Label>
                  <Select
                    value={innerHasBeenAdjusted}
                    onValueChange={(value) => {
                      setInnerHasBeenAdjusted(value);
                      onSectionTouched();
                    }}
                  >
                    <SelectTrigger id="innerHasBeenAdjusted" className="text-sm">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                      <SelectItem value="DNC">DNC</SelectItem>
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
      )}

      {/* Shared Fields - Shutdown Adjustment Mechanism */}
      <div className="space-y-6 pt-6 border-t">
        {/* Shutdown Adjustment Mechanism */}
        <div className="space-y-4">
          <h5 className="text-sm font-semibold">Shutdown Adjustment Mechanism</h5>

          <div className="grid grid-cols-2 gap-6">
            {/* Slide Motor/Mounts */}
            <div>
              <Label htmlFor="slideMotorMounts" className="text-xs font-medium mb-2 block">
                Slide Motor/Mounts
              </Label>
              <Input
                id="slideMotorMounts"
                type="text"
                value={slideMotorMounts}
                onChange={(e) => {
                  setSlideMotorMounts(e.target.value);
                  onSectionTouched();
                }}
                placeholder="Enter status"
                className="text-sm"
              />
            </div>

            {/* Power Cord/Hoses */}
            <div>
              <Label htmlFor="powerCordHoses" className="text-xs font-medium mb-2 block">
                Power Cord/Hoses
              </Label>
              <Input
                id="powerCordHoses"
                type="text"
                value={powerCordHoses}
                onChange={(e) => {
                  setPowerCordHoses(e.target.value);
                  onSectionTouched();
                }}
                placeholder="Enter status"
                className="text-sm"
              />
            </div>

            {/* Chains & Gears/Sprockets */}
            <div>
              <Label htmlFor="chainsGearsSprockets" className="text-xs font-medium mb-2 block">
                Chains & Gears/Sprockets
              </Label>
              <Input
                id="chainsGearsSprockets"
                type="text"
                value={chainsGearsSprockets}
                onChange={(e) => {
                  setChainsGearsSprockets(e.target.value);
                  onSectionTouched();
                }}
                placeholder="Enter status"
                className="text-sm"
              />
            </div>

            {/* Locking Clamps */}
            <div>
              <Label htmlFor="lockingClamps" className="text-xs font-medium mb-2 block">
                Locking Clamps
              </Label>
              <Input
                id="lockingClamps"
                type="text"
                value={lockingClamps}
                onChange={(e) => {
                  setLockingClamps(e.target.value);
                  onSectionTouched();
                }}
                placeholder="Enter status"
                className="text-sm"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-xs font-medium mb-2 block">
              Notes
            </Label>
            <Input
              id="notes"
              type="text"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                onSectionTouched();
              }}
              placeholder="Enter any additional notes..."
              className="text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
});

BearingClearanceSection.displayName = 'BearingClearanceSection';
