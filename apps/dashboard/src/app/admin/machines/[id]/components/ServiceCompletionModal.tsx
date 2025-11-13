'use client';

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
import {
  ServiceType,
  ServiceStatus,
  type CreateServicePayload,
  type UpdateServicePayload,
} from '@/data/types/services.types';
import { createService, updateService } from '@/data/services/services.api';
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
  // Skip ONLY for inspections (inspections always include all sections)
  // Maintenance services (new or completing) should show selection step
  const shouldSkipSelection = isInspection;

  // For inspections, start at 'details' step (skip selection)
  // For maintenance (new or completing), start at 'selection' step
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

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      // Reset to initial state based on service type
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentStep(shouldSkipSelection ? 'details' : 'selection');
      setCurrentSectionIndex(0);
      setSelectedSections(isInspection ? new Set(machineSections) : new Set());
      setDate(getInitialDate());
      setSelectedServiceType(serviceType || ServiceType.INSPECTION);
      setPerformedBy(initialPerformedBy || '');
      setError(null);
      setCompletedSections(new Set());
      setCompletedSectionData({});
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
  const handleNext = (e?: React.MouseEvent) => {
    // Prevent any form submission
    e?.preventDefault();
    e?.stopPropagation();

    if (currentStep === 'details') {
      // Move to first section
      setCurrentStep('sections');
      setCurrentSectionIndex(0);
    } else if (currentStep === 'sections') {
      // Validate current section before proceeding
      const sectionsArray = getSelectedSectionsArray();
      const currentSectionKey = sectionsArray[currentSectionIndex];

      const validationErrors = validateSection(currentSectionKey);
      if (validationErrors.length > 0) {
        toast.error(validationErrors.join('\n\n'));
        return;
      }

      // Mark section as completed
      setCompletedSections((prev) => new Set(prev).add(currentSectionKey));

      // Save section data to state for summary display
      const ref = sectionRefs.current.get(currentSectionKey);
      if (ref) {
        const result = ref.validateAndGetData(currentServiceType);
        if (result.isValid && result.data) {
          setCompletedSectionData((prev) => ({
            ...prev,
            [currentSectionKey]: result.data,
          }));
        }
      }

      // Move to next section or go to summary
      if (currentSectionIndex < sectionsArray.length - 1) {
        setCurrentSectionIndex(currentSectionIndex + 1);
      } else {
        // All sections completed, move to summary
        setCurrentStep('summary');
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
  const SECTION_TO_PAYLOAD_KEY: Record<
    string,
    keyof UpdateServicePayload | keyof CreateServicePayload
  > = {
    BEARING_CLEARANCE: 'bearingClearance',
    SLIDE: 'slide',
    GIBS: 'gibs',
    LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER: 'lubricationHydraulics',
    CLUTCH: 'clutch',
    COUNTERBALANCE_CYLINDER_AIRBAG: 'counterbalanceCylinder',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);

    // Only allow submission from summary step when completing service
    if (isCompletingService && serviceId) {
      if (currentStep !== 'summary') {
        // Not on summary step, prevent submission
        console.warn('Attempted to submit from non-summary step:', currentStep);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (isCompletingService && serviceId) {
        // Completing an existing maintenance service - validate and collect section data
        const validationErrors: string[] = [];

        // Validate all selected sections (skip untouched optional sections)
        selectedSections.forEach((sectionKey) => {
          const errors = validateSection(sectionKey, true);
          if (errors.length > 0) {
            validationErrors.push(...errors);
          }
        });

        if (validationErrors.length > 0) {
          toast.error(validationErrors.join('\n\n'));
          setIsSubmitting(false);
          return;
        }

        // Build payload with section data
        const payload: UpdateServicePayload = {
          date: date.toISOString(),
          type: currentServiceType,
          status: ServiceStatus.COMPLETED,
          performedBy: performedBy || undefined,
        };

        // Add section data from completedSectionData
        selectedSections.forEach((sectionKey) => {
          const payloadKey = SECTION_TO_PAYLOAD_KEY[sectionKey];
          const sectionData = completedSectionData[sectionKey];
          if (payloadKey && sectionData) {
            (payload as any)[payloadKey] = sectionData;
          }
        });

        const response = await updateService(serviceId, payload, machineId);

        if (response.errors) {
          setError(response.errors.join(', '));
          setIsSubmitting(false);
          return;
        }

        toast.success(
          isInspection ? 'Inspeção concluída com sucesso' : 'Manutenção concluída com sucesso',
        );
      } else {
        // Creating a new service - collect section data
        const validationErrors: string[] = [];

        // Validate all selected sections (skip untouched optional sections)
        selectedSections.forEach((sectionKey) => {
          const errors = validateSection(sectionKey, true);
          if (errors.length > 0) {
            validationErrors.push(...errors);
          }
        });

        if (validationErrors.length > 0) {
          toast.error(validationErrors.join('\n\n'));
          setIsSubmitting(false);
          return;
        }

        // Build payload with section data
        const payload: CreateServicePayload = {
          machineId,
          date: date.toISOString(),
          type: currentServiceType,
          status: ServiceStatus.COMPLETED,
          performedBy: performedBy || undefined,
        };

        // Add section data from completedSectionData
        selectedSections.forEach((sectionKey) => {
          const payloadKey = SECTION_TO_PAYLOAD_KEY[sectionKey];
          const sectionData = completedSectionData[sectionKey];
          if (payloadKey && sectionData) {
            (payload as any)[payloadKey] = sectionData;
          }
        });

        const response = await createService(payload);

        if (response.errors) {
          setError(response.errors.join(', '));
          setIsSubmitting(false);
          return;
        }

        toast.success(
          currentServiceType === ServiceType.INSPECTION
            ? 'Inspeção criada com sucesso'
            : 'Manutenção criada com sucesso',
        );
      }

      // Reset and close
      setDate(getTomorrowDate());
      setSelectedServiceType(ServiceType.MAINTENANCE);
      setPerformedBy('');
      setIsSubmitting(false);
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      console.error('Error with service:', err);
      setError('An unexpected error occurred');
      setIsSubmitting(false);
    }
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

  // Helper function to display value or "-" for empty
  const displayValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value);
  };

  // Helper function to extract bearing measurement rows
  const extractBearingRows = (data: any) => {
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
          field: formatFieldName(baseField),
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

        {currentStep === 'selection' ? (
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
            {/* Stepper */}
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

              {/* Display selected sections summary */}
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
            {/* Stepper */}
            <div className="px-4 pb-2">
              <Stepper steps={getStepperSteps()} onStepClick={handleStepClick} />
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2">
              {/* Render all selected sections but only show the current one */}
              {(() => {
                const sectionsArray = getSelectedSectionsArray();
                const currentSectionKey = sectionsArray[currentSectionIndex];

                return (
                  <>
                    {sectionsArray.map((sectionKey) => {
                      const sectionConfig = SECTION_REGISTRY[sectionKey];
                      if (!sectionConfig) return null;

                      const isCurrentSection = sectionKey === currentSectionKey;

                      return (
                        <div
                          key={sectionKey}
                          className="space-y-4"
                          style={{ display: isCurrentSection ? 'block' : 'none' }}
                        >
                          <Typography variant="h3" className="text-lg font-semibold">
                            {t(`sectionNames.${sectionConfig.metadata.i18nKey}`)}
                          </Typography>

                          <div className="border rounded-lg">
                            {(() => {
                              const SectionComponent = sectionConfig.component;
                              return (
                                <SectionComponent
                                  ref={(ref: SectionComponentRef | null) => {
                                    if (ref) {
                                      sectionRefs.current.set(sectionKey, ref);
                                    }
                                  }}
                                  onSectionTouched={() => handleSectionTouched(sectionKey)}
                                  serviceType={currentServiceType}
                                  isOpen={true}
                                  onOpenChange={() => {}}
                                  initialData={completedSectionData[sectionKey]}
                                />
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })}
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
            {/* Stepper */}
            <div className="px-4 pb-2">
              <Stepper steps={getStepperSteps()} onStepClick={handleStepClick} />
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <Typography variant="h3" className="text-lg font-semibold mb-4">
                {isInspection
                  ? tServices('modal.inspectionSummary')
                  : tServices('modal.maintenanceSummary')}
              </Typography>

              {/* Service Details Summary */}
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

              {/* Sections Summary */}
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

              {/* Detailed Data Review */}
              <div className="space-y-3">
                <Typography variant="h4" className="font-semibold">
                  Dados Preenchidos
                </Typography>

                {/* Loop through ALL selected sections, not just completed */}
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
                    const hasAfterData =
                      (data?.outerAfter && hasActualData(data.outerAfter)) ||
                      (data?.innerAfter && hasActualData(data.innerAfter));

                    const outerBeforeRows = extractBearingRows(data?.outerBefore);
                    const innerBeforeRows = extractBearingRows(data?.innerBefore);
                    const outerAfterRows = extractBearingRows(data?.outerAfter);
                    const innerAfterRows = extractBearingRows(data?.innerAfter);

                    return (
                      <Collapsible key={sectionKey} defaultOpen={isCompleted}>
                        <div className="border rounded-lg">
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors">
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
                            <ChevronUp className="w-4 h-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-3 pt-0 text-xs">
                            {/* Before Measurements (only if data exists) */}
                            {hasBeforeData && (
                              <div className="border-t pt-2 mb-3">
                                <div className="font-semibold text-muted-foreground mb-2 text-sm">
                                  {tServices('modal.sections.beforeMaintenance')}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  {/* Outer Table */}
                                  <div className="border rounded-md overflow-hidden">
                                    <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                      Outer
                                    </div>
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="bg-muted/50">
                                          <TableHead className="h-8 text-[10px] font-semibold border-r">
                                            Field
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                            LH
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                            RH
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold">
                                            Diff
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

                                  {/* Inner Table */}
                                  <div className="border rounded-md overflow-hidden">
                                    <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                      Inner
                                    </div>
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="bg-muted/50">
                                          <TableHead className="h-8 text-[10px] font-semibold border-r">
                                            Field
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                            LH
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                            RH
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold">
                                            Diff
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

                            {/* After Measurements */}
                            {hasAfterData && (
                              <div className="border-t pt-2">
                                {hasBeforeData && (
                                  <div className="font-semibold text-muted-foreground mb-2 text-sm">
                                    {tServices('modal.sections.afterMaintenance')}
                                  </div>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                  {/* Outer Table */}
                                  <div className="border rounded-md overflow-hidden">
                                    <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                      Outer
                                    </div>
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="bg-muted/50">
                                          <TableHead className="h-8 text-[10px] font-semibold border-r">
                                            Field
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                            LH
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                            RH
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold">
                                            Diff
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

                                  {/* Inner Table */}
                                  <div className="border rounded-md overflow-hidden">
                                    <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                      Inner
                                    </div>
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="bg-muted/50">
                                          <TableHead className="h-8 text-[10px] font-semibold border-r">
                                            Field
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                            LH
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                            RH
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold">
                                            Diff
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

                            {/* Additional Fields */}
                            {(hasBeforeData || hasAfterData) && (
                              <div className="border-t pt-2 mt-3">
                                <div className="font-semibold text-muted-foreground mb-2 text-sm">
                                  Additional Information
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  {/* Outer Fields */}
                                  <div className="border rounded-md overflow-hidden">
                                    <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                      Outer
                                    </div>
                                    <div className="p-2 space-y-1.5 text-[11px]">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Combined With:
                                        </span>
                                        <span className="font-medium">
                                          {displayValue(
                                            data?.outerAfter?.combinedWith ||
                                              data?.outerBefore?.combinedWith,
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Mating Part:</span>
                                        <span className="font-medium">
                                          {displayValue(
                                            data?.outerAfter?.matingPart ||
                                              data?.outerBefore?.matingPart,
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Has Been Adjusted:
                                        </span>
                                        <span className="font-medium">
                                          {displayValue(
                                            data?.outerAfter?.hasBeenAdjusted ||
                                              data?.outerBefore?.hasBeenAdjusted,
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Inner Fields */}
                                  <div className="border rounded-md overflow-hidden">
                                    <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                      Inner
                                    </div>
                                    <div className="p-2 space-y-1.5 text-[11px]">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Combined With:
                                        </span>
                                        <span className="font-medium">
                                          {displayValue(
                                            data?.innerAfter?.combinedWith ||
                                              data?.innerBefore?.combinedWith,
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Mating Part:</span>
                                        <span className="font-medium">
                                          {displayValue(
                                            data?.innerAfter?.matingPart ||
                                              data?.innerBefore?.matingPart,
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Has Been Adjusted:
                                        </span>
                                        <span className="font-medium">
                                          {displayValue(
                                            data?.innerAfter?.hasBeenAdjusted ||
                                              data?.innerBefore?.hasBeenAdjusted,
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Shutdown Adjustment Mechanism */}
                                <div className="mt-3">
                                  <div className="font-semibold text-muted-foreground mb-2 text-xs">
                                    Shutdown Adjustment Mechanism
                                  </div>
                                  <div className="border rounded-md overflow-hidden">
                                    <div className="p-2 space-y-1.5 text-[11px]">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Slide Motor/Mounts:
                                        </span>
                                        <span className="font-medium">
                                          {displayValue(
                                            data?.outerAfter?.slideMotorMounts ||
                                              data?.outerBefore?.slideMotorMounts,
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Power Cord/Hoses:
                                        </span>
                                        <span className="font-medium">
                                          {displayValue(
                                            data?.outerAfter?.powerCordHoses ||
                                              data?.outerBefore?.powerCordHoses,
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Chains & Gears/Sprockets:
                                        </span>
                                        <span className="font-medium">
                                          {displayValue(
                                            data?.outerAfter?.chainsGearsSprockets ||
                                              data?.outerBefore?.chainsGearsSprockets,
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Locking Clamps:
                                        </span>
                                        <span className="font-medium">
                                          {displayValue(
                                            data?.outerAfter?.lockingClamps ||
                                              data?.outerBefore?.lockingClamps,
                                          )}
                                        </span>
                                      </div>
                                      {(data?.outerAfter?.notes || data?.outerBefore?.notes) && (
                                        <div className="flex flex-col gap-1 pt-1 border-t">
                                          <span className="text-muted-foreground">Notes:</span>
                                          <span className="font-medium">
                                            {displayValue(
                                              data?.outerAfter?.notes || data?.outerBefore?.notes,
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
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors">
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
                            <ChevronUp className="w-4 h-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-3 pt-0 text-xs">
                            {/* Before Measurements (if exists) */}
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
                                          Field
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                          Outer
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] text-center font-semibold">
                                          Inner
                                        </TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {Object.keys(
                                        (data as any).outerBefore ||
                                          (data as any).innerBefore ||
                                          {},
                                      ).map((key) => (
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

                            {/* Data Measurements (if exists) */}
                            {((data as any).outerData || (data as any).innerData) && (
                              <div className="border-t pt-2 mb-3">
                                <div className="font-medium text-muted-foreground mb-2 text-[11px]">
                                  Data Measurements
                                </div>
                                <div className="border rounded-md overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-muted/50">
                                        <TableHead className="h-8 text-[10px] font-semibold border-r">
                                          Field
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                          Outer
                                        </TableHead>
                                        <TableHead className="h-8 text-[10px] text-center font-semibold">
                                          Inner
                                        </TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {Object.keys(
                                        (data as any).outerData || (data as any).innerData || {},
                                      ).map((key) => (
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

                            {/* Section-level fields table */}
                            {Object.entries(data).filter(
                              ([_, value]) => typeof value !== 'object' || value === null,
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
                                          ([_, value]) =>
                                            typeof value !== 'object' || value === null,
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
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    );
                  }

                  // Render Gibs Section
                  if (sectionKey === 'GIBS') {
                    const data = completedSectionData[sectionKey];

                    // Check if we have before data
                    const hasBeforeData =
                      (data?.outerBefore && hasActualData(data.outerBefore)) ||
                      (data?.innerBefore && hasActualData(data.innerBefore));
                    const hasAfterData =
                      (data?.outerAfter && hasActualData(data.outerAfter)) ||
                      (data?.innerAfter && hasActualData(data.innerAfter));

                    const outerBeforeRows = extractBearingRows(data?.outerBefore);
                    const innerBeforeRows = extractBearingRows(data?.innerBefore);
                    const outerAfterRows = extractBearingRows(data?.outerAfter);
                    const innerAfterRows = extractBearingRows(data?.innerAfter);

                    return (
                      <Collapsible key={sectionKey} defaultOpen={isCompleted}>
                        <div className="border rounded-lg">
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors">
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
                            <ChevronUp className="w-4 h-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-3 pt-0 text-xs">
                            {/* Before Measurements (only if data exists) */}
                            {hasBeforeData && (
                              <div className="border-t pt-2 mb-3">
                                <div className="font-semibold text-muted-foreground mb-2 text-sm">
                                  {tServices('modal.sections.beforeMaintenance')}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  {/* Outer Table */}
                                  <div className="border rounded-md overflow-hidden">
                                    <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                      Outer
                                    </div>
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="bg-muted/50">
                                          <TableHead className="h-8 text-[10px] font-semibold border-r">
                                            Field
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                            LH
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                            RH
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold">
                                            Diff
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

                                  {/* Inner Table */}
                                  <div className="border rounded-md overflow-hidden">
                                    <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                      Inner
                                    </div>
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="bg-muted/50">
                                          <TableHead className="h-8 text-[10px] font-semibold border-r">
                                            Field
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                            LH
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                            RH
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold">
                                            Diff
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

                            {/* After Measurements */}
                            {hasAfterData && (
                              <div className="border-t pt-2">
                                {hasBeforeData && (
                                  <div className="font-semibold text-muted-foreground mb-2 text-sm">
                                    {tServices('modal.sections.afterMaintenance')}
                                  </div>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                  {/* Outer Table */}
                                  <div className="border rounded-md overflow-hidden">
                                    <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                      Outer
                                    </div>
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="bg-muted/50">
                                          <TableHead className="h-8 text-[10px] font-semibold border-r">
                                            Field
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                            LH
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                            RH
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold">
                                            Diff
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

                                  {/* Inner Table */}
                                  <div className="border rounded-md overflow-hidden">
                                    <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                      Inner
                                    </div>
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="bg-muted/50">
                                          <TableHead className="h-8 text-[10px] font-semibold border-r">
                                            Field
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                            LH
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                            RH
                                          </TableHead>
                                          <TableHead className="h-8 text-[10px] text-center font-semibold">
                                            Diff
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
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors">
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
                            <ChevronUp className="w-4 h-4 transition-transform duration-200 data-[state=open]:rotate-180" />
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

                  // Render Clutch Section
                  if (sectionKey === 'CLUTCH') {
                    const data = completedSectionData[sectionKey] || {};

                    return (
                      <Collapsible key={sectionKey} defaultOpen={isCompleted}>
                        <div className="border rounded-lg">
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors">
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
                            <ChevronUp className="w-4 h-4 transition-transform duration-200 data-[state=open]:rotate-180" />
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

                  // Render Counterbalance Cylinder Section
                  if (sectionKey === 'COUNTERBALANCE_CYLINDER_AIRBAG') {
                    const data = completedSectionData[sectionKey] || {};

                    return (
                      <Collapsible key={sectionKey} defaultOpen={isCompleted}>
                        <div className="border rounded-lg">
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors">
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
                            <ChevronUp className="w-4 h-4 transition-transform duration-200 data-[state=open]:rotate-180" />
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
              <Button type="submit" disabled={isSubmitting}>
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
