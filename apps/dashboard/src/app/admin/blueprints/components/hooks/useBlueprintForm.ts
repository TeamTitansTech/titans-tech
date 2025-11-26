import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useLazyQuery } from '@/hooks/useLazyQuery';
import { createBlueprint } from '@/data/services/blueprints.api';
import { BearingClearanceThresholdsData } from '@/components/alerts/BearingClearanceThresholds';
import { ClutchThresholdsData } from '@/components/alerts/ClutchThresholds';
import { SlideThresholdsData } from '@/components/alerts/SlideThresholds';
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

const INITIAL_THRESHOLDS: BearingClearanceThresholdsData = {
  totalClearance_greenMin: 0.0135,
  totalClearance_yellowMin: 0.028,
  totalClearance_redMin: 0.035,
  mainBearings_greenMin: 0.004,
  mainBearings_yellowMin: 0.008,
  mainBearings_redMin: 0.012,
  upperConnectionBearings_greenMin: 0.004,
  upperConnectionBearings_yellowMin: 0.008,
  upperConnectionBearings_redMin: 0.012,
  wristPinToMatingPart_greenMin: -0.0005,
  wristPinToMatingPart_yellowMin: 0.0005,
  wristPinToMatingPart_redMin: 0.0015,
  wristPinToBushing_greenMin: 0.0002,
  wristPinToBushing_yellowMin: 0.003,
  wristPinToBushing_redMin: 0.005,
  slideAdjNutToScrewSleeve_greenMin: 0.0003,
  slideAdjNutToScrewSleeve_yellowMin: 0.0016,
  slideAdjNutToScrewSleeve_redMin: 0.003,
};

const INITIAL_CLUTCH_THRESHOLDS: ClutchThresholdsData = {
  hydClutchClearanceTotal_greenMin: 0.06,
  hydClutchClearanceTotal_yellowMin: 0.12,
  hydClutchClearanceTotal_redMin: 0.188,
  hydClutchClearanceRear_greenMin: 0.015,
  hydClutchClearanceRear_yellowMin: 0.078,
  hydClutchClearanceRear_redMin: 0.105,
  fb_greenMin: 0.045,
  fb_yellowMin: 0.052,
  fb_redMin: 0.055,
  fTB_greenMin: 0.005,
  fTB_yellowMin: 0.012,
  fTB_redMin: 0.015,
  rTB_greenMin: 0.005,
  rTB_yellowMin: 0.012,
  rTB_redMin: 0.015,
};

const INITIAL_SLIDE_THRESHOLDS: SlideThresholdsData = {
  maxDeviation_greenMin: 0.001,
  maxDeviation_yellowMin: 0.002,
  maxDeviation_redMin: 0.003,
};

export function useBlueprintForm(onSuccess?: () => void, onClose?: () => void) {
  const t = useTranslations('models');
  const [name, setName] = useState('');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [thresholdsOpen, setThresholdsOpen] = useState(false);
  const [thresholds, setThresholds] = useState<BearingClearanceThresholdsData>(INITIAL_THRESHOLDS);
  const [clutchThresholdsOpen, setClutchThresholdsOpen] = useState(false);
  const [clutchThresholds, setClutchThresholds] =
    useState<ClutchThresholdsData>(INITIAL_CLUTCH_THRESHOLDS);
  const [slideThresholdsOpen, setSlideThresholdsOpen] = useState(false);
  const [slideThresholds, setSlideThresholds] =
    useState<SlideThresholdsData>(INITIAL_SLIDE_THRESHOLDS);

  const { execute: submitBlueprint, isLoading, result } = useLazyQuery(createBlueprint);

  // Verifica se há dados preenchidos no formulário
  const hasUnsavedChanges = useCallback(
    (fields: Field[]) => {
      if (name.trim()) return true;
      if (selectedSections.length > 0) return true;
      if (fields.length > 0) return true;

      const hasThresholdChanges = (
        Object.keys(thresholds) as Array<keyof BearingClearanceThresholdsData>
      ).some((key) => thresholds[key] !== INITIAL_THRESHOLDS[key]);

      if (hasThresholdChanges) return true;

      const hasClutchThresholdChanges = (
        Object.keys(clutchThresholds) as Array<keyof ClutchThresholdsData>
      ).some((key) => clutchThresholds[key] !== INITIAL_CLUTCH_THRESHOLDS[key]);

      if (hasClutchThresholdChanges) return true;

      const hasSlideThresholdChanges = (
        Object.keys(slideThresholds) as Array<keyof SlideThresholdsData>
      ).some((key) => slideThresholds[key] !== INITIAL_SLIDE_THRESHOLDS[key]);

      if (hasSlideThresholdChanges) return true;

      return false;
    },
    [name, selectedSections, thresholds, clutchThresholds, slideThresholds],
  );

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
    const hasClutch = selectedSections.includes('clutch');
    const hasSlide = selectedSections.includes('slide');

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
      clutchThresholds?: ClutchThresholdsData;
      slideThresholds?: SlideThresholdsData;
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

    if (hasClutch) {
      payload.clutchThresholds = clutchThresholds;
    }

    if (hasSlide) {
      payload.slideThresholds = slideThresholds;
    }

    const response = await submitBlueprint(payload);

    if (response.data) {
      toast.success(t('createdSuccessfully'));
      setName('');
      setSelectedSections([]);
      setThresholdsOpen(false);
      setClutchThresholdsOpen(false);
      setSlideThresholdsOpen(false);
      resetThresholds();
      resetSlideThresholds();
      resetFields();
      resetOptions();
      onSuccess?.();
      onClose?.();
    }
  };

  const resetThresholds = useCallback(() => {
    setThresholds(INITIAL_THRESHOLDS);
    setClutchThresholds(INITIAL_CLUTCH_THRESHOLDS);
    setSlideThresholds(INITIAL_SLIDE_THRESHOLDS);
  }, []);

  const resetSlideThresholds = useCallback(() => {
    setSlideThresholds(INITIAL_SLIDE_THRESHOLDS);
  }, []);

  const reset = useCallback(() => {
    setName('');
    setSelectedSections([]);
    setThresholdsOpen(false);
    setClutchThresholdsOpen(false);
    setSlideThresholdsOpen(false);
    resetThresholds();
    resetSlideThresholds();
  }, [resetThresholds, resetSlideThresholds]);

  return {
    name,
    setName,
    selectedSections,
    toggleSection,
    thresholdsOpen,
    setThresholdsOpen,
    thresholds,
    setThresholds,
    clutchThresholdsOpen,
    setClutchThresholdsOpen,
    clutchThresholds,
    setClutchThresholds,
    slideThresholdsOpen,
    setSlideThresholdsOpen,
    slideThresholds,
    setSlideThresholds,
    isLoading,
    result,
    handleSubmit,
    reset,
    hasUnsavedChanges,
  };
}
