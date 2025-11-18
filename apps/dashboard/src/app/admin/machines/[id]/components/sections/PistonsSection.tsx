'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type PistonsData, ServiceType, SealConditionType } from '@/data/types/services.types';
import { PistonsForm } from '../forms/PistonsForm';
import { isDataTouched } from './utils';
import { validateNumericFields } from '../utils/validateNumericFields';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const defaultPistonsData: PistonsData = {
  // OUTER SECTION - LH Piston
  outerLhFrontTop: 0,
  outerLhFrontBottom: 0,
  outerLhLeft: 0,
  outerLhRight: 0,
  // OUTER SECTION - RH Piston
  outerRhFrontTop: 0,
  outerRhFrontBottom: 0,
  outerRhLeft: 0,
  outerRhRight: 0,
  // INNER SECTION - LH Piston
  innerLhFrontTop: 0,
  innerLhFrontBottom: 0,
  innerLhLeft: 0,
  innerLhRight: 0,
  // INNER SECTION - RH Piston
  innerRhFrontTop: 0,
  innerRhFrontBottom: 0,
  innerRhLeft: 0,
  innerRhRight: 0,
};

export const validatePistonsData = (data: PistonsData): string[] => {
  return validateNumericFields(data, ['outer', 'inner']);
};

export interface PistonsSectionData {
  outerData?: PistonsData;
  innerData?: PistonsData;
  guidSeals?: string;
  pistonSeals?: string;
  vacuumSystem?: string;
  vacuumSystemAirPressureSetting?: number;
  vacuumSystemAirPressureUnit?: string;
  unit?: 'inches' | 'mm' | 'cm';
  notes?: string;
}

export interface PistonsSectionRef {
  getData: () => PistonsSectionData;
  validate: (serviceType: ServiceType) => string[];
  reset: () => void;
  isTouched: () => boolean;
  validateAndGetData: (serviceType: ServiceType) => {
    isValid: boolean;
    errors: string[];
    data?: PistonsSectionData;
  };
}

interface PistonsSectionProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSectionTouched?: () => void;
  initialData?: any; // PistonsCheck data from API
}

