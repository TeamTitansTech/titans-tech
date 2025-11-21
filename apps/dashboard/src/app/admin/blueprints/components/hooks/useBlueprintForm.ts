import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useLazyQuery } from '@/hooks/useLazyQuery';
import { createBlueprint } from '@/data/services/blueprints.api';
import { BearingClearanceThresholdsData } from '@/components/alerts/BearingClearanceThresholds';
import { type Field } from '../types';

// Client-safe slug to enum mapping
const SLUG_TO_SECTION: Record<string, string> = {
  bearing_clearance: 'BEARING_CLEARANCE',
  slide: 'SLIDE',
  gibs: 'GIBS',
  lubrication_hydraulics_pressure_switches_oil_filter:
    'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER',
  clutch: 'CLUTCH',
  counterbalance_cylinder_airbag: 'COUNTERBALANCE_CYLINDER_AIRBAG',
  tramming: 'TRAMMING',
};

export function useBlueprintForm(onSuccess?: () => void, onClose?: () => void) {
  const t = useTranslations('models');
  const [name, setName] = useState('');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [thresholdsOpen, setThresholdsOpen] = useState(false);
  const [thresholds, setThresholds] = useState<BearingClearanceThresholdsData>({
    totalClearance_greenMin: 0,
    totalClearance_yellowMin: 0,
    totalClearance_redMin: 0,
    mainBearings_greenMin: 0,
    mainBearings_yellowMin: 0,
    mainBearings_redMin: 0,
    upperConnectionBearings_greenMin: 0,
    upperConnectionBearings_yellowMin: 0,
    upperConnectionBearings_redMin: 0,
    wristPinToMatingPart_greenMin: 0,
    wristPinToMatingPart_yellowMin: 0,
    wristPinToMatingPart_redMin: 0,
    wristPinToBushing_greenMin: 0,
    wristPinToBushing_yellowMin: 0,
    wristPinToBushing_redMin: 0,
    slideAdjNutToScrewSleeve_greenMin: 0,
    slideAdjNutToScrewSleeve_yellowMin: 0,
    slideAdjNutToScrewSleeve_redMin: 0,
  });

  const { execute: submitBlueprint, isLoading, result } = useLazyQuery(createBlueprint);

  const toggleSection = (section: string) => {
    setSelectedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section],
    );
  };

  const handleSubmit = async (
    e: React.FormEvent,
    fields: Field[],
    resetFields: () => void,
    resetOptions: () => void,
  ) => {
    e.preventDefault();

    const hasBearingClearance = selectedSections.includes('bearing_clearance');

    interface BlueprintField {
      fieldName: string;
      fieldSlug: string;
      fieldType: string;
      fieldOptions?: string[];
    }

    interface CreateBlueprintPayload {
      name: string;
      sections: string[];
      fields: BlueprintField[];
      thresholds?: BearingClearanceThresholdsData;
    }

    const payload: CreateBlueprintPayload = {
      name,
      sections: selectedSections
        .map((slug) => SLUG_TO_SECTION[slug])
        .filter((section) => section !== undefined),
      fields: fields.map((field) => {
        const baseField = {
          fieldName: field.fieldName,
          fieldSlug: field.fieldSlug,
          fieldType: field.fieldType,
        };

        if (field.fieldType === 'enum' && field.fieldOptions) {
          return {
            ...baseField,
            fieldOptions: field.fieldOptions.filter(Boolean),
          };
        }

        return baseField;
      }),
    };

    if (hasBearingClearance) {
      payload.thresholds = thresholds;
    }

    const response = await submitBlueprint(payload);

    if (response.data) {
      toast.success(t('createdSuccessfully'));
      setName('');
      setSelectedSections([]);
      resetFields();
      resetOptions();
      onSuccess?.();
      onClose?.();
    }
  };

  const reset = () => {
    setName('');
    setSelectedSections([]);
  };

  return {
    name,
    setName,
    selectedSections,
    toggleSection,
    thresholdsOpen,
    setThresholdsOpen,
    thresholds,
    setThresholds,
    isLoading,
    result,
    handleSubmit,
    reset,
  };
}
