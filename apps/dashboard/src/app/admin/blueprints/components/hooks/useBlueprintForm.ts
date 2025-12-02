import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useLazyQuery } from '@/hooks/useLazyQuery';
import { createBlueprint } from '@/data/services/blueprints.api';
import { BearingClearanceThresholdsData } from '@/components/alerts/BearingClearanceThresholds';
import { ClutchThresholdsData } from '@/components/alerts/ClutchThresholds';
import { SlideThresholdsData } from '@/components/alerts/SlideThresholds';
import { GibsThresholdsData } from '@/components/alerts/GibsThresholds';
import { PistonsThresholdsData } from '@/components/alerts/PistonsThresholds';
import { TrammingThresholdsData } from '@/components/alerts/TrammingThresholds';
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
  pistons: 'PISTONS',
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

const INITIAL_GIBS_THRESHOLDS: GibsThresholdsData = {
  usable_greenMin: 0.001,
  usable_yellowMin: 0.002,
  usable_redMin: 0.003,
};

const INITIAL_PISTONS_THRESHOLDS: PistonsThresholdsData = {
  clearance_greenMin: 0.0,
  clearance_yellowMin: 0.0051,
  clearance_redMin: 0.01,
  difference_greenMin: 0.0,
  difference_yellowMin: 0.0051,
  difference_redMin: 0.01,
};

const INITIAL_TRAMMING_THRESHOLDS: TrammingThresholdsData = {
  greenMin: 0.001,
  yellowMin: 0.002,
  redMin: 0.003,
};

export function useBlueprintForm(onSuccess?: () => void, onClose?: () => void) {
  const t = useTranslations('models');
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [thresholdsOpen, setThresholdsOpen] = useState(false);
  const [thresholds, setThresholds] = useState<BearingClearanceThresholdsData>(INITIAL_THRESHOLDS);
  const [clutchThresholdsOpen, setClutchThresholdsOpen] = useState(false);
  const [clutchThresholds, setClutchThresholds] =
    useState<ClutchThresholdsData>(INITIAL_CLUTCH_THRESHOLDS);
  const [slideThresholdsOpen, setSlideThresholdsOpen] = useState(false);
  const [slideThresholds, setSlideThresholds] =
    useState<SlideThresholdsData>(INITIAL_SLIDE_THRESHOLDS);
  const [gibsThresholdsOpen, setGibsThresholdsOpen] = useState(false);
  const [gibsThresholds, setGibsThresholds] = useState<GibsThresholdsData>(INITIAL_GIBS_THRESHOLDS);
  const [pistonsThresholdsOpen, setPistonsThresholdsOpen] = useState(false);
  const [pistonsThresholds, setPistonsThresholds] = useState<PistonsThresholdsData>(
    INITIAL_PISTONS_THRESHOLDS,
  );
  const [trammingThresholdsOpen, setTrammingThresholdsOpen] = useState(false);
  const [trammingThresholds, setTrammingThresholds] = useState<TrammingThresholdsData>(
    INITIAL_TRAMMING_THRESHOLDS,
  );

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

      const hasGibsThresholdChanges = (
        Object.keys(gibsThresholds) as Array<keyof GibsThresholdsData>
      ).some((key) => gibsThresholds[key] !== INITIAL_GIBS_THRESHOLDS[key]);

      if (hasGibsThresholdChanges) return true;

      const hasPistonsThresholdChanges = (
        Object.keys(pistonsThresholds) as Array<keyof PistonsThresholdsData>
      ).some((key) => pistonsThresholds[key] !== INITIAL_PISTONS_THRESHOLDS[key]);

      if (hasPistonsThresholdChanges) return true;

      const hasTrammingThresholdChanges = (
        Object.keys(trammingThresholds) as Array<keyof TrammingThresholdsData>
      ).some((key) => trammingThresholds[key] !== INITIAL_TRAMMING_THRESHOLDS[key]);

      if (hasTrammingThresholdChanges) return true;

      return false;
    },
    [
      name,
      selectedSections,
      thresholds,
      clutchThresholds,
      slideThresholds,
      gibsThresholds,
      pistonsThresholds,
      trammingThresholds,
    ],
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
    const hasGibs = selectedSections.includes('gibs');
    const hasPistons = selectedSections.includes('pistons');
    const hasTramming = selectedSections.includes('tramming');

    interface BlueprintField {
      fieldName: string;
      fieldSlug: string;
      fieldType: string;
      fieldOptions?: string[];
    }

    interface CreateBlueprintPayload {
      name: string;
      imageUrl?: string;
      sections: string[];
      fields: BlueprintField[];
      thresholds?: BearingClearanceThresholdsData;
      clutchThresholds?: ClutchThresholdsData;
      slideThresholds?: SlideThresholdsData;
      gibsThresholds?: GibsThresholdsData;
      pistonsThresholds?: PistonsThresholdsData;
      trammingThresholds?: TrammingThresholdsData;
    }

    const payload: CreateBlueprintPayload = {
      name,
      imageUrl: imageUrl ?? undefined,
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

    if (hasGibs) {
      payload.gibsThresholds = gibsThresholds;
    }

    if (hasPistons) {
      payload.pistonsThresholds = pistonsThresholds;
    }

    if (hasTramming) {
      payload.trammingThresholds = trammingThresholds;
    }

    if (hasTramming) {
      payload.trammingThresholds = trammingThresholds;
    }

    const response = await submitBlueprint(payload);

    if (response.data) {
      toast.success(t('createdSuccessfully'));
      setName('');
      setImageUrl(null);
      setSelectedSections([]);
      setThresholdsOpen(false);
      setClutchThresholdsOpen(false);
      setSlideThresholdsOpen(false);
      setGibsThresholdsOpen(false);
      setPistonsThresholdsOpen(false);
      setTrammingThresholdsOpen(false);
      setTrammingThresholdsOpen(false);
      resetThresholds();
      resetSlideThresholds();
      resetPistonsThresholds();
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
    setGibsThresholds(INITIAL_GIBS_THRESHOLDS);
    setTrammingThresholds(INITIAL_TRAMMING_THRESHOLDS);
  }, []);

  const resetSlideThresholds = useCallback(() => {
    setSlideThresholds(INITIAL_SLIDE_THRESHOLDS);
  }, []);

  const resetPistonsThresholds = useCallback(() => {
    setPistonsThresholds(INITIAL_PISTONS_THRESHOLDS);
  }, []);

  const reset = useCallback(() => {
    setName('');
    setImageUrl(null);
    setSelectedSections([]);
    setThresholdsOpen(false);
    setClutchThresholdsOpen(false);
    setSlideThresholdsOpen(false);
    setGibsThresholdsOpen(false);
    setPistonsThresholdsOpen(false);
    setTrammingThresholdsOpen(false);
    setTrammingThresholdsOpen(false);
    resetThresholds();
    resetSlideThresholds();
    resetPistonsThresholds();
  }, [resetThresholds, resetSlideThresholds, resetPistonsThresholds]);

  return {
    name,
    setName,
    imageUrl,
    setImageUrl,
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
    gibsThresholdsOpen,
    setGibsThresholdsOpen,
    gibsThresholds,
    setGibsThresholds,
    pistonsThresholdsOpen,
    setPistonsThresholdsOpen,
    pistonsThresholds,
    setPistonsThresholds,
    trammingThresholdsOpen,
    setTrammingThresholdsOpen,
    trammingThresholds,
    setTrammingThresholds,
    isLoading,
    result,
    handleSubmit,
    reset,
    hasUnsavedChanges,
  };
}
