import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useLazyQuery } from '@/hooks/useLazyQuery';
import { updateBlueprint, type Blueprint } from '@/data/services/blueprints.api';
import { BearingClearanceThresholdsData } from '@/components/alerts/BearingClearanceThresholds';
import { ClutchThresholdsData } from '@/components/alerts/ClutchThresholds';
import { SlideThresholdsData } from '@/components/alerts/SlideThresholds';
import { GibsThresholdsData } from '@/components/alerts/GibsThresholds';
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

// Reverse mapping: enum to slug
const SECTION_TO_SLUG: Record<string, string> = {
  BEARING_CLEARANCE: 'bearing_clearance',
  SLIDE: 'slide',
  GIBS: 'gibs',
  LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER:
    'lubrication_hydraulics_pressure_switches_oil_filter',
  CLUTCH: 'clutch',
  COUNTERBALANCE_CYLINDER_AIRBAG: 'counterbalance_cylinder_airbag',
  TRAMMING: 'tramming',
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

export function useBlueprintEditForm(
  blueprintId: string | null,
  hasMachines: boolean, // Used in handleSubmit (line 270)
  onSuccess?: () => void,
  onClose?: () => void,
) {
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
  const [gibsThresholdsOpen, setGibsThresholdsOpen] = useState(false);
  const [gibsThresholds, setGibsThresholds] = useState<GibsThresholdsData>(INITIAL_GIBS_THRESHOLDS);

  // Store original data to detect changes
  const [originalData, setOriginalData] = useState<{
    name: string;
    sections: string[];
    thresholds: BearingClearanceThresholdsData;
    clutchThresholds: ClutchThresholdsData;
    slideThresholds: SlideThresholdsData;
    gibsThresholds: GibsThresholdsData;
  }>({
    name: '',
    sections: [],
    thresholds: INITIAL_THRESHOLDS,
    clutchThresholds: INITIAL_CLUTCH_THRESHOLDS,
    slideThresholds: INITIAL_SLIDE_THRESHOLDS,
    gibsThresholds: INITIAL_GIBS_THRESHOLDS,
  });

  const { execute: submitUpdate, isLoading, result } = useLazyQuery(updateBlueprint);

  // Initialize form with blueprint data
  const initializeForm = useCallback(
    (
      blueprint: Blueprint & {
        thresholdBearingClearance?: BearingClearanceThresholdsData;
        thresholdClutch?: ClutchThresholdsData;
        thresholdSlide?: SlideThresholdsData;
        thresholdGibs?: GibsThresholdsData;
      },
    ) => {
      setName(blueprint.name);

      // Convert section enums to slugs
      const sectionSlugs = blueprint.sections
        .map((section: string) => SECTION_TO_SLUG[section])
        .filter(Boolean);
      setSelectedSections(sectionSlugs);

      // Load thresholds if they exist
      if (blueprint.thresholdBearingClearance) {
        setThresholds(blueprint.thresholdBearingClearance);
      }

      if (blueprint.thresholdClutch) {
        setClutchThresholds(blueprint.thresholdClutch);
      }

      if (blueprint.thresholdSlide) {
        setSlideThresholds(blueprint.thresholdSlide);
      }

      if (blueprint.thresholdGibs) {
        setGibsThresholds(blueprint.thresholdGibs);
      }

      // Store original data
      setOriginalData({
        name: blueprint.name,
        sections: sectionSlugs,
        thresholds: blueprint.thresholdBearingClearance || INITIAL_THRESHOLDS,
        clutchThresholds: blueprint.thresholdClutch || INITIAL_CLUTCH_THRESHOLDS,
        slideThresholds: blueprint.thresholdSlide || INITIAL_SLIDE_THRESHOLDS,
        gibsThresholds: blueprint.thresholdGibs || INITIAL_GIBS_THRESHOLDS,
      });
    },
    [],
  );

  // Check if there are unsaved changes
  const hasUnsavedChanges = useCallback(
    (_fields: Field[]) => {
      if (name !== originalData.name) return true;

      if (
        selectedSections.length !== originalData.sections.length ||
        !selectedSections.every((s) => originalData.sections.includes(s))
      ) {
        return true;
      }

      const hasThresholdChanges = (
        Object.keys(thresholds) as Array<keyof BearingClearanceThresholdsData>
      ).some((key) => thresholds[key] !== originalData.thresholds[key]);

      if (hasThresholdChanges) return true;

      const hasClutchThresholdChanges = (
        Object.keys(clutchThresholds) as Array<keyof ClutchThresholdsData>
      ).some((key) => clutchThresholds[key] !== originalData.clutchThresholds[key]);

      if (hasClutchThresholdChanges) return true;

      const hasSlideThresholdChanges = (
        Object.keys(slideThresholds) as Array<keyof SlideThresholdsData>
      ).some((key) => slideThresholds[key] !== originalData.slideThresholds[key]);

      if (hasSlideThresholdChanges) return true;

      const hasGibsThresholdChanges = (
        Object.keys(gibsThresholds) as Array<keyof GibsThresholdsData>
      ).some((key) => gibsThresholds[key] !== originalData.gibsThresholds[key]);

      if (hasGibsThresholdChanges) return true;

      return false;
    },
    [
      name,
      selectedSections,
      thresholds,
      clutchThresholds,
      slideThresholds,
      gibsThresholds,
      originalData,
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
    hasMachines: boolean,
    _resetFields: () => void,
    _resetOptions: () => void,
  ) => {
    e.preventDefault();

    if (!blueprintId) {
      toast.error(t('invalidBlueprintId'));
      return;
    }

    const hasBearingClearance = selectedSections.includes('bearing_clearance');
    const hasClutch = selectedSections.includes('clutch');
    const hasSlide = selectedSections.includes('slide');
    const hasGibs = selectedSections.includes('gibs');

    interface BlueprintField {
      fieldName: string;
      fieldSlug: string;
      fieldType: string;
      fieldOptions?: string[];
    }

    interface UpdateBlueprintPayload {
      name?: string;
      sections?: string[];
      fields?: BlueprintField[];
      thresholds?: BearingClearanceThresholdsData;
      clutchThresholds?: ClutchThresholdsData;
      slideThresholds?: SlideThresholdsData;
      gibsThresholds?: GibsThresholdsData;
    }

    const payload: UpdateBlueprintPayload = {
      name,
    };

    // Only include sections and fields if blueprint has no machines
    if (!hasMachines) {
      payload.sections = selectedSections
        .map((slug) => SLUG_TO_SECTION[slug])
        .filter((section) => section !== undefined);

      payload.fields = fields.map((field) => {
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
      });
    }

    // Always allow threshold updates
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

    const response = await submitUpdate(blueprintId, payload);

    if (response.data) {
      toast.success(t('updatedSuccessfully'));
      onSuccess?.();
      onClose?.();
    }
  };

  const reset = useCallback(() => {
    setName('');
    setSelectedSections([]);
    setThresholdsOpen(false);
    setClutchThresholdsOpen(false);
    setSlideThresholdsOpen(false);
    setGibsThresholdsOpen(false);
    setThresholds(INITIAL_THRESHOLDS);
    setClutchThresholds(INITIAL_CLUTCH_THRESHOLDS);
    setSlideThresholds(INITIAL_SLIDE_THRESHOLDS);
    setGibsThresholds(INITIAL_GIBS_THRESHOLDS);
    setOriginalData({
      name: '',
      sections: [],
      thresholds: INITIAL_THRESHOLDS,
      clutchThresholds: INITIAL_CLUTCH_THRESHOLDS,
      slideThresholds: INITIAL_SLIDE_THRESHOLDS,
      gibsThresholds: INITIAL_GIBS_THRESHOLDS,
    });
  }, []);

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
    gibsThresholdsOpen,
    setGibsThresholdsOpen,
    gibsThresholds,
    setGibsThresholds,
    isLoading,
    result,
    handleSubmit,
    reset,
    hasUnsavedChanges,
    initializeForm,
  };
}
