'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ServiceType,
  SealConditionType,
  VacuumSystemConditionType,
  type Attachment,
} from '@/data/types/services.types';
import { PistonsForm, type PistonsDbData } from '../forms/PistonsForm';
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
import { DocumentUpload } from '@/components/ui/document-upload';
import { Typography } from '@/components/ui/typography';

// Default pistons data using DB format (without outer/inner prefix)
export const defaultPistonsDbData: PistonsDbData = {
  lhTop: 0,
  lhBottom: 0,
  lhLeft: 0,
  lhRight: 0,
  rhTop: 0,
  rhBottom: 0,
  rhLeft: 0,
  rhRight: 0,
};

// Merge partial data with defaults to ensure all fields have number values
const mergeWithDefaults = (data: Partial<PistonsDbData> | undefined): PistonsDbData => ({
  ...defaultPistonsDbData,
  ...Object.fromEntries(
    Object.entries(data || {}).filter(([_, v]) => v !== undefined && v !== null),
  ),
});

export const validatePistonsDbData = (data: PistonsDbData): string[] => {
  return validateNumericFields(data as Record<string, unknown>, ['lh', 'rh']);
};

export interface PistonsSectionData {
  outerData?: PistonsDbData;
  innerData?: PistonsDbData;
  guideSeals?: SealConditionType;
  pistonSeals?: SealConditionType;
  vacuumSystem?: VacuumSystemConditionType;
  vacuumSystemAirPressureSetting?: number;
  notes?: string;
  attachments?: Attachment[];
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
  initialData?: PistonsSectionData;
}