export const PistonsSection = forwardRef<PistonsSectionRef, PistonsSectionProps>(
  ({ isOpen: _isOpen, onOpenChange: _onOpenChange, onSectionTouched, initialData }, ref) => {
    // Store the initial loaded data to compare against for "touched" detection
    const [initialOuterData] = useState<PistonsData>(initialData?.outerData || defaultPistonsData);
    const [initialInnerData] = useState<PistonsData>(initialData?.innerData || defaultPistonsData);

    const [outerData, setOuterData] = useState<PistonsData>(
      initialData?.outerData || defaultPistonsData,
    );
    const [innerData, setInnerData] = useState<PistonsData>(
      initialData?.innerData || defaultPistonsData,
    );
    const [guidSeals, setGuidSeals] = useState<string>(initialData?.guidSeals || '');
    const [pistonSeals, setPistonSeals] = useState<string>(initialData?.pistonSeals || '');
    const [vacuumSystem, setVacuumSystem] = useState<string>(initialData?.vacuumSystem || '');
    const [vacuumSystemAirPressureSetting, setVacuumSystemAirPressureSetting] = useState<
      number | undefined
    >(initialData?.vacuumSystemAirPressureSetting);
    const [vacuumSystemAirPressureUnit, setVacuumSystemAirPressureUnit] = useState<string>(
      initialData?.vacuumSystemAirPressureUnit || 'PSI',
    );
    const [unit, setUnit] = useState<'inches' | 'mm' | 'cm'>(initialData?.unit || 'inches');
    const [notes, setNotes] = useState<string>(initialData?.notes || '');
    const [outerErrors, setOuterErrors] = useState<Record<string, string>>({});
    const [innerErrors, setInnerErrors] = useState<Record<string, string>>({});

    const updateOuterField = (field: keyof PistonsData, value: number) => {
      setOuterData((prev) => ({ ...prev, [field]: value }));
      onSectionTouched?.();
    };

    const updateInnerField = (field: keyof PistonsData, value: number) => {
      setInnerData((prev) => ({ ...prev, [field]: value }));
      onSectionTouched?.();
    };

    const validateField = (value: number): string => {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return 'Invalid number';
      }
      return '';
    };

    const handleBlurOuter = (field: keyof PistonsData) => {
      const error = validateField(outerData[field]);
      setOuterErrors((prev) => ({ ...prev, [field]: error }));
    };

    const handleBlurInner = (field: keyof PistonsData) => {
      const error = validateField(innerData[field]);
      setInnerErrors((prev) => ({ ...prev, [field]: error }));
    };

    useImperativeHandle(ref, () => ({
      isTouched: (): boolean => {
        const outerTouched = isDataTouched(outerData, initialOuterData);
        const innerTouched = isDataTouched(innerData, initialInnerData);
        const initialNotes = initialData?.notes || '';
        const topFieldsTouched =
          guidSeals !== (initialData?.guidSeals || '') ||
          pistonSeals !== (initialData?.pistonSeals || '') ||
          vacuumSystem !== (initialData?.vacuumSystem || '') ||
          vacuumSystemAirPressureSetting !== initialData?.vacuumSystemAirPressureSetting;
        return (
          outerTouched || innerTouched || notes.trim() !== initialNotes.trim() || topFieldsTouched
        );
      },

      validateAndGetData: (
        _serviceType: ServiceType,
      ): { isValid: boolean; errors: string[]; data?: PistonsSectionData } => {
        const validationErrors: string[] = [];

        const outerTouched = isDataTouched(outerData, initialOuterData);
        const innerTouched = isDataTouched(innerData, initialInnerData);

        // Validate touched data
        if (outerTouched) {
          validationErrors.push(
            ...validatePistonsData(outerData).map((e) => `Pistons Outer: ${e}`),
          );
        }
        if (innerTouched) {
          validationErrors.push(
            ...validatePistonsData(innerData).map((e) => `Pistons Inner: ${e}`),
          );
        }

        // Check if there's any existing data
        const hasOuterData = outerTouched || isDataTouched(initialOuterData, defaultPistonsData);
        const hasInnerData = innerTouched || isDataTouched(initialInnerData, defaultPistonsData);

        // Require at least one section to be filled
        if (!hasOuterData && !hasInnerData) {
          validationErrors.push('Pistons: You must fill at least one section (Outer or Inner)');
        }

        const isValid = validationErrors.length === 0;

        if (isValid) {
          const hasOuterData = outerTouched || isDataTouched(initialOuterData, defaultPistonsData);
          const hasInnerData = innerTouched || isDataTouched(initialInnerData, defaultPistonsData);

          return {
            isValid: true,
            errors: [],
            data: {
              outerData: hasOuterData ? (outerTouched ? outerData : initialOuterData) : undefined,
              innerData: hasInnerData ? (innerTouched ? innerData : initialInnerData) : undefined,
              guidSeals: guidSeals || undefined,
              pistonSeals: pistonSeals || undefined,
              vacuumSystem: vacuumSystem || undefined,
              vacuumSystemAirPressureSetting: vacuumSystemAirPressureSetting,
              vacuumSystemAirPressureUnit: vacuumSystemAirPressureUnit,
              unit: unit,
              notes: notes.trim() || undefined,
            },
          };
        }

        return {
          isValid: false,
          errors: validationErrors,
        };
      },

      getData: (): PistonsSectionData => {
        const outerTouched = isDataTouched(outerData, initialOuterData);
        const innerTouched = isDataTouched(innerData, initialInnerData);
        const hasOuterData = outerTouched || isDataTouched(initialOuterData, defaultPistonsData);
        const hasInnerData = innerTouched || isDataTouched(initialInnerData, defaultPistonsData);

        return {
          outerData: hasOuterData ? (outerTouched ? outerData : initialOuterData) : undefined,
          innerData: hasInnerData ? (innerTouched ? innerData : initialInnerData) : undefined,
          guidSeals: guidSeals || undefined,
          pistonSeals: pistonSeals || undefined,
          vacuumSystem: vacuumSystem || undefined,
          vacuumSystemAirPressureSetting: vacuumSystemAirPressureSetting,
          vacuumSystemAirPressureUnit: vacuumSystemAirPressureUnit,
          unit: unit,
          notes: notes.trim() || undefined,
        };
      },

      validate: (_serviceType: ServiceType): string[] => {
        const errors: string[] = [];

        const outerTouched = isDataTouched(outerData, initialOuterData);
        const innerTouched = isDataTouched(innerData, initialInnerData);

        if (outerTouched) {
          errors.push(...validatePistonsData(outerData).map((e) => `Pistons Outer: ${e}`));
        }
        if (innerTouched) {
          errors.push(...validatePistonsData(innerData).map((e) => `Pistons Inner: ${e}`));
        }

        const hasOuterData = outerTouched || isDataTouched(initialOuterData, defaultPistonsData);
        const hasInnerData = innerTouched || isDataTouched(initialInnerData, defaultPistonsData);

        if (!hasOuterData && !hasInnerData) {
          errors.push('Pistons: You must fill at least one section (Outer or Inner)');
        }

        return errors;
      },

      reset: () => {
        setOuterData(defaultPistonsData);
        setInnerData(defaultPistonsData);
        setGuidSeals('');
        setPistonSeals('');
        setVacuumSystem('');
        setVacuumSystemAirPressureSetting(undefined);
        setVacuumSystemAirPressureUnit('PSI');
        setUnit('inches');
        setNotes('');
        setOuterErrors({});
        setInnerErrors({});
      },
    }));

    const t = useTranslations('inspections.form.pistons');
    const tMeasurements = useTranslations('measurements');

    return (
      <div className="space-y-6 p-4">
        {/* Top-level fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="guidSeals">{t('guidSeals')}</Label>
            <Select
              value={guidSeals}
              onValueChange={(value) => {
                setGuidSeals(value);
                onSectionTouched?.();
              }}
            >
              <SelectTrigger id="guidSeals">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SealConditionType.OK}>OK</SelectItem>
                <SelectItem value={SealConditionType.NA}>N/A</SelectItem>
                <SelectItem value={SealConditionType.DNC}>DNC</SelectItem>
                <SelectItem value={SealConditionType.DAMAGED}>Damaged</SelectItem>
                <SelectItem value={SealConditionType.LEAKING}>Leaking</SelectItem>
                <SelectItem value={SealConditionType.WORN}>Worn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pistonSeals">{t('pistonSeals')}</Label>
            <Select
              value={pistonSeals}
              onValueChange={(value) => {
                setPistonSeals(value);
                onSectionTouched?.();
              }}
            >
              <SelectTrigger id="pistonSeals">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SealConditionType.OK}>OK</SelectItem>
                <SelectItem value={SealConditionType.NA}>N/A</SelectItem>
                <SelectItem value={SealConditionType.DNC}>DNC</SelectItem>
                <SelectItem value={SealConditionType.DAMAGED}>Damaged</SelectItem>
                <SelectItem value={SealConditionType.LEAKING}>Leaking</SelectItem>
                <SelectItem value={SealConditionType.WORN}>Worn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vacuumSystem">{t('vacuumSystem')}</Label>
            <Select
              value={vacuumSystem}
              onValueChange={(value) => {
                setVacuumSystem(value);
                onSectionTouched?.();
              }}
            >
              <SelectTrigger id="vacuumSystem">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SealConditionType.OK}>OK</SelectItem>
                <SelectItem value={SealConditionType.NA}>N/A</SelectItem>
                <SelectItem value={SealConditionType.DNC}>DNC</SelectItem>
                <SelectItem value={SealConditionType.DAMAGED}>Damaged</SelectItem>
                <SelectItem value={SealConditionType.LEAKING}>Leaking</SelectItem>
                <SelectItem value={SealConditionType.WORN}>Worn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vacuumSystemAirPressureSetting">
              {t('vacuumSystemAirPressureSetting')}
            </Label>
            <div className="flex gap-2">
              <Input
                id="vacuumSystemAirPressureSetting"
                type="number"
                step="0.001"
                value={vacuumSystemAirPressureSetting || ''}
                onChange={(e) => {
                  setVacuumSystemAirPressureSetting(Number(e.target.value));
                  onSectionTouched?.();
                }}
                placeholder="30.000"
                className="flex-1"
              />
              <Select
                value={vacuumSystemAirPressureUnit}
                onValueChange={(value) => {
                  setVacuumSystemAirPressureUnit(value);
                  onSectionTouched?.();
                }}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PSI">PSI</SelectItem>
                  <SelectItem value="BAR">BAR</SelectItem>
                  <SelectItem value="KPA">KPA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Unit Selector */}
        <div className="flex items-center gap-2">
          <Label htmlFor="unit" className="text-sm font-medium whitespace-nowrap">
            {t('unit')}:
          </Label>
          <Select
            value={unit}
            onValueChange={(value) => {
              setUnit(value as 'inches' | 'mm' | 'cm');
              onSectionTouched?.();
            }}
          >
            <SelectTrigger id="unit" className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inches">inches</SelectItem>
              <SelectItem value="mm">mm</SelectItem>
              <SelectItem value="cm">cm</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs for Outer/Inner */}
        <Tabs defaultValue="outer" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="outer">{tMeasurements('outerMeasurements')}</TabsTrigger>
            <TabsTrigger value="inner">{tMeasurements('innerMeasurements')}</TabsTrigger>
          </TabsList>

          <TabsContent value="outer" className="mt-4">
            <PistonsForm
              data={outerData}
              errors={outerErrors}
              updateField={updateOuterField}
              handleBlur={handleBlurOuter}
              title="Outer"
            />
          </TabsContent>

          <TabsContent value="inner" className="mt-4">
            <PistonsForm
              data={innerData}
              errors={innerErrors}
              updateField={updateInnerField}
              handleBlur={handleBlurInner}
              title="Inner"
            />
          </TabsContent>
        </Tabs>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="pistons-notes">{t('notes')}</Label>
          <Textarea
            id="pistons-notes"
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              onSectionTouched?.();
            }}
            placeholder="Add any additional notes or observations..."
            rows={4}
          />
        </div>
      </div>
    );
  },
);

PistonsSection.displayName = 'PistonsSection';
