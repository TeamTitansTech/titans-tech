'use client';
import { GibsStageData } from '@/data/types/services.types';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Typography } from '@/components/ui/typography';
import { SelectableSectionCard } from '@/components/SelectableSectionCard';
import type { SectionStatus } from '@/components/SelectableSectionCard';
import { CalendarIcon, Check, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Stepper, type StepperStep } from '@/components/ui/stepper';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ServiceType, ServiceStatus, type CreateServicePayload } from '@/data/types/services.types';
import {
  createService,
  updateService,
  updateServiceSection,
  completeService,
  getServiceById,
} from '@/data/services/services.api';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { SECTION_REGISTRY } from './sections/registry';
import type { SectionComponentRef } from './sections/types';

interface ServiceCompletionModalProps {
  machineId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  machineSections?: string[];
  serviceId?: string; // If provided, we're completing an existing service
  serviceType?: ServiceType; // Type of service being completed
  initialDate?: string; // Initial date from existing service
  initialPerformedBy?: string; // Initial performedBy from existing service
}

export function ServiceCompletionModal({
  machineId,
  open,
  onOpenChange,
  machineSections: machineSectionsProp,
  serviceId,
  serviceType,
  initialDate,
  initialPerformedBy,
}: ServiceCompletionModalProps) {
  const t = useTranslations('machines');
  const tServices = useTranslations('services');
  const tSlide = useTranslations('inspections.form.slide');
  const tSlideFields = useTranslations('inspections.form.slide.fields');
  const tTable = useTranslations('table');
  const tMeasurements = useTranslations('measurements');
  const tServicesSummary = useTranslations('services.modal.summary');
  const tBearingFields = useTranslations('bearingFields');
  const tBearingClearanceFields = useTranslations('inspections.form.bearingClearance.fields');
  const tGibsFields = useTranslations('inspections.form.gibs');
  const tClutchFields = useTranslations('inspections.form.clutch.fields');
  const tCounterbalanceFields = useTranslations('inspections.form.counterbalanceCylinder');
  const router = useInternalRouter();

  // Memoize machineSections to prevent infinite loop
  const machineSections = useMemo(
    () => machineSectionsProp || Object.keys(SECTION_REGISTRY),
    [machineSectionsProp],
  );

  const isCompletingService = !!serviceId;
  const isInspection = serviceType === ServiceType.INSPECTION;

  // Multi-step state with stepper support
  type StepType = 'selection' | 'details' | 'sections' | 'summary';

  // Determine if we should skip section selection step
  // Skip ONLY for inspections (they always include all sections)
  // For maintenance, even with serviceId, we need to let users select sections first
  // (unless they already have completed sections, which we'll detect when loading data)
  const shouldSkipSelection = isInspection;

  // For inspections or editing existing services, start at 'details' step
  // For new maintenance services, start at 'selection' step
  const [currentStep, setCurrentStep] = useState<StepType>(
    shouldSkipSelection ? 'details' : 'selection',
  );
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);

  // Section selection state
  // For inspections: pre-select all sections (always)
  // For completing maintenance: start with empty set (user selects what they maintained)
  // For new maintenance: start with empty set
  const [selectedSections, setSelectedSections] = useState<Set<string>>(
    isInspection ? new Set(machineSections) : new Set(),
  );

  // Service details
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  const getInitialDate = useCallback(() => {
    if (initialDate) {
      return new Date(initialDate);
    }
    return getTomorrowDate();
  }, [initialDate]);

  const [date, setDate] = useState<Date>(getInitialDate());
  // Internal state for service type (used when creating new services)
  // When completing an existing service, the prop serviceType is used
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType>(
    serviceType || ServiceType.MAINTENANCE,
  );
  // Use the prop serviceType if provided (completing service), otherwise use internal state (creating new)
  const currentServiceType = serviceType || selectedServiceType;
  const [performedBy, setPerformedBy] = useState(initialPerformedBy || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Section refs for data collection - using a Map for dynamic section management
  const sectionRefs = useRef<Map<string, SectionComponentRef>>(new Map());

  // Track which sections have been completed (validated)
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  // Store completed section data for summary display
  const [completedSectionData, setCompletedSectionData] = useState<Record<string, any>>({});

  // Store the service ID for newly created services
  const [createdServiceId, setCreatedServiceId] = useState<string | null>(null);
  const currentServiceId = serviceId || createdServiceId;

  // Loading state for fetching existing service data
  // Start as true if we have a serviceId (will load data immediately)
  const [isLoadingServiceData, setIsLoadingServiceData] = useState(!!serviceId);

  // Track if we've completed the initial data load to prevent re-showing loading screen
  const hasLoadedInitialData = useRef(false);

  // Reset when modal closes OR when serviceId changes (switching between services)
  useEffect(() => {
    if (!open) {
      // Reset to initial state based on service type

      setCurrentStep(shouldSkipSelection ? 'details' : 'selection');
      setCurrentSectionIndex(0);
      setSelectedSections(isInspection ? new Set(machineSections) : new Set());
      setDate(getInitialDate());
      setSelectedServiceType(serviceType || ServiceType.INSPECTION);
      setPerformedBy(initialPerformedBy || '');
      setError(null);
      setCompletedSections(new Set());
      setCompletedSectionData({});
      setCreatedServiceId(null);
      setIsLoadingServiceData(false);
      hasLoadedInitialData.current = false;
      // Reset all section refs
      sectionRefs.current.forEach((ref) => ref.reset());
    }
  }, [
    open,
    initialPerformedBy,
    isInspection,
    isCompletingService,
    serviceType,
    getInitialDate,
    machineSections,
    shouldSkipSelection,
  ]);

  // Reset and reload when serviceId changes (switching between services)
  useEffect(() => {
    if (!open) return;

    if (serviceId) {
      // Opening/switching to an existing service - reset and prepare to load
      // Only reset if we haven't loaded data yet (prevents resetting after saves)
      if (!hasLoadedInitialData.current) {
        setIsLoadingServiceData(true);
        hasLoadedInitialData.current = false;
        setCompletedSections(new Set());
        setCompletedSectionData({});
        setSelectedSections(isInspection ? new Set(machineSections) : new Set());
        setCreatedServiceId(null);
        setCurrentStep(shouldSkipSelection ? 'details' : 'selection');
        setCurrentSectionIndex(0);
      }
    } else {
      // Creating a new service - reset to clean state
      setIsLoadingServiceData(false);
      hasLoadedInitialData.current = true; // No data to load for new service
      setCompletedSections(new Set());
      setCompletedSectionData({});
      setSelectedSections(isInspection ? new Set(machineSections) : new Set());
      setCreatedServiceId(null);
      setCurrentStep(shouldSkipSelection ? 'details' : 'selection');
      setCurrentSectionIndex(0);
      sectionRefs.current.forEach((ref) => ref.reset());
    }
  }, [open, serviceId, isInspection, machineSections, shouldSkipSelection]);

  // Load existing service data when opening modal with serviceId
  // Only load when explicitly provided with serviceId prop (not createdServiceId)
  useEffect(() => {
    const loadServiceData = async () => {
      // Only load if:
      // 1. Modal is open
      // 2. We have a serviceId prop (existing service, not newly created)
      // 3. createdServiceId is null (not in the middle of creating a new service)
      // 4. We haven't already loaded the initial data (prevents reloading after saves)
      if (!open || !serviceId || createdServiceId || hasLoadedInitialData.current) return;

      setIsLoadingServiceData(true);

      try {
        const response = await getServiceById(serviceId);

        if (response.errors || !response.data) {
          console.error('Failed to load service data:', response.errors);
          toast.error('Failed to load service data');
          return;
        }

        const service = response.data as any; // Service with included relations

        // Extract completed sections array
        const savedCompletedSections = Array.isArray(service.completedSections)
          ? service.completedSections
          : [];

        // Map Prisma relation data back to section data
        const RELATION_TO_SECTION_KEY: Record<string, string> = {
          bearingClearance: 'BEARING_CLEARANCE',
          slide: 'SLIDE',
          gibs: 'GIBS',
          lubricationHydraulics: 'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER',
          clutch: 'CLUTCH',
          counterbalanceCylinderAirbag: 'COUNTERBALANCE_CYLINDER_AIRBAG',
        };

        const loadedSectionData: Record<string, any> = {};

        // Extract data from each relation (arrays with single item)
        // Find the first record with actual nested data (not all nulls)
        Object.entries(RELATION_TO_SECTION_KEY).forEach(([relationKey, sectionKey]) => {
          const relationData = service[relationKey];
          if (relationData && Array.isArray(relationData) && relationData.length > 0) {
            // Find first record that has non-null nested data
            const recordWithData = relationData.find((record: any) => {
              // Check if record has meaningful nested data
              const hasNestedData =
                record.outerBefore ||
                record.outerData ||
                record.innerBefore ||
                record.innerData ||
                record.data;
              return hasNestedData;
            });
            // Use the record with data, or fallback to the last one
            loadedSectionData[sectionKey] = recordWithData || relationData[relationData.length - 1];

            console.log(`🔍 Loading ${sectionKey}:`, {
              totalRecords: relationData.length,
              foundRecordWithData: !!recordWithData,
              usingRecord: loadedSectionData[sectionKey] ? 'with-data' : 'fallback',
            });
          }
        });

        // Update state with loaded data
        // Section components will automatically receive this data via initialData prop
        setCompletedSections(new Set(savedCompletedSections));
        setCompletedSectionData(loadedSectionData);

        // Restore selectedSections from service data (if available)
        let savedSelectedSections = Array.isArray(service.selectedSections)
          ? service.selectedSections
          : savedCompletedSections; // Fallback to completed sections for backward compatibility

        // For inspections without saved selections, auto-select all sections
        if (isInspection && savedSelectedSections.length === 0) {
          savedSelectedSections = machineSections;
        }

        setSelectedSections(new Set(savedSelectedSections));

        // Restore the step and section index the user was on
        if (service.currentStep && service.currentStep !== 'summary') {
          setCurrentStep(service.currentStep as any);

          // If we're on the sections step, restore the section index
          if (service.currentStep === 'sections' && service.currentSectionKey) {
            const sectionsArray = savedSelectedSections;
            const sectionIndex = sectionsArray.indexOf(service.currentSectionKey);
            setCurrentSectionIndex(sectionIndex >= 0 ? sectionIndex : 0);
          } else {
            setCurrentSectionIndex(0);
          }
        } else if (savedCompletedSections.length > 0) {
          // If no currentStep saved or it's summary, go to details step
          // This lets users see the full stepper with completed sections marked
          setCurrentStep('details');
          setCurrentSectionIndex(0);
        } else {
          // No completed sections yet - this is a brand new service
          // Stay at selection step (or details for inspections)
          setCurrentStep(shouldSkipSelection ? 'details' : 'selection');
          setCurrentSectionIndex(0);
        }
      } catch (error) {
        console.error('Error loading service data:', error);
        toast.error('Error loading service data');
      } finally {
        setIsLoadingServiceData(false);
        hasLoadedInitialData.current = true;
      }
    };

    loadServiceData();
  }, [open, serviceId, createdServiceId, isInspection, machineSections, shouldSkipSelection]);

  // Auto-select all sections when service type changes to INSPECTION
  // This handles the case when creating a new inspection (not completing an existing one)
  useEffect(() => {
    // Only auto-select if we're creating a new service (no serviceId prop)
    // and the modal is open and current type is INSPECTION
    if (!serviceId && open && currentServiceType === ServiceType.INSPECTION) {
      setSelectedSections(new Set(machineSections));
    }
  }, [currentServiceType, open, serviceId, machineSections]);

  const toggleSection = (sectionKey: string) => {
    setSelectedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionKey)) {
        newSet.delete(sectionKey);
      } else {
        newSet.add(sectionKey);
      }
      return newSet;
    });
  };

  const handleProceedToDetails = () => {
    if (selectedSections.size === 0) {
      return;
    }
    setCurrentStep('details');
  };

  // Get selected sections as array for stepper
  const getSelectedSectionsArray = () => {
    return Array.from(selectedSections);
  };

  // Generate stepper steps
  const getStepperSteps = (): StepperStep[] => {
    const steps: StepperStep[] = [];
    const sectionsArray = getSelectedSectionsArray();

    // Add service details step
    const detailsCompleted = currentStep === 'sections' || currentStep === 'summary';
    steps.push({
      key: 'details',
      label: tServices('modal.stepper.details'),
      status: currentStep === 'details' ? 'current' : detailsCompleted ? 'completed' : 'pending',
      isClickable: true,
    });

    // Add section steps
    sectionsArray.forEach((sectionKey, index) => {
      const sectionConfig = SECTION_REGISTRY[sectionKey];
      if (!sectionConfig) return;

      const isCompleted = completedSections.has(sectionKey);
      const isCurrent = currentStep === 'sections' && currentSectionIndex === index;

      steps.push({
        key: sectionKey,
        label: t(`sectionNames.${sectionConfig.metadata.i18nKey}`),
        status: isCompleted ? 'completed' : isCurrent ? 'current' : 'pending',
        isClickable: true,
      });
    });

    // Add summary step
    steps.push({
      key: 'summary',
      label: tServices('modal.stepper.summary'),
      status: currentStep === 'summary' ? 'current' : 'pending',
      isClickable: completedSections.size === sectionsArray.length,
    });

    return steps;
  };

  // Handle step click navigation
  const handleStepClick = (stepIndex: number) => {
    const sectionsArray = getSelectedSectionsArray();
    if (stepIndex === 0) {
      // Navigate to details step
      setCurrentStep('details');
    } else if (stepIndex === sectionsArray.length + 1) {
      // Navigate to summary step (last step)
      if (completedSections.size === sectionsArray.length) {
        setCurrentStep('summary');
      }
    } else {
      // Navigate to section step
      const sectionIndex = stepIndex - 1;
      if (sectionIndex < sectionsArray.length) {
        setCurrentStep('sections');
        setCurrentSectionIndex(sectionIndex);
      }
    }
  };

  // Navigate to next step
  const handleNext = async (e?: React.MouseEvent) => {
    // Prevent any form submission
    e?.preventDefault();
    e?.stopPropagation();

    if (currentStep === 'details') {
      // If creating a new service, create it with PENDING status before proceeding
      if (!currentServiceId) {
        setIsSubmitting(true);
        try {
          const payload: CreateServicePayload = {
            machineId,
            date: date.toISOString(),
            type: currentServiceType,
            status: ServiceStatus.PENDING,
            performedBy: performedBy || undefined,
            currentStep: 'sections',
            selectedSections: Array.from(selectedSections),
          };

          const response = await createService(payload);

          if (response.errors || !response.data) {
            toast.error(
              `Failed to create service:\n${response.errors?.join('\n') || 'Unknown error'}`,
            );
            setIsSubmitting(false);
            return;
          }

          // Store the created service ID
          setCreatedServiceId(response.data.id);
          toast.success('Service created. Now fill in the section forms.');
          setIsSubmitting(false);
        } catch (error) {
          console.error('Error creating service:', error);
          toast.error('An unexpected error occurred while creating the service');
          setIsSubmitting(false);
          return;
        }
      }

      // Move to first section
      setCurrentStep('sections');
      setCurrentSectionIndex(0);
    } else if (currentStep === 'sections') {
      // Validate current section before proceeding
      const sectionsArray = getSelectedSectionsArray();
      const currentSectionKey = sectionsArray[currentSectionIndex];

      // Client-side validation for immediate feedback
      const validationErrors = validateSection(currentSectionKey);
      if (validationErrors.length > 0) {
        toast.error(validationErrors.join('\n\n'));
        return;
      }

      // Get section data from ref
      const ref = sectionRefs.current.get(currentSectionKey);
      if (!ref) {
        toast.error('Section reference not found');
        return;
      }

      const result = ref.validateAndGetData(currentServiceType);

      if (!result.isValid || !result.data) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Show loading state
      setIsSubmitting(true);

      try {
        // Save section to database
        if (!currentServiceId) {
          toast.error('Service ID not found. Please create the service first.');
          setIsSubmitting(false);
          return;
        }

        const response = await updateServiceSection(
          currentServiceId,
          currentSectionKey,
          result.data,
          machineId,
        );

        if (response.errors) {
          toast.error(`Failed to save section:\n${response.errors.join('\n')}`);
          setIsSubmitting(false);
          return;
        }

        // Section saved successfully
        toast.success('Section saved successfully');

        // Mark section as completed
        setCompletedSections((prev) => new Set(prev).add(currentSectionKey));

        // Save the form data directly to state (don't try to extract from DB response)
        // This keeps the data in memory for navigation between sections
        setCompletedSectionData((prev) => ({
          ...prev,
          [currentSectionKey]: result.data, // Use form data directly
        }));

        // Determine next step
        const nextSectionIndex = currentSectionIndex + 1;
        const isLastSection = nextSectionIndex >= sectionsArray.length;
        const nextStep = isLastSection ? 'summary' : 'sections';
        const nextSectionKey = isLastSection ? null : sectionsArray[nextSectionIndex];

        // Update service with current progress (for resuming later)
        await updateService(
          currentServiceId,
          {
            currentStep: nextStep,
            currentSectionKey: nextSectionKey || undefined,
            selectedSections: Array.from(selectedSections),
          },
          machineId,
        );

        setIsSubmitting(false);

        // Move to next section or go to summary
        if (!isLastSection) {
          setCurrentSectionIndex(nextSectionIndex);
        } else {
          // All sections completed, move to summary
          setCurrentStep('summary');
        }
      } catch (error) {
        console.error('Error saving section:', error);
        toast.error('An unexpected error occurred while saving the section');
        setIsSubmitting(false);
      }
    }
  };

  // Navigate to previous step
  const handlePrevious = () => {
    if (currentStep === 'summary') {
      // Go back to last section
      const sectionsArray = getSelectedSectionsArray();
      setCurrentStep('sections');
      setCurrentSectionIndex(sectionsArray.length - 1);
    } else if (currentStep === 'sections' && currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    } else if (currentStep === 'sections' && currentSectionIndex === 0) {
      setCurrentStep('details');
    }
  };

  // Handle section touched (for re-editing detection)
  const handleSectionTouched = (sectionKey: string) => {
    // If section was previously completed, remove it from completed sections
    // This will make the green checkmark disappear until user saves again
    if (completedSections.has(sectionKey)) {
      setCompletedSections((prev) => {
        const newSet = new Set(prev);
        newSet.delete(sectionKey);
        return newSet;
      });
    }
  };

  // Validate a specific section
  // Generic validation function - works with any section
  // skipIfUntouched: if true, returns no errors for untouched sections (used in final submission)
  //                  if false, always validates (used when navigating between sections)
  const validateSection = (sectionKey: string, skipIfUntouched = false): string[] => {
    const ref = sectionRefs.current.get(sectionKey);
    if (!ref) {
      return [];
    }

    // Only skip validation for untouched sections if explicitly requested
    if (skipIfUntouched && !ref.isTouched()) {
      return [];
    }

    const result = ref.validateAndGetData(currentServiceType);
    return result.isValid ? [] : result.errors;
  };

  // Map section keys to payload property names
  // const SECTION_TO_PAYLOAD_KEY: Record<
  //   string,
  //   keyof UpdateServicePayload | keyof CreateServicePayload
  // > = {
  //   BEARING_CLEARANCE: 'bearingClearance',
  //   SLIDE: 'slide',
  //   GIBS: 'gibs',
  //   LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER: 'lubricationHydraulics',
  //   CLUTCH: 'clutch',
  //   COUNTERBALANCE_CYLINDER_AIRBAG: 'counterbalanceCylinder',
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);

    // Only allow submission from summary step
    if (currentStep !== 'summary') {
      console.warn('Attempted to submit from non-summary step:', currentStep);
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate that we have a service ID (either provided or created)
      if (!currentServiceId) {
        toast.error('Service ID not found');
        setIsSubmitting(false);
        return;
      }

      // Mark service as completed
      const response = await completeService(currentServiceId, performedBy || '', machineId);

      if (response.errors) {
        setError(response.errors.join(', '));
        setIsSubmitting(false);
        return;
      }

      toast.success(
        isInspection ? 'Inspeção concluída com sucesso' : 'Manutenção concluída com sucesso',
      );

      // Reset and close
      setDate(getTomorrowDate());
      setSelectedServiceType(ServiceType.MAINTENANCE);
      setPerformedBy('');
      setCreatedServiceId(null);
      setIsSubmitting(false);
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      console.error('Error completing service:', err);
      setError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  // Helper function to check if a field is an ID field
  const isIdField = (key: string): boolean => {
    const lowerKey = key.toLowerCase();
    return (
      key === 'id' ||
      key.endsWith('Id') ||
      key.endsWith('ID') ||
      lowerKey === 'id' ||
      lowerKey === 'createdat' ||
      lowerKey === 'updatedat' ||
      key === 'createdAt' ||
      key === 'updatedAt' ||
      key === 'created_at' ||
      key === 'updated_at'
    );
  };

  // Helper function to check if a field should be shown in Slide section summary
  const isSlideFieldAllowedInSummary = (key: string): boolean => {
    // Position fields (not allowed)
    if (key.startsWith('position')) return false;

    // Only allow specific fields
    const allowedFields = [
      'outerParallelism',
      'outerHasParallelismBeenAdjusted',
      'innerParallelism',
      'innerHasParallelismBeenAdjusted',
      'outerShutheightIndicatorsChecked',
      'outerOverloadsOnTonnageMonitor',
      'outerShutheightActualSh',
      'outerIndicatorReading',
      'innerShutheightIndicatorsChecked',
      'innerOverloadsOnTonnageMonitor',
      'innerShutheightActualSh',
      'innerIndicatorReading',
      'notes',
    ];

    return allowedFields.includes(key);
  };

  // Helper function to calculate max deviation from slide position data
  const calculateMaxDeviation = (data: any): string => {
    if (!data) return '-';

    const positions = [
      data.position1,
      data.position2,
      data.position3,
      data.position4,
      data.position5,
      data.position6,
    ];
    const validValues = positions.filter(
      (val) => val !== undefined && val !== null && !isNaN(val) && val !== 0,
    );

    if (validValues.length > 1) {
      const max = Math.max(...validValues);
      const min = Math.min(...validValues);
      return (max - min).toFixed(4);
    }
    return '-';
  };

  // Helper function to format field names
  const formatFieldName = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .trim()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to translate field names based on section
  const translateFieldName = (key: string, sectionKey?: string): string => {
    // Try to get translation based on section
    if (sectionKey === 'BEARING_CLEARANCE') {
      // Try bearing clearance fields first
      const translation = tBearingClearanceFields(key);
      if (translation !== key) return translation;
    } else if (sectionKey === 'SLIDE') {
      // Try slide fields
      const translation = tSlideFields(key);
      if (translation !== key) return translation;
    } else if (sectionKey === 'CLUTCH') {
      // Try clutch fields
      const translation = tClutchFields(key);
      if (translation !== key) return translation;
    } else if (sectionKey === 'COUNTERBALANCE_CYLINDER_AIRBAG') {
      // Try counterbalance fields
      const translation = tCounterbalanceFields(key);
      if (translation !== key) return translation;
    } else if (sectionKey === 'GIBS') {
      // Gibs uses similar field names to bearing clearance
      const translation = tBearingClearanceFields(key);
      if (translation !== key) return translation;
    }

    // Fallback to formatFieldName for fields without translations
    return formatFieldName(key);
  };

  // Helper function to display value or "-" for empty
  const displayValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    // Handle enum translations
    const stringValue = String(value);

    // Translate ParallelismType values
    if (stringValue === 'TO_BED') {
      return tSlide('toBed');
    }
    if (stringValue === 'TO_BOLSTER') {
      return tSlide('toBolster');
    }
    if (stringValue === 'DNC') {
      return tSlide('dnc');
    }

    // Translate Yes/No/NA values
    if (stringValue === 'YES') {
      return tSlide('yes');
    }
    if (stringValue === 'NO') {
      return tSlide('no');
    }
    if (stringValue === 'NA') {
      return tSlide('na');
    }

    return stringValue;
  };

  // Helper function to extract bearing measurement rows
  const extractBearingRows = (data: any, sectionKey?: string) => {
    if (!data) return [];

    const rows: { field: string; lh: any; rh: any; differential: string }[] = [];
    const processedFields = new Set<string>();

    // Fields to skip (non-measurement fields)
    const skipFields = [
      'hasBeenAdjusted',
      'combinedWith',
      'matingPart',
      'slideMotorMounts',
      'powerCordHoses',
      'chainsGearsSprockets',
      'lockingClamps',
      'notes',
    ];

    Object.keys(data).forEach((key) => {
      // Skip ID and timestamp fields
      if (isIdField(key)) {
        return;
      }

      // Skip non-measurement fields
      if (skipFields.includes(key)) {
        return;
      }

      // Extract field name without _RH or _LH suffix
      const baseField = key.replace(/_RH$|_LH$/, '');

      if (!processedFields.has(baseField)) {
        processedFields.add(baseField);
        const lhValue = data[`${baseField}_LH`];
        const rhValue = data[`${baseField}_RH`];

        // Calculate differential
        let differential = '-';
        if (typeof lhValue === 'number' && typeof rhValue === 'number') {
          differential = String(Math.abs(rhValue - lhValue));
        }

        rows.push({
          field: translateFieldName(baseField, sectionKey),
          lh: lhValue,
          rh: rhValue,
          differential,
        });
      }
    });

    return rows;
  };

  // Helper function to check if data has actual values (not just defaults)
  const hasActualData = (data: any): boolean => {
    if (!data) return false;

    // Check if any field has a value (including zero, which is valid)
    return Object.entries(data).some(([key, value]) => {
      if (key === 'hasBeenAdjusted' || key === 'combinedWith' || key === 'matingPart') {
        // Check if these string fields have non-empty values
        return value !== '' && value !== null && value !== undefined;
      }
      // For numeric fields, check if they exist (0 is a valid value)
      return typeof value === 'number' && !isNaN(value);
    });
  };

  // Mock function to get section status - replace with actual logic
  const getSectionStatus = (_sectionKey: string): SectionStatus => {
    // This should check the latest inspection data for this section
    // For now, return 'unknown' as placeholder
    return 'unknown';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full md:w-[1200px] h-[86vh] max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isCompletingService
              ? isInspection
                ? currentStep === 'selection'
                  ? tServices('modal.completeInspection')
                  : tServices('modal.completeInspectionDetails')
                : currentStep === 'selection'
                  ? tServices('modal.completeMaintenance')
                  : tServices('modal.completeMaintenanceDetails')
              : currentStep === 'selection'
                ? tServices('createNewService')
                : tServices('createNewService') + ' - ' + t('inspectionSections')}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 'selection'
              ? tServices('modal.selectMaintenanceAreas')
              : isCompletingService
                ? isInspection
                  ? tServices('modal.fillInspectionDetails')
                  : tServices('modal.fillMaintenanceDetails')
                : tServices('createServiceDescription')}
          </DialogDescription>
        </DialogHeader>

        {isLoadingServiceData && serviceId && !hasLoadedInitialData.current ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <Typography variant="muted">Carregando dados do serviço...</Typography>
            </div>
          </div>
        ) : currentStep === 'selection' ? (
          // Step 1: Section Selection
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {machineSections.map((sectionKey) => {
                const sectionConfig = SECTION_REGISTRY[sectionKey];
                if (!sectionConfig) return null;

                return (
                  <SelectableSectionCard
                    key={sectionConfig.key}
                    title={t(`sectionNames.${sectionConfig.metadata.i18nKey}`)}
                    status={getSectionStatus(sectionConfig.key)}
                    imageUrl={sectionConfig.metadata.image}
                    subtitle="CP 2"
                    isSelected={selectedSections.has(sectionConfig.key)}
                    onClick={() => toggleSection(sectionConfig.key)}
                  />
                );
              })}
            </div>

            <div className="mt-6 px-1 text-sm text-muted-foreground">
              {selectedSections.size > 0
                ? `${selectedSections.size} ${selectedSections.size === 1 ? 'área selecionada' : 'áreas selecionadas'}`
                : tServices('modal.selectAreasAbove')}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleProceedToDetails}
                disabled={selectedSections.size === 0}
              >
                Continuar
              </Button>
            </div>
          </div>
        ) : currentStep === 'details' ? (
          // Step 2: Service Details (Date & PerformedBy)
          <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
            <div className="px-4 pb-2 pt-2">
              <Stepper steps={getStepperSteps()} onStepClick={handleStepClick} />
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">
                    {isCompletingService
                      ? tServices('modal.realizationDate')
                      : tServices('serviceDate')}
                  </Label>
                  <div className="flex items-center gap-2 mt-1 h-10 px-3 py-2 border rounded-md">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{date ? format(date, 'PPP') : '-'}</span>
                  </div>
                </div>

                {isCompletingService ? (
                  <div>
                    <Label htmlFor="performedBy">{tServices('modal.performedBy')}</Label>
                    <Input
                      id="performedBy"
                      type="text"
                      value={performedBy}
                      onChange={(e) => setPerformedBy(e.target.value)}
                      placeholder={tServices('modal.technicianName')}
                      className="mt-1 h-10"
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="type">{tServices('serviceType')}</Label>
                    <Select
                      value={selectedServiceType}
                      onValueChange={(value) => setSelectedServiceType(value as ServiceType)}
                    >
                      <SelectTrigger id="type" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ServiceType.INSPECTION}>
                          {tServices('types.inspection')}
                        </SelectItem>
                        <SelectItem value={ServiceType.MAINTENANCE}>
                          {tServices('types.maintenance')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="border rounded-lg p-4">
                <Typography variant="h4" className="mb-3">
                  Áreas selecionadas
                </Typography>
                <div className="flex flex-wrap gap-2">
                  {Array.from(selectedSections).map((sectionKey) => {
                    const sectionConfig = SECTION_REGISTRY[sectionKey];
                    if (!sectionConfig) return null;

                    return (
                      <div
                        key={sectionConfig.key}
                        className="px-3 py-1.5 bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 rounded-md text-sm"
                      >
                        {t(`sectionNames.${sectionConfig.metadata.i18nKey}`)}
                      </div>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div className="text-sm text-destructive border border-destructive rounded-md p-2">
                  {error}
                </div>
              )}
            </div>

            <div className="flex justify-between gap-3 pt-4 px-4 border-t">
              {!shouldSkipSelection && (
                <Button type="button" variant="outline" onClick={() => setCurrentStep('selection')}>
                  Voltar
                </Button>
              )}
              <Button
                type="button"
                onClick={handleNext}
                className={shouldSkipSelection ? 'ml-auto' : ''}
              >
                Continuar
              </Button>
            </div>
          </form>
        ) : currentStep === 'sections' ? (
          // Step 3: Section Forms (One at a time with stepper)
          <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
            <div className="px-4 pb-2">
              <Stepper steps={getStepperSteps()} onStepClick={handleStepClick} />
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2">
              {(() => {
                const sectionsArray = getSelectedSectionsArray();
                const currentSectionKey = sectionsArray[currentSectionIndex];

                return (
                  <>
                    {(() => {
                      const sectionConfig = SECTION_REGISTRY[currentSectionKey];
                      if (!sectionConfig) return null;

                      const SectionComponent = sectionConfig.component;
                      const sectionData = completedSectionData[currentSectionKey];
                      // Create a key that changes when data is loaded to force component remount
                      const dataHash = sectionData
                        ? JSON.stringify(Object.keys(sectionData).sort()).substring(0, 20)
                        : 'empty';
                      const componentKey = `${currentSectionKey}-${dataHash}`;

                      console.log('🟢 [ServiceCompletionModal] Rendering section:', {
                        currentSectionKey,
                        hasSectionData: !!sectionData,
                        sectionDataKeys: sectionData ? Object.keys(sectionData) : [],
                        sectionDataSample: sectionData
                          ? JSON.stringify(sectionData).substring(0, 200)
                          : null,
                        componentKey,
                      });

                      return (
                        <div key={componentKey} className="space-y-4">
                          <Typography variant="h3" className="text-lg font-semibold">
                            {t(`sectionNames.${sectionConfig.metadata.i18nKey}`)}
                          </Typography>

                          <div className="border rounded-lg">
                            <SectionComponent
                              key={componentKey}
                              ref={(ref: SectionComponentRef | null) => {
                                if (ref) {
                                  sectionRefs.current.set(currentSectionKey, ref);
                                }
                              }}
                              onSectionTouched={() => handleSectionTouched(currentSectionKey)}
                              serviceType={currentServiceType}
                              isOpen={true}
                              onOpenChange={() => {}}
                              initialData={sectionData}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </>
                );
              })()}

              {error && (
                <div className="text-sm text-destructive border border-destructive rounded-md p-2 mt-4">
                  {error}
                </div>
              )}
            </div>

            <div className="flex justify-between gap-3 pt-4 px-4 border-t">
              <Button type="button" variant="outline" onClick={handlePrevious}>
                Anterior
              </Button>
              <Button type="button" onClick={handleNext}>
                Salvar e Continuar
              </Button>
            </div>
          </form>
        ) : currentStep === 'summary' ? (
          // Step 4: Summary/Review
          <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
            <div className="px-4 pb-2">
              <Stepper steps={getStepperSteps()} onStepClick={handleStepClick} />
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <Typography variant="h3" className="text-lg font-semibold mb-4">
                {isInspection
                  ? tServices('modal.inspectionSummary')
                  : tServices('modal.maintenanceSummary')}
              </Typography>

              <div className="border rounded-lg p-4 mb-4">
                <Typography variant="h4" className="font-semibold mb-3">
                  Detalhes do Serviço
                </Typography>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      {tServices('modal.realizationDate')}
                    </Label>
                    <div className="text-sm font-medium">{date ? format(date, 'PPP') : '-'}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      {tServices('modal.performedBy')}
                    </Label>
                    <div className="text-sm font-medium">{performedBy || '-'}</div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 mb-4">
                <Typography variant="h4" className="font-semibold mb-3">
                  Áreas Preenchidas
                </Typography>
                <div className="space-y-2">
                  {Array.from(completedSections).map((sectionKey) => {
                    const sectionConfig = SECTION_REGISTRY[sectionKey];
                    if (!sectionConfig) return null;
                    return (
                      <div
                        key={sectionKey}
                        className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md"
                      >
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {t(`sectionNames.${sectionConfig.metadata.i18nKey}`)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <Typography variant="h4" className="font-semibold">
                  Dados Preenchidos
                </Typography>

                {Array.from(selectedSections).map((sectionKey) => {
                  const sectionConfig = SECTION_REGISTRY[sectionKey];
                  if (!sectionConfig) return null;

                  const isCompleted = completedSections.has(sectionKey);

                  // Render Bearing Clearance Section
                  if (sectionKey === 'BEARING_CLEARANCE') {
                    const data = completedSectionData[sectionKey];

                    // Check if we have before data
                    const hasBeforeData =
                      (data?.outerBefore && hasActualData(data.outerBefore)) ||
                      (data?.innerBefore && hasActualData(data.innerBefore));
                    // API uses outerData/innerData instead of outerAfter/innerAfter
                    const hasAfterData =
                      (data?.outerData && hasActualData(data.outerData)) ||
                      (data?.innerData && hasActualData(data.innerData));

                    const outerBeforeRows = extractBearingRows(
                      data?.outerBefore,
                      'BEARING_CLEARANCE',
                    );
                    const innerBeforeRows = extractBearingRows(
                      data?.innerBefore,
                      'BEARING_CLEARANCE',
                    );
                    const outerAfterRows = extractBearingRows(data?.outerData, 'BEARING_CLEARANCE');
                    const innerAfterRows = extractBearingRows(data?.innerData, 'BEARING_CLEARANCE');

                    return (
                      <Collapsible key={sectionKey} defaultOpen={isCompleted}>
                        <div className="border rounded-lg">
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors group">
                            <div className="flex items-center gap-2">
                              <Typography variant="h4" className="font-semibold text-sm">
                                {t('sectionNames.bearingClearance')}
                              </Typography>
                              {isCompleted ? (
                                <span className="text-xs text-green-600 dark:text-green-400">
                                  ({tServices('modal.status.complete')})
                                </span>
                              ) : (
                                <span className="text-xs text-orange-600 dark:text-orange-400">
                                  ({tServices('modal.status.incomplete')})
                                </span>
                              )}
                            </div>
                            <ChevronUp className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-3 pt-0 text-xs">
                            {hasBeforeData && (
                              <div className="border-t pt-2 mb-3">
                                <div className="font-semibold text-muted-foreground mb-2 text-sm">
                                  {tServices('modal.sections.beforeMaintenance')}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="border rounded-md overflow-hidden">
                                    <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                      {tTable('outer')}
                                    </div>
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="bg-muted/50">
                                          <TableHead className="h-8 text-[10px] font-semibold border-r">
                                            {tTable('field')}
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                            {tTable('lh')}
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                            {tTable('rh')}
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold">
                                            {tTable('diff')}
                                          </TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {outerBeforeRows.map((row, idx) => (
                                          <TableRow
                                            key={idx}
                                            className="text-[11px] hover:bg-muted/30"
                                          >
                                            <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                                              {row.field}
                                            </TableCell>
                                            <TableCell className="py-1.5 text-center border-r">
                                              {displayValue(row.lh)}
                                            </TableCell>
                                            <TableCell className="py-1.5 text-center border-r">
                                              {displayValue(row.rh)}
                                            </TableCell>
                                            <TableCell className="py-1.5 text-center">
                                              {row.differential}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>

                                  <div className="border rounded-md overflow-hidden">
                                    <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                      {tTable('inner')}
                                    </div>
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="bg-muted/50">
                                          <TableHead className="h-8 text-[10px] font-semibold border-r">
                                            {tTable('field')}
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                            {tTable('lh')}
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                            {tTable('rh')}
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold">
                                            {tTable('diff')}
                                          </TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {innerBeforeRows.map((row, idx) => (
                                          <TableRow
                                            key={idx}
                                            className="text-[11px] hover:bg-muted/30"
                                          >
                                            <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                                              {row.field}
                                            </TableCell>
                                            <TableCell className="py-1.5 text-center border-r">
                                              {displayValue(row.lh)}
                                            </TableCell>
                                            <TableCell className="py-1.5 text-center border-r">
                                              {displayValue(row.rh)}
                                            </TableCell>
                                            <TableCell className="py-1.5 text-center">
                                              {row.differential}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                              </div>
                            )}

                            {hasAfterData && (
                              <div className="border-t pt-2">
                                {hasBeforeData && (
                                  <div className="font-semibold text-muted-foreground mb-2 text-sm">
                                    {tServices('modal.sections.afterMaintenance')}
                                  </div>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="border rounded-md overflow-hidden">
                                    <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                      {tTable('outer')}
                                    </div>
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="bg-muted/50">
                                          <TableHead className="h-8 text-[10px] font-semibold border-r">
                                            {tTable('field')}
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                            {tTable('lh')}
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                            {tTable('rh')}
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold">
                                            {tTable('diff')}
                                          </TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {outerAfterRows.map((row, idx) => (
                                          <TableRow
                                            key={idx}
                                            className="text-[11px] hover:bg-muted/30"
                                          >
                                            <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                                              {row.field}
                                            </TableCell>
                                            <TableCell className="py-1.5 text-center border-r">
                                              {displayValue(row.lh)}
                                            </TableCell>
                                            <TableCell className="py-1.5 text-center border-r">
                                              {displayValue(row.rh)}
                                            </TableCell>
                                            <TableCell className="py-1.5 text-center">
                                              {row.differential}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>

                                  <div className="border rounded-md overflow-hidden">
                                    <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                      {tTable('inner')}
                                    </div>
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="bg-muted/50">
                                          <TableHead className="h-8 text-[10px] font-semibold border-r">
                                            {tTable('field')}
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                            {tTable('lh')}
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                            {tTable('rh')}
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold">
                                            {tTable('diff')}
                                          </TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {innerAfterRows.map((row, idx) => (
                                          <TableRow
                                            key={idx}
                                            className="text-[11px] hover:bg-muted/30"
                                          >
                                            <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                                              {row.field}
                                            </TableCell>
                                            <TableCell className="py-1.5 text-center border-r">
                                              {displayValue(row.lh)}
                                            </TableCell>
                                            <TableCell className="py-1.5 text-center border-r">
                                              {displayValue(row.rh)}
                                            </TableCell>
                                            <TableCell className="py-1.5 text-center">
                                              {row.differential}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                              </div>
                            )}

                            {(hasBeforeData || hasAfterData) && (
                              <div className="border-t pt-2 mt-3">
                                <div className="font-semibold text-muted-foreground mb-2 text-sm">
                                  {tServicesSummary('additionalInformation')}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="border rounded-md overflow-hidden">
                                    <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                      {tTable('outer')}
                                    </div>
                                    <div className="p-2 space-y-1.5 text-[11px]">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          {tBearingFields('combinedWith')}:
                                        </span>
                                        <span className="font-medium">
                                          {displayValue(
                                            data?.outerData?.combinedWith ||
                                              data?.outerBefore?.combinedWith,
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          {tBearingFields('matingPart')}:
                                        </span>
                                        <span className="font-medium">
                                          {displayValue(
                                            data?.outerData?.matingPart ||
                                              data?.outerBefore?.matingPart,
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          {tBearingFields('hasBeenAdjusted')}:
                                        </span>
                                        <span className="font-medium">
                                          {displayValue(
                                            data?.outerData?.hasBeenAdjusted ||
                                              data?.outerBefore?.hasBeenAdjusted,
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="border rounded-md overflow-hidden">
                                    <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                      {tTable('inner')}
                                    </div>
                                    <div className="p-2 space-y-1.5 text-[11px]">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          {tBearingFields('combinedWith')}:
                                        </span>
                                        <span className="font-medium">
                                          {displayValue(
                                            data?.innerData?.combinedWith ||
                                              data?.innerBefore?.combinedWith,
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          {tBearingFields('matingPart')}:
                                        </span>
                                        <span className="font-medium">
                                          {displayValue(
                                            data?.innerData?.matingPart ||
                                              data?.innerBefore?.matingPart,
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          {tBearingFields('hasBeenAdjusted')}:
                                        </span>
                                        <span className="font-medium">
                                          {displayValue(
                                            data?.innerData?.hasBeenAdjusted ||
                                              data?.innerBefore?.hasBeenAdjusted,
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-3">
                                  <div className="font-semibold text-muted-foreground mb-2 text-xs">
                                    {tServicesSummary('shutdownAdjustmentMechanism')}
                                  </div>
                                  <div className="border rounded-md overflow-hidden">
                                    <div className="p-2 space-y-1.5 text-[11px]">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          {tBearingFields('slideMotorMounts')}:
                                        </span>
                                        <span className="font-medium">
                                          {displayValue(
                                            data?.outerData?.slideMotorMounts ||
                                              data?.outerBefore?.slideMotorMounts,
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          {tBearingFields('powerCordHoses')}:
                                        </span>
                                        <span className="font-medium">
                                          {displayValue(
                                            data?.outerData?.powerCordHoses ||
                                              data?.outerBefore?.powerCordHoses,
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          {tBearingFields('chainsGearsSprockets')}:
                                        </span>
                                        <span className="font-medium">
                                          {displayValue(
                                            data?.outerData?.chainsGearsSprockets ||
                                              data?.outerBefore?.chainsGearsSprockets,
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          {tBearingFields('lockingClamps')}:
                                        </span>
                                        <span className="font-medium">
                                          {displayValue(
                                            data?.outerData?.lockingClamps ||
                                              data?.outerBefore?.lockingClamps,
                                          )}
                                        </span>
                                      </div>
                                      {(data?.outerData?.notes || data?.outerBefore?.notes) && (
                                        <div className="flex flex-col gap-1 pt-1 border-t">
                                          <span className="text-muted-foreground">
                                            {tServicesSummary('notes')}:
                                          </span>
                                          <span className="font-medium">
                                            {displayValue(
                                              data?.outerData?.notes || data?.outerBefore?.notes,
                                            )}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    );
                  }

                  // Render Slide Section
                  if (sectionKey === 'SLIDE') {
                    const data = completedSectionData[sectionKey] || {};

                    return (
                      <Collapsible key={sectionKey} defaultOpen={isCompleted}>
                        <div className="border rounded-lg">
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors group">
                            <div className="flex items-center gap-2">
                              <Typography variant="h4" className="font-semibold text-sm">
                                {t('sectionNames.slide')}
                              </Typography>
                              {isCompleted ? (
                                <span className="text-xs text-green-600 dark:text-green-400">
                                  ({tServices('modal.status.complete')})
                                </span>
                              ) : (
                                <span className="text-xs text-orange-600 dark:text-orange-400">
                                  ({tServices('modal.status.incomplete')})
                                </span>
                              )}
                            </div>
                            <ChevronUp className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-3 pt-0 text-xs">
                            {((data as any).outerBefore || (data as any).innerBefore) && (
                              <div className="border-t pt-2 mb-3">
                                <div className="font-medium text-muted-foreground mb-2 text-[11px]">
                                  {tServices('modal.sections.beforeMaintenance')}
                                </div>
                                <div className="border rounded-md overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-muted/50">
                                        <TableHead className="h-8 text-[10px] font-semibold border-r">
                                          {tTable('field')}
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                          {tTable('outer')}
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] text-center font-semibold">
                                          {tTable('inner')}
                                        </TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {Object.keys(
                                        (data as any).outerBefore ||
                                          (data as any).innerBefore ||
                                          {},
                                      )
                                        .filter((key) => !isIdField(key))
                                        .map((key) => (
                                          <TableRow
                                            key={key}
                                            className="text-[11px] hover:bg-muted/30"
                                          >
                                            <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                                              {formatFieldName(key)}
                                            </TableCell>
                                            <TableCell className="py-1.5 text-center border-r">
                                              {displayValue((data as any).outerBefore?.[key])}
                                            </TableCell>
                                            <TableCell className="py-1.5 text-center">
                                              {displayValue((data as any).innerBefore?.[key])}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            )}

                            {(data.outerData || data.innerData) && (
                              <div className="border-t pt-2 mb-3">
                                <div className="font-medium text-muted-foreground mb-2 text-[11px]">
                                  Data Measurements
                                </div>
                                <div className="border rounded-md overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-muted/50">
                                        <TableHead className="h-8 text-[10px] font-semibold border-r">
                                          {tTable('field')}
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                          {tTable('outer')}
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] text-center font-semibold">
                                          {tTable('inner')}
                                        </TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {Object.keys(
                                        (data as any).outerData || (data as any).innerData || {},
                                      )
                                        .filter((key) => !isIdField(key))
                                        .map((key) => (
                                          <TableRow
                                            key={key}
                                            className="text-[11px] hover:bg-muted/30"
                                          >
                                            <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                                              {formatFieldName(key)}
                                            </TableCell>
                                            <TableCell className="py-1.5 text-center border-r">
                                              {displayValue((data as any).outerData?.[key])}
                                            </TableCell>
                                            <TableCell className="py-1.5 text-center">
                                              {displayValue((data as any).innerData?.[key])}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            )}

                            {Object.entries(data).filter(
                              ([key, value]) =>
                                !isIdField(key) &&
                                isSlideFieldAllowedInSummary(key) &&
                                key !== 'outerData' &&
                                key !== 'innerData' &&
                                key !== 'outerBefore' &&
                                key !== 'innerBefore' &&
                                (typeof value !== 'object' || value === null) &&
                                value !== null &&
                                value !== undefined &&
                                value !== '',
                            ).length > 0 && (
                              <div className="border-t pt-2">
                                <div className="font-medium text-muted-foreground mb-2 text-[11px]">
                                  Section Fields
                                </div>
                                <div className="border rounded-md overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-muted/50">
                                        <TableHead className="h-8 text-[10px] font-semibold border-r">
                                          Field
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] text-center font-semibold">
                                          Value
                                        </TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {Object.entries(data)
                                        .filter(
                                          ([key, value]) =>
                                            !isIdField(key) &&
                                            isSlideFieldAllowedInSummary(key) &&
                                            key !== 'outerData' &&
                                            key !== 'innerData' &&
                                            key !== 'outerBefore' &&
                                            key !== 'innerBefore' &&
                                            (typeof value !== 'object' || value === null) &&
                                            value !== null &&
                                            value !== undefined &&
                                            value !== '',
                                        )
                                        .map(([key, value]) => (
                                          <TableRow
                                            key={key}
                                            className="text-[11px] hover:bg-muted/30"
                                          >
                                            <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                                              {formatFieldName(key)}
                                            </TableCell>
                                            <TableCell className="py-1.5 text-center">
                                              {displayValue(value)}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            )}

                            {data.outerBefore && (
                              <div className="border-t pt-3 mt-3">
                                <div className="font-medium text-muted-foreground mb-2 text-[11px]">
                                  Outer - Before Maintenance
                                </div>
                                <div className="border rounded-md overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-muted/50">
                                        <TableHead className="h-8 text-[10px] font-semibold text-center">
                                          Pos 1
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] font-semibold text-center">
                                          Pos 2
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] font-semibold text-center">
                                          Pos 3
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] font-semibold text-center">
                                          Pos 4
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] font-semibold text-center">
                                          Pos 5
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] font-semibold text-center">
                                          Pos 6
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] font-semibold text-center bg-blue-50 dark:bg-blue-950">
                                          {tSlide('maxDeviation')}
                                        </TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      <TableRow className="text-[11px]">
                                        <TableCell className="py-1.5 text-center">
                                          {displayValue(data.outerBefore.position1)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center">
                                          {displayValue(data.outerBefore.position2)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center">
                                          {displayValue(data.outerBefore.position3)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center">
                                          {displayValue(data.outerBefore.position4)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center">
                                          {displayValue(data.outerBefore.position5)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center">
                                          {displayValue(data.outerBefore.position6)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center font-semibold bg-blue-50 dark:bg-blue-950">
                                          {calculateMaxDeviation(data.outerBefore)}
                                        </TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            )}

                            {data.outerData && (
                              <div className="border-t pt-3 mt-3">
                                <div className="font-medium text-muted-foreground mb-2 text-[11px]">
                                  {data.outerBefore
                                    ? tMeasurements('outerAfterMaintenance')
                                    : tMeasurements('outerMeasurements')}
                                </div>
                                <div className="border rounded-md overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-muted/50">
                                        <TableHead className="h-8 text-[10px] font-semibold text-center">
                                          Pos 1
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] font-semibold text-center">
                                          Pos 2
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] font-semibold text-center">
                                          Pos 3
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] font-semibold text-center">
                                          Pos 4
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] font-semibold text-center">
                                          Pos 5
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] font-semibold text-center">
                                          Pos 6
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] font-semibold text-center bg-blue-50 dark:bg-blue-950">
                                          {tSlide('maxDeviation')}
                                        </TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      <TableRow className="text-[11px]">
                                        <TableCell className="py-1.5 text-center">
                                          {displayValue(data.outerData.position1)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center">
                                          {displayValue(data.outerData.position2)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center">
                                          {displayValue(data.outerData.position3)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center">
                                          {displayValue(data.outerData.position4)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center">
                                          {displayValue(data.outerData.position5)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center">
                                          {displayValue(data.outerData.position6)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center font-semibold bg-blue-50 dark:bg-blue-950">
                                          {calculateMaxDeviation(data.outerData)}
                                        </TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            )}

                            {data.innerBefore && (
                              <div className="border-t pt-3 mt-3">
                                <div className="font-medium text-muted-foreground mb-2 text-[11px]">
                                  Inner - Before Maintenance
                                </div>
                                <div className="border rounded-md overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-muted/50">
                                        <TableHead className="h-8 text-[10px] font-semibold text-center">
                                          Pos 1
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] font-semibold text-center">
                                          Pos 2
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] font-semibold text-center">
                                          Pos 3
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] font-semibold text-center">
                                          Pos 4
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] font-semibold text-center">
                                          Pos 5
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] font-semibold text-center">
                                          Pos 6
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] font-semibold text-center bg-blue-50 dark:bg-blue-950">
                                          {tSlide('maxDeviation')}
                                        </TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      <TableRow className="text-[11px]">
                                        <TableCell className="py-1.5 text-center">
                                          {displayValue(data.innerBefore.position1)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center">
                                          {displayValue(data.innerBefore.position2)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center">
                                          {displayValue(data.innerBefore.position3)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center">
                                          {displayValue(data.innerBefore.position4)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center">
                                          {displayValue(data.innerBefore.position5)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center">
                                          {displayValue(data.innerBefore.position6)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center font-semibold bg-blue-50 dark:bg-blue-950">
                                          {calculateMaxDeviation(data.innerBefore)}
                                        </TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            )}

                            {data.innerData && (
                              <div className="border-t pt-3 mt-3">
                                <div className="font-medium text-muted-foreground mb-2 text-[11px]">
                                  {data.innerBefore
                                    ? tMeasurements('innerAfterMaintenance')
                                    : tMeasurements('innerMeasurements')}
                                </div>
                                <div className="border rounded-md overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-muted/50">
                                        <TableHead className="h-8 text-[10px] font-semibold text-center">
                                          Pos 1
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] font-semibold text-center">
                                          Pos 2
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] font-semibold text-center">
                                          Pos 3
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] font-semibold text-center">
                                          Pos 4
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] font-semibold text-center">
                                          Pos 5
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] font-semibold text-center">
                                          Pos 6
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] font-semibold text-center bg-blue-50 dark:bg-blue-950">
                                          {tSlide('maxDeviation')}
                                        </TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      <TableRow className="text-[11px]">
                                        <TableCell className="py-1.5 text-center">
                                          {displayValue(data.innerData.position1)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center">
                                          {displayValue(data.innerData.position2)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center">
                                          {displayValue(data.innerData.position3)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center">
                                          {displayValue(data.innerData.position4)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center">
                                          {displayValue(data.innerData.position5)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center">
                                          {displayValue(data.innerData.position6)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center font-semibold bg-blue-50 dark:bg-blue-950">
                                          {calculateMaxDeviation(data.innerData)}
                                        </TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            )}
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    );
                  }

                  // Render Lubrication/Hydraulics Section
                  if (sectionKey === 'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER') {
                    const data = completedSectionData[sectionKey] || {};

                    return (
                      <Collapsible key={sectionKey} defaultOpen={isCompleted}>
                        <div className="border rounded-lg">
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors group">
                            <div className="flex items-center gap-2">
                              <Typography variant="h4" className="font-semibold text-sm">
                                {t('sectionNames.lubricationHydraulics')}
                              </Typography>
                              {isCompleted ? (
                                <span className="text-xs text-green-600 dark:text-green-400">
                                  ({tServices('modal.status.complete')})
                                </span>
                              ) : (
                                <span className="text-xs text-orange-600 dark:text-orange-400">
                                  ({tServices('modal.status.incomplete')})
                                </span>
                              )}
                            </div>
                            <ChevronUp className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-3 pt-0 text-xs">
                            <div className="border-t pt-2">
                              <div className="border rounded-md overflow-hidden">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-muted/50">
                                      <TableHead className="h-8 text-[10px] font-semibold border-r">
                                        Field
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold">
                                        Value
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {Object.entries(data).map(([key, value]) => (
                                      <TableRow key={key} className="text-[11px] hover:bg-muted/30">
                                        <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                                          {formatFieldName(key)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center">
                                          {displayValue(value)}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    );
                  }

                  // Render GIBS Section
                  if (sectionKey === 'GIBS') {
                    const data = completedSectionData[sectionKey] || {};

                    const calculateGibsFields = (stageData: GibsStageData) => {
                      const toNum = (val: number | undefined) =>
                        typeof val === 'number' ? val : 0;
                      const isNum = (val: number | undefined): boolean =>
                        typeof val === 'number' && !isNaN(val);

                      const frontTop = toNum(stageData.point1) + toNum(stageData.point2);
                      const frontBottom = toNum(stageData.point3) + toNum(stageData.point4);
                      const backTop = toNum(stageData.point5) + toNum(stageData.point6);
                      const backBottom = toNum(stageData.point7) + toNum(stageData.point8);
                      const leftTop = toNum(stageData.point9) + toNum(stageData.point13);
                      const leftBottom = toNum(stageData.point11) + toNum(stageData.point15);
                      const rightTop = toNum(stageData.point10) + toNum(stageData.point14);
                      const rightBottom = toNum(stageData.point12) + toNum(stageData.point16);

                      const topPointsCount = [
                        stageData.point9,
                        stageData.point10,
                        stageData.point13,
                        stageData.point14,
                      ].filter(isNum).length;

                      const bottomPointsCount = [
                        stageData.point11,
                        stageData.point12,
                        stageData.point15,
                        stageData.point16,
                      ].filter(isNum).length;

                      let usable: number | undefined;

                      if (topPointsCount === 4 && bottomPointsCount === 4) {
                        const minLeft = Math.min(
                          toNum(stageData.point9),
                          toNum(stageData.point11),
                          toNum(stageData.point13),
                          toNum(stageData.point15),
                        );
                        const minRight = Math.min(
                          toNum(stageData.point10),
                          toNum(stageData.point12),
                          toNum(stageData.point14),
                          toNum(stageData.point16),
                        );
                        usable = minLeft + minRight;
                      } else if (topPointsCount === 4) {
                        const minTopLeft = Math.min(
                          toNum(stageData.point9),
                          toNum(stageData.point13),
                        );
                        const minTopRight = Math.min(
                          toNum(stageData.point10),
                          toNum(stageData.point14),
                        );
                        usable = minTopLeft + minTopRight;
                      } else if (bottomPointsCount === 4) {
                        const minBottomLeft = Math.min(
                          toNum(stageData.point11),
                          toNum(stageData.point15),
                        );
                        const minBottomRight = Math.min(
                          toNum(stageData.point12),
                          toNum(stageData.point16),
                        );
                        usable = minBottomLeft + minBottomRight;
                      }

                      return {
                        frontTop,
                        frontBottom,
                        backTop,
                        backBottom,
                        leftTop,
                        leftBottom,
                        rightTop,
                        rightBottom,
                        usable,
                      };
                    };

                    // Helper to render a stage with grouped measurements and calculations
                    const renderStageTable = (stageData: any, stageTitle: string) => {
                      if (!stageData) return null;

                      // Group points by category
                      const frontToBackPoints = [1, 2, 3, 4, 5, 6, 7, 8];
                      const leftToRightPoints = [9, 10, 11, 12, 13, 14, 15, 16];

                      const hasFrontToBack = frontToBackPoints.some(
                        (i) =>
                          stageData[`point${i}`] !== undefined && stageData[`point${i}`] !== null,
                      );
                      const hasLeftToRight = leftToRightPoints.some(
                        (i) =>
                          stageData[`point${i}`] !== undefined && stageData[`point${i}`] !== null,
                      );

                      if (!hasFrontToBack && !hasLeftToRight) return null;

                      const calculated = calculateGibsFields(stageData);

                      return (
                        <div className="mb-2 border rounded-md p-2 bg-muted/10">
                          <div className="font-medium text-muted-foreground mb-2 text-xs">
                            {stageTitle}
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            {hasFrontToBack && (
                              <div>
                                <div className="text-[10px] font-semibold mb-1 text-muted-foreground">
                                  {tGibsFields('frontToBackTitle')}
                                </div>
                                <div className="grid grid-cols-2 gap-1 mb-2">
                                  {[1, 2, 5, 6].map((num) => {
                                    const value = stageData[`point${num}`];
                                    if (value === undefined || value === null) return null;
                                    return (
                                      <div
                                        key={num}
                                        className="flex flex-col p-1 bg-background border rounded text-[10px]"
                                      >
                                        <span className="text-muted-foreground text-[9px]">
                                          P{num}
                                        </span>
                                        <span className="font-mono font-medium">
                                          {displayValue(value)}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>

                                <div className="border rounded overflow-hidden text-[10px]">
                                  <table className="w-full">
                                    <thead>
                                      <tr className="bg-muted/50">
                                        <th className="border p-1"></th>
                                        <th className="border p-1">{tGibsFields('top')}</th>
                                        <th className="border p-1">{tGibsFields('bottom')}</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td className="border p-1 bg-muted/50 font-medium">
                                          {tGibsFields('front')}
                                        </td>
                                        <td className="border p-1 text-center font-mono">
                                          {calculated.frontTop.toFixed(4)}
                                        </td>
                                        <td className="border p-1 text-center font-mono">
                                          {calculated.frontBottom.toFixed(4)}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td className="border p-1 bg-muted/50 font-medium">
                                          {tGibsFields('back')}
                                        </td>
                                        <td className="border p-1 text-center font-mono">
                                          {calculated.backTop.toFixed(4)}
                                        </td>
                                        <td className="border p-1 text-center font-mono">
                                          {calculated.backBottom.toFixed(4)}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td className="border p-1 bg-muted/50 font-medium">
                                          {tGibsFields('usable')}
                                        </td>
                                        <td
                                          className="border p-1 text-center font-mono"
                                          colSpan={2}
                                        >
                                          {calculated.usable !== undefined
                                            ? calculated.usable.toFixed(4)
                                            : '-'}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {hasLeftToRight && (
                              <div>
                                <div className="text-[10px] font-semibold mb-1 text-muted-foreground">
                                  {tGibsFields('leftToRightTitle')}
                                </div>
                                <div className="grid grid-cols-4 gap-1 mb-2">
                                  {leftToRightPoints.map((num) => {
                                    const value = stageData[`point${num}`];
                                    if (value === undefined || value === null) return null;
                                    return (
                                      <div
                                        key={num}
                                        className="flex flex-col p-1 bg-background border rounded text-[10px]"
                                      >
                                        <span className="text-muted-foreground text-[9px]">
                                          P{num}
                                        </span>
                                        <span className="font-mono font-medium">
                                          {displayValue(value)}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>

                                <div className="border rounded overflow-hidden text-[10px]">
                                  <table className="w-full">
                                    <thead>
                                      <tr className="bg-muted/50">
                                        <th className="border p-1"></th>
                                        <th className="border p-1">{tGibsFields('top')}</th>
                                        <th className="border p-1">{tGibsFields('bottom')}</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td className="border p-1 bg-muted/50 font-medium">
                                          {tGibsFields('left')}
                                        </td>
                                        <td className="border p-1 text-center font-mono">
                                          {calculated.leftTop.toFixed(4)}
                                        </td>
                                        <td className="border p-1 text-center font-mono">
                                          {calculated.leftBottom.toFixed(4)}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td className="border p-1 bg-muted/50 font-medium">
                                          {tGibsFields('right')}
                                        </td>
                                        <td className="border p-1 text-center font-mono">
                                          {calculated.rightTop.toFixed(4)}
                                        </td>
                                        <td className="border p-1 text-center font-mono">
                                          {calculated.rightBottom.toFixed(4)}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    };

                    return (
                      <Collapsible key={sectionKey} defaultOpen={isCompleted}>
                        <div className="border rounded-lg">
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors group">
                            <div className="flex items-center gap-2">
                              <Typography variant="h4" className="font-semibold text-sm">
                                {t('sectionNames.gibs')}
                              </Typography>
                              {isCompleted ? (
                                <span className="text-xs text-green-600 dark:text-green-400">
                                  ({tServices('modal.status.complete')})
                                </span>
                              ) : (
                                <span className="text-xs text-orange-600 dark:text-orange-400">
                                  ({tServices('modal.status.incomplete')})
                                </span>
                              )}
                            </div>
                            <ChevronUp className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-3 pt-0 text-xs">
                            <div className="space-y-4">
                              {(data.outerBeforeAdjustment ||
                                data.outerAfterAdjustment ||
                                data.outerFreeHangingAfterInstall) && (
                                <div className="border-t pt-3">
                                  <div className="font-semibold mb-2 text-sm flex items-center gap-2">
                                    <div className="w-1 h-5 bg-primary rounded" />
                                    {tTable('outer')} {tGibsFields('directionalTitle')}
                                  </div>
                                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                                    {renderStageTable(
                                      data.outerBeforeAdjustment,
                                      tGibsFields('beforeAdjustment'),
                                    )}
                                    {renderStageTable(
                                      data.outerAfterAdjustment,
                                      tGibsFields('afterAdjustment'),
                                    )}
                                    {renderStageTable(
                                      data.outerFreeHangingAfterInstall,
                                      tGibsFields('freeHangingAfterInstall'),
                                    )}
                                  </div>
                                </div>
                              )}

                              {(data.innerBeforeAdjustment ||
                                data.innerAfterAdjustment ||
                                data.innerBeforeToolInstallation ||
                                data.innerAfterToolInstallation) && (
                                <div className="border-t pt-3">
                                  <div className="font-semibold mb-2 text-sm flex items-center gap-2">
                                    <div className="w-1 h-5 bg-secondary rounded" />
                                    {tTable('inner')} {tGibsFields('directionalTitle')}
                                  </div>
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                                    {renderStageTable(
                                      data.innerBeforeAdjustment,
                                      tGibsFields('beforeAdjustment'),
                                    )}
                                    {renderStageTable(
                                      data.innerAfterAdjustment,
                                      tGibsFields('afterAdjustment'),
                                    )}
                                    {renderStageTable(
                                      data.innerBeforeToolInstallation,
                                      tGibsFields('beforeToolInstallation'),
                                    )}
                                    {renderStageTable(
                                      data.innerAfterToolInstallation,
                                      tGibsFields('afterToolInstallation'),
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {data.notes && (
                              <div className="border-t pt-2">
                                <div className="font-semibold text-muted-foreground mb-2 text-xs">
                                  {tServicesSummary('notes')}
                                </div>
                                <div className="text-[11px] p-2 bg-muted/20 rounded-md">
                                  {data.notes}
                                </div>
                              </div>
                            )}
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    );
                  }

                  // Render Clutch Section
                  if (sectionKey === 'CLUTCH') {
                    const data = completedSectionData[sectionKey] || {};

                    return (
                      <Collapsible key={sectionKey} defaultOpen={isCompleted}>
                        <div className="border rounded-lg">
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors group">
                            <div className="flex items-center gap-2">
                              <Typography variant="h4" className="font-semibold text-sm">
                                {t('sectionNames.clutch')}
                              </Typography>
                              {isCompleted ? (
                                <span className="text-xs text-green-600 dark:text-green-400">
                                  ({tServices('modal.status.complete')})
                                </span>
                              ) : (
                                <span className="text-xs text-orange-600 dark:text-orange-400">
                                  ({tServices('modal.status.incomplete')})
                                </span>
                              )}
                            </div>
                            <ChevronUp className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-3 pt-0 text-xs">
                            <div className="border-t pt-2">
                              <div className="border rounded-md overflow-hidden">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-muted/50">
                                      <TableHead className="h-8 text-[10px] font-semibold border-r">
                                        Field
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold">
                                        Value
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {Object.entries(data)
                                      .filter(([key]) => !isIdField(key))
                                      .map(([key, value]) => (
                                        <TableRow
                                          key={key}
                                          className="text-[11px] hover:bg-muted/30"
                                        >
                                          <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                                            {formatFieldName(key)}
                                          </TableCell>
                                          <TableCell className="py-1.5 text-center">
                                            {displayValue(value)}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    );
                  }

                  // Render Counterbalance Cylinder Section
                  if (sectionKey === 'COUNTERBALANCE_CYLINDER_AIRBAG') {
                    const data = completedSectionData[sectionKey];

                    return (
                      <Collapsible key={sectionKey} defaultOpen={isCompleted}>
                        <div className="border rounded-lg">
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors group">
                            <div className="flex items-center gap-2">
                              <Typography variant="h4" className="font-semibold text-sm">
                                {t('sectionNames.counterbalance')}
                              </Typography>
                              {isCompleted ? (
                                <span className="text-xs text-green-600 dark:text-green-400">
                                  ({tServices('modal.status.complete')})
                                </span>
                              ) : (
                                <span className="text-xs text-orange-600 dark:text-orange-400">
                                  ({tServices('modal.status.incomplete')})
                                </span>
                              )}
                            </div>
                            <ChevronUp className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-3 pt-0 text-xs">
                            <div className="border-t pt-2">
                              <div className="grid grid-cols-2 gap-3">
                                {data?.outerData && (
                                  <div className="border rounded-md overflow-hidden">
                                    <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                      Outer
                                    </div>
                                    <div className="p-2 space-y-1.5 text-[11px]">
                                      {Object.entries(data.outerData)
                                        .filter(([key]) => !isIdField(key) && key !== 'notes')
                                        .map(([key, value]) => (
                                          <div key={key} className="flex justify-between">
                                            <span className="text-muted-foreground">
                                              {formatFieldName(key)}:
                                            </span>
                                            <span className="font-medium">
                                              {displayValue(value)}
                                            </span>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}

                                {data?.innerData && (
                                  <div className="border rounded-md overflow-hidden">
                                    <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                      Inner
                                    </div>
                                    <div className="p-2 space-y-1.5 text-[11px]">
                                      {Object.entries(data.innerData)
                                        .filter(([key]) => !isIdField(key) && key !== 'notes')
                                        .map(([key, value]) => (
                                          <div key={key} className="flex justify-between">
                                            <span className="text-muted-foreground">
                                              {formatFieldName(key)}:
                                            </span>
                                            <span className="font-medium">
                                              {displayValue(value)}
                                            </span>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {(data?.outerData?.notes || data?.innerData?.notes) && (
                                <div className="mt-3 border-t pt-2">
                                  <div className="font-semibold text-muted-foreground mb-2 text-xs">
                                    Notes
                                  </div>
                                  <div className="border rounded-md overflow-hidden">
                                    <div className="p-2 text-[11px]">
                                      <span className="font-medium">
                                        {displayValue(
                                          data?.outerData?.notes || data?.innerData?.notes,
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    );
                  }

                  return null;
                })}
              </div>

              {error && (
                <div className="text-sm text-destructive border border-destructive rounded-md p-2 mt-4">
                  {error}
                </div>
              )}
            </div>

            <div className="flex justify-between gap-3 pt-4 px-4 border-t">
              <Button type="button" variant="outline" onClick={handlePrevious}>
                Anterior
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  // Disable if not all selected sections are completed
                  !Array.from(selectedSections).every((sectionKey) =>
                    completedSections.has(sectionKey),
                  )
                }
              >
                {isSubmitting
                  ? tServices('modal.completing')
                  : isCompletingService
                    ? isInspection
                      ? tServices('modal.completeInspection')
                      : tServices('modal.completeMaintenance')
                    : tServices('createService')}
              </Button>
            </div>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