export const PistonsSection = forwardRef<PistonsSectionRef, PistonsSectionProps>(
  ({ isOpen: _isOpen, onOpenChange: _onOpenChange, onSectionTouched, initialData }, ref) => {
    // Store the initial loaded data to compare against for "touched" detection
    const [initialOuterData] = useState<PistonsDbData>(() =>
      mergeWithDefaults(initialData?.outerData as Partial<PistonsDbData>),
    );
    const [initialInnerData] = useState<PistonsDbData>(() =>
      mergeWithDefaults(initialData?.innerData as Partial<PistonsDbData>),
    );

    const [outerData, setOuterData] = useState<PistonsDbData>(() =>
      mergeWithDefaults(initialData?.outerData as Partial<PistonsDbData>),
    );
    const [innerData, setInnerData] = useState<PistonsDbData>(() =>
      mergeWithDefaults(initialData?.innerData as Partial<PistonsDbData>),
    );
    const [guideSeals, setGuideSeals] = useState<SealConditionType | undefined>(
      initialData?.guideSeals,
    );
    const [pistonSeals, setPistonSeals] = useState<SealConditionType | undefined>(
      initialData?.pistonSeals,
    );
    const [vacuumSystem, setVacuumSystem] = useState<VacuumSystemConditionType | undefined>(
      initialData?.vacuumSystem,
    );
    const [vacuumSystemAirPressureSetting, setVacuumSystemAirPressureSetting] = useState<
      number | undefined
    >(initialData?.vacuumSystemAirPressureSetting);
    const [notes, setNotes] = useState<string>(initialData?.notes || '');
    const [attachments, setAttachments] = useState<Attachment[]>(initialData?.attachments ?? []);
    const [outerErrors, setOuterErrors] = useState<Record<string, string>>({});
    const [innerErrors, setInnerErrors] = useState<Record<string, string>>({});

    const updateOuterField = (field: keyof PistonsDbData, value: number | undefined) => {
      setOuterData((prev) => ({ ...prev, [field]: value ?? 0 }));
      onSectionTouched?.();
    };

    const updateInnerField = (field: keyof PistonsDbData, value: number | undefined) => {
      setInnerData((prev) => ({ ...prev, [field]: value ?? 0 }));
      onSectionTouched?.();
    };

    const validateField = (value: number | undefined): string => {
      if (value === undefined) return '';
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return 'Invalid number';
      }
      return '';
    };

    const handleBlurOuter = (field: keyof PistonsDbData) => {
      const error = validateField(outerData[field]);
      setOuterErrors((prev) => ({ ...prev, [field]: error }));
    };

    const handleBlurInner = (field: keyof PistonsDbData) => {
      const error = validateField(innerData[field]);
      setInnerErrors((prev) => ({ ...prev, [field]: error }));
    };

    useImperativeHandle(ref, () => ({
      isTouched: (): boolean => {
        const outerTouched = isDataTouched(outerData, initialOuterData);
        const innerTouched = isDataTouched(innerData, initialInnerData);
        const initialNotes = initialData?.notes || '';
        const topFieldsTouched =
          guideSeals !== initialData?.guideSeals ||
          pistonSeals !== initialData?.pistonSeals ||
          vacuumSystem !== initialData?.vacuumSystem ||
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
            ...validatePistonsDbData(outerData).map((e) => `Pistons Outer: ${e}`),
          );
        }
        if (innerTouched) {
          validationErrors.push(
            ...validatePistonsDbData(innerData).map((e) => `Pistons Inner: ${e}`),
          );
        }

        // Check if there's any existing data
        const hasOuterData = outerTouched || isDataTouched(initialOuterData, defaultPistonsDbData);
        const hasInnerData = innerTouched || isDataTouched(initialInnerData, defaultPistonsDbData);

        // Require at least one section to be filled
        if (!hasOuterData && !hasInnerData) {
          validationErrors.push('Pistons: You must fill at least one section (Outer or Inner)');
        }

        const isValid = validationErrors.length === 0;

        if (isValid) {
          const hasOuterData =
            outerTouched || isDataTouched(initialOuterData, defaultPistonsDbData);
          const hasInnerData =
            innerTouched || isDataTouched(initialInnerData, defaultPistonsDbData);

          return {
            isValid: true,
            errors: [],
            data: {
              outerData: hasOuterData ? (outerTouched ? outerData : initialOuterData) : undefined,
              innerData: hasInnerData ? (innerTouched ? innerData : initialInnerData) : undefined,
              guideSeals: guideSeals,
              pistonSeals: pistonSeals,
              vacuumSystem: vacuumSystem,
              vacuumSystemAirPressureSetting: vacuumSystemAirPressureSetting,
              notes: notes.trim() || undefined,
              attachments,
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
        const hasOuterData = outerTouched || isDataTouched(initialOuterData, defaultPistonsDbData);
        const hasInnerData = innerTouched || isDataTouched(initialInnerData, defaultPistonsDbData);

        return {
          outerData: hasOuterData ? (outerTouched ? outerData : initialOuterData) : undefined,
          innerData: hasInnerData ? (innerTouched ? innerData : initialInnerData) : undefined,
          guideSeals: guideSeals,
          pistonSeals: pistonSeals,
          vacuumSystem: vacuumSystem,
          vacuumSystemAirPressureSetting: vacuumSystemAirPressureSetting,
          notes: notes.trim() || undefined,
          attachments,
        };
      },

      validate: (_serviceType: ServiceType): string[] => {
        const errors: string[] = [];

        const outerTouched = isDataTouched(outerData, initialOuterData);
        const innerTouched = isDataTouched(innerData, initialInnerData);

        if (outerTouched) {
          errors.push(...validatePistonsDbData(outerData).map((e) => `Pistons Outer: ${e}`));
        }
        if (innerTouched) {
          errors.push(...validatePistonsDbData(innerData).map((e) => `Pistons Inner: ${e}`));
        }

        const hasOuterData = outerTouched || isDataTouched(initialOuterData, defaultPistonsDbData);
        const hasInnerData = innerTouched || isDataTouched(initialInnerData, defaultPistonsDbData);

        if (!hasOuterData && !hasInnerData) {
          errors.push('Pistons: You must fill at least one section (Outer or Inner)');
        }

        return errors;
      },

      reset: () => {
        setOuterData(defaultPistonsDbData);
        setInnerData(defaultPistonsDbData);
        setGuideSeals(undefined);
        setPistonSeals(undefined);
        setVacuumSystem(undefined);
        setVacuumSystemAirPressureSetting(undefined);
        setNotes('');
        setOuterErrors({});
        setInnerErrors({});
      },
    }));

    const t = useTranslations('inspections.form.pistons');
    const tMeasurements = useTranslations('measurements');

    return (
      <div className="space-y-6">
        {/* Top-level fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="guideSeals">{t('guideSeals')}</Label>
            <Select
              value={guideSeals}
              onValueChange={(value) => {
                setGuideSeals(value as SealConditionType);
                onSectionTouched?.();
              }}
            >
              <SelectTrigger id="guideSeals">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SealConditionType.OK}>OK</SelectItem>
                <SelectItem value={SealConditionType.NA}>N/A</SelectItem>
                <SelectItem value={SealConditionType.DNC}>DNC</SelectItem>
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
                setPistonSeals(value as SealConditionType);
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
                setVacuumSystem(value as VacuumSystemConditionType);
                onSectionTouched?.();
              }}
            >
              <SelectTrigger id="vacuumSystem">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={VacuumSystemConditionType.OK}>OK</SelectItem>
                <SelectItem value={VacuumSystemConditionType.NA}>N/A</SelectItem>
                <SelectItem value={VacuumSystemConditionType.DNC}>DNC</SelectItem>
                <SelectItem value={VacuumSystemConditionType.DAMAGED}>Damaged</SelectItem>
                <SelectItem value={VacuumSystemConditionType.LEAKING}>Leaking</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vacuumSystemAirPressureSetting">
              {t('vacuumSystemAirPressureSetting')}
            </Label>
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
          </div>
        </div>

        {/* Tabs for Outer/Inner */}
        <Tabs defaultValue="outer" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="outer">
              <span className="hidden sm:inline">{tMeasurements('outerMeasurements')}</span>
              <span className="sm:hidden">Outer</span>
            </TabsTrigger>
            <TabsTrigger value="inner">
              <span className="hidden sm:inline">{tMeasurements('innerMeasurements')}</span>
              <span className="sm:hidden">Inner</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="outer" className="mt-4">
            <PistonsForm
              data={outerData}
              errors={outerErrors}
              updateField={updateOuterField}
              handleBlur={handleBlurOuter}
            />
          </TabsContent>

          <TabsContent value="inner" className="mt-4">
            <PistonsForm
              data={innerData}
              errors={innerErrors}
              updateField={updateInnerField}
              handleBlur={handleBlurInner}
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

        {/* Section Attachments */}
        <div className="pt-4 border-t">
          <Typography variant="h4" className="mb-3">
            {tMeasurements('attachments')}
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

PistonsSection.displayName = 'PistonsSection';
