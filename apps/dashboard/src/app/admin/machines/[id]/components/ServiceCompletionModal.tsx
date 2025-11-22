'use client';

import { useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Typography } from '@/components/ui/typography';
import type { StepperStep } from '@/components/ui/stepper';
import { ServiceType, ServiceStatus, type CreateServicePayload } from '@/data/types/services.types';
import {
  createService,
  updateService,
  updateServiceSection,
  completeService,
} from '@/data/services/services.api';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { toast } from 'sonner';
import { SECTION_REGISTRY } from './sections/registry';
import type { ServiceCompletionModalProps } from './types/service-completion.types';
import { useServiceForm } from './hooks/useServiceForm';
import { useServiceSteps } from './hooks/useServiceSteps';
import { useSectionSelection } from './hooks/useSectionSelection';
import { useSectionData } from './hooks/useSectionData';
import { useSectionRefs } from './hooks/useSectionRefs';
import { useServiceDataLoader } from './hooks/useServiceDataLoader';
import { SelectionStep } from './steps/SelectionStep';
import { DetailsStep } from './steps/DetailsStep';
import { SectionsStep } from './steps/SectionsStep';
import { SummaryStep } from './steps/SummaryStep';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(machineSectionsProp)],
  );

  const isCompletingService = !!serviceId;
  const isInspection = serviceType === ServiceType.INSPECTION;
  const shouldSkipSelection = isInspection;

  // Initialize all hooks
  const {
    date,
    setDate,
    performedBy,
    setPerformedBy,
    selectedServiceType,
    setSelectedServiceType,
    currentServiceType,
    isSubmitting,
    setIsSubmitting,
    error,
    setError,
    // Inspection observation fields
    isPressLevel,
    setIsPressLevel,
    driveBeltCondition,
    setDriveBeltCondition,
    areAllProtectiveCovers,
    setAreAllProtectiveCovers,
    protectiveCoversExplanation,
    setProtectiveCoversExplanation,
    areCracksVisible,
    setAreCracksVisible,
    cracksLocation,
    setCracksLocation,
    isMainMotorSecure,
    setIsMainMotorSecure,
    isMotorPlateSecure,
    setIsMotorPlateSecure,
    whyNotCovered,
    setWhyNotCovered,
    reset: resetForm,
  } = useServiceForm(serviceType, initialDate, initialPerformedBy);

  const {
    currentStep,
    setCurrentStep,
    currentSectionIndex,
    setCurrentSectionIndex,
    reset: resetSteps,
  } = useServiceSteps(shouldSkipSelection);

  const {
    selectedSections,
    setSelectedSections,
    toggleSection,
    getSelectedSectionsArray,
    reset: resetSelection,
  } = useSectionSelection(isInspection, machineSections);

  const {
    completedSections,
    setCompletedSections,
    completedSectionData,
    setCompletedSectionData,
    createdServiceId,
    setCreatedServiceId,
    markSectionComplete,
    markSectionIncomplete,
    reset: resetSectionData,
  } = useSectionData();

  const { sectionRefs: _sectionRefs, registerRef, getRef, reset: resetRefs } = useSectionRefs();

  const currentServiceId = serviceId || createdServiceId;

  const {
    isLoadingServiceData,
    hasLoadedInitialData,
    reset: resetLoader,
  } = useServiceDataLoader(
    open,
    serviceId,
    createdServiceId,
    isInspection,
    machineSections,
    shouldSkipSelection,
    setCompletedSections,
    setCompletedSectionData,
    setSelectedSections,
    setCurrentStep,
    setCurrentSectionIndex,
    // Inspection observation field setters
    setDate,
    setPerformedBy,
    setIsPressLevel,
    setDriveBeltCondition,
    setAreAllProtectiveCovers,
    setProtectiveCoversExplanation,
    setAreCracksVisible,
    setCracksLocation,
    setIsMainMotorSecure,
    setIsMotorPlateSecure,
    setWhyNotCovered,
  );

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      resetSteps(shouldSkipSelection);
      resetSelection(isInspection, machineSections);
      setDate(new Date(Date.now() + 86400000)); // tomorrow
      resetForm();
      resetSectionData();
      resetLoader();
      resetRefs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, shouldSkipSelection, isInspection, machineSections]);

  // Auto-select all sections when service type changes to INSPECTION
  useEffect(() => {
    if (!serviceId && open && currentServiceType === ServiceType.INSPECTION) {
      setSelectedSections(new Set(machineSections));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentServiceType, open, serviceId, machineSections]);

  // Navigation handlers
  const handleProceedToDetails = () => {
    setCurrentStep('details');
  };

  const handleNext = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (currentStep === 'details') {
      // Create or update service
      if (!currentServiceId) {
        // Create new service
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
            // Inspection observation fields
            // TODO: Fix state types to use proper enum types instead of string
            isPressLevel,
            driveBeltCondition: (driveBeltCondition || undefined) as any,
            areAllProtectiveCovers: (areAllProtectiveCovers || undefined) as any,
            protectiveCoversExplanation: protectiveCoversExplanation || undefined,
            areCracksVisible,
            cracksLocation: cracksLocation || undefined,
            isMainMotorSecure,
            isMotorPlateSecure,
            whyNotCovered: (whyNotCovered || undefined) as any,
          };

          const response = await createService(payload);

          if (response.errors || !response.data) {
            toast.error(
              `Failed to create service:\n${response.errors?.join('\n') || 'Unknown error'}`,
            );
            setIsSubmitting(false);
            return;
          }

          setCreatedServiceId(response.data.id);
          toast.success('Service created. Now fill in the section forms.');
          setIsSubmitting(false);
        } catch (error) {
          console.error('Error creating service:', error);
          toast.error('An unexpected error occurred while creating the service');
          setIsSubmitting(false);
          return;
        }
      } else {
        // Update existing service with inspection observation fields
        setIsSubmitting(true);
        try {
          const updatePayload = {
            date: date.toISOString(),
            performedBy: performedBy || undefined,
            currentStep: 'sections',
            selectedSections: Array.from(selectedSections),
            // Inspection observation fields
            // TODO: Fix state types to use proper enum types instead of string
            isPressLevel,
            driveBeltCondition: (driveBeltCondition || undefined) as any,
            areAllProtectiveCovers: (areAllProtectiveCovers || undefined) as any,
            protectiveCoversExplanation: protectiveCoversExplanation || undefined,
            areCracksVisible,
            cracksLocation: cracksLocation || undefined,
            isMainMotorSecure,
            isMotorPlateSecure,
            whyNotCovered: (whyNotCovered || undefined) as any,
          };

          const response = await updateService(currentServiceId, updatePayload);

          if (response.errors) {
            toast.error(
              `Failed to update service:\n${response.errors?.join('\n') || 'Unknown error'}`,
            );
            setIsSubmitting(false);
            return;
          }

          toast.success('Service details updated successfully.');
          setIsSubmitting(false);
        } catch (error) {
          console.error('Error updating service:', error);
          toast.error('An unexpected error occurred while updating the service');
          setIsSubmitting(false);
          return;
        }
      }

      setCurrentStep('sections');
      setCurrentSectionIndex(0);
    } else if (currentStep === 'sections') {
      const sectionsArray = getSelectedSectionsArray();
      const currentSectionKey = sectionsArray[currentSectionIndex];

      const ref = getRef(currentSectionKey);
      if (!ref) {
        toast.error('Section reference not found');
        return;
      }

      const result = ref.validateAndGetData(currentServiceType);
      if (!result.isValid || !result.data) {
        toast.error(result.errors.join('\n\n') || 'Please fill in all required fields');
        return;
      }

      setIsSubmitting(true);

      try {
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

        toast.success('Section saved successfully');
        markSectionComplete(currentSectionKey, result.data);

        const nextSectionIndex = currentSectionIndex + 1;
        const isLastSection = nextSectionIndex >= sectionsArray.length;
        const nextStep = isLastSection ? 'summary' : 'sections';
        const nextSectionKey = isLastSection ? null : sectionsArray[nextSectionIndex];

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

        if (!isLastSection) {
          setCurrentSectionIndex(nextSectionIndex);
        } else {
          setCurrentStep('summary');
        }
      } catch (error) {
        console.error('Error saving section:', error);
        toast.error('An unexpected error occurred while saving the section');
        setIsSubmitting(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep === 'summary') {
      const sectionsArray = getSelectedSectionsArray();
      setCurrentStep('sections');
      setCurrentSectionIndex(sectionsArray.length - 1);
    } else if (currentStep === 'sections' && currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    } else if (currentStep === 'sections' && currentSectionIndex === 0) {
      setCurrentStep('details');
    }
  };

  const handleSectionTouched = (sectionKey: string) => {
    if (completedSections.has(sectionKey)) {
      markSectionIncomplete(sectionKey);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    const sectionsArray = getSelectedSectionsArray();
    if (stepIndex === 0) {
      setCurrentStep('details');
    } else if (stepIndex === sectionsArray.length + 1) {
      if (completedSections.size === sectionsArray.length) {
        setCurrentStep('summary');
      }
    } else {
      const sectionIndex = stepIndex - 1;
      if (sectionIndex < sectionsArray.length) {
        setCurrentStep('sections');
        setCurrentSectionIndex(sectionIndex);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);

    if (currentStep !== 'summary') {
      console.warn('Attempted to submit from non-summary step:', currentStep);
      return;
    }

    setIsSubmitting(true);

    try {
      if (!currentServiceId) {
        toast.error('Service ID not found');
        setIsSubmitting(false);
        return;
      }

      const response = await completeService(currentServiceId, performedBy || '', machineId);

      if (response.errors) {
        setError(response.errors.join(', '));
        setIsSubmitting(false);
        return;
      }

      toast.success(
        isInspection ? 'Inspeção concluída com sucesso' : 'Manutenção concluída com sucesso',
      );

      resetForm();
      resetSectionData();
      setIsSubmitting(false);
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      console.error('Error completing service:', err);
      setError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  // Generate stepper steps
  const getStepperSteps = (): StepperStep[] => {
    const steps: StepperStep[] = [];
    const sectionsArray = getSelectedSectionsArray();

    const detailsCompleted = currentStep === 'sections' || currentStep === 'summary';
    steps.push({
      key: 'details',
      label: tServices('modal.stepper.details'),
      status: currentStep === 'details' ? 'current' : detailsCompleted ? 'completed' : 'pending',
      isClickable: true,
    });

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

    steps.push({
      key: 'summary',
      label: tServices('modal.stepper.summary'),
      status: currentStep === 'summary' ? 'current' : 'pending',
      isClickable: completedSections.size === sectionsArray.length,
    });

    return steps;
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
          <SelectionStep
            machineSections={machineSections}
            selectedSections={selectedSections}
            toggleSection={toggleSection}
            onCancel={() => onOpenChange(false)}
            onContinue={handleProceedToDetails}
            translations={{
              getSectionName: (i18nKey) => t(`sectionNames.${i18nKey}`),
              areasSelected: (count) =>
                `${count} ${count === 1 ? 'área selecionada' : 'áreas selecionadas'}`,
              selectAreasAbove: tServices('modal.selectAreasAbove'),
              cancel: 'Cancelar',
              continue: 'Salvar e Continuar',
            }}
          />
        ) : currentStep === 'details' ? (
          <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
            <DetailsStep
              date={date}
              performedBy={performedBy}
              setPerformedBy={setPerformedBy}
              selectedServiceType={selectedServiceType}
              setSelectedServiceType={setSelectedServiceType}
              selectedSections={selectedSections}
              error={error}
              isCompletingService={isCompletingService}
              shouldSkipSelection={shouldSkipSelection}
              stepperSteps={getStepperSteps()}
              onStepClick={handleStepClick}
              onBack={() => setCurrentStep('selection')}
              onNext={handleNext}
              // Inspection observation fields
              isPressLevel={isPressLevel}
              setIsPressLevel={setIsPressLevel}
              driveBeltCondition={driveBeltCondition}
              setDriveBeltCondition={setDriveBeltCondition}
              areAllProtectiveCovers={areAllProtectiveCovers}
              setAreAllProtectiveCovers={setAreAllProtectiveCovers}
              protectiveCoversExplanation={protectiveCoversExplanation}
              setProtectiveCoversExplanation={setProtectiveCoversExplanation}
              areCracksVisible={areCracksVisible}
              setAreCracksVisible={setAreCracksVisible}
              cracksLocation={cracksLocation}
              setCracksLocation={setCracksLocation}
              isMainMotorSecure={isMainMotorSecure}
              setIsMainMotorSecure={setIsMainMotorSecure}
              isMotorPlateSecure={isMotorPlateSecure}
              setIsMotorPlateSecure={setIsMotorPlateSecure}
              whyNotCovered={whyNotCovered}
              setWhyNotCovered={setWhyNotCovered}
              translations={{
                dateLabel: isCompletingService
                  ? tServices('modal.realizationDate')
                  : tServices('serviceDate'),
                performedByLabel: tServices('modal.performedBy'),
                performedByPlaceholder: tServices('modal.technicianName'),
                serviceTypeLabel: tServices('serviceType'),
                inspectionType: tServices('types.inspection'),
                maintenanceType: tServices('types.maintenance'),
                selectedAreasTitle: isInspection
                  ? tServices('modal.inspectionAreas')
                  : tServices('modal.selectedAreas'),
                getSectionName: (i18nKey) => t(`sectionNames.${i18nKey}`),
                back: 'Voltar',
                continue: 'Salvar e Continuar',
                // Machine information
                machineInformationTitle: tServices('modal.machineInformation.title'),
                manufacturer: tServices('modal.machineInformation.manufacturer'),
                model: tServices('modal.machineInformation.model'),
                sizeTonnage: tServices('modal.machineInformation.sizeTonnage'),
                serialNumber: tServices('modal.machineInformation.serialNumber'),
                stroke: tServices('modal.machineInformation.stroke'),
                foundationType: tServices('modal.machineInformation.foundationType'),
                frameType: tServices('modal.machineInformation.frameType'),
                clutchType: tServices('modal.machineInformation.clutchType'),
                pneumaticSystem: tServices('modal.machineInformation.pneumaticSystem'),
                pressMounting: tServices('modal.machineInformation.pressMounting'),
                features: tServices('modal.machineInformation.features'),
                // Inspection observations
                inspectionObservationsTitle: tServices('modal.inspectionObservations.title'),
                isPressLevel: tServices('modal.inspectionObservations.isPressLevel'),
                driveBeltCondition: tServices('modal.inspectionObservations.driveBeltCondition'),
                areAllProtectiveCovers: tServices(
                  'modal.inspectionObservations.areAllProtectiveCovers',
                ),
                protectiveCoversExplanation: tServices(
                  'modal.inspectionObservations.protectiveCoversExplanation',
                ),
                areCracksVisible: tServices('modal.inspectionObservations.areCracksVisible'),
                cracksLocation: tServices('modal.inspectionObservations.cracksLocation'),
                isMainMotorSecure: tServices('modal.inspectionObservations.isMainMotorSecure'),
                isMotorPlateSecure: tServices('modal.inspectionObservations.isMotorPlateSecure'),
                whyNotCovered: tServices('modal.inspectionObservations.whyNotCovered'),
              }}
            />
          </form>
        ) : currentStep === 'sections' ? (
          <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
            <SectionsStep
              selectedSectionsArray={getSelectedSectionsArray()}
              currentSectionIndex={currentSectionIndex}
              completedSectionData={completedSectionData}
              currentServiceType={currentServiceType}
              error={error}
              stepperSteps={getStepperSteps()}
              onStepClick={handleStepClick}
              onSectionTouched={handleSectionTouched}
              registerSectionRef={registerRef}
              onPrevious={handlePrevious}
              onNext={handleNext}
              translations={{
                getSectionName: (i18nKey) => t(`sectionNames.${i18nKey}`),
                previous: 'Anterior',
                saveAndContinue: 'Salvar e Continuar',
              }}
            />
          </form>
        ) : (
          <SummaryStep
            date={date}
            performedBy={performedBy}
            completedSections={completedSections}
            completedSectionData={completedSectionData}
            isSubmitting={isSubmitting}
            error={error}
            stepperSteps={getStepperSteps()}
            onStepClick={handleStepClick}
            onSubmit={handleSubmit}
            // Inspection observation fields
            isPressLevel={isPressLevel}
            driveBeltCondition={driveBeltCondition}
            areAllProtectiveCovers={areAllProtectiveCovers}
            protectiveCoversExplanation={protectiveCoversExplanation}
            areCracksVisible={areCracksVisible}
            cracksLocation={cracksLocation}
            isMainMotorSecure={isMainMotorSecure}
            isMotorPlateSecure={isMotorPlateSecure}
            whyNotCovered={whyNotCovered}
            translations={{
              title: isInspection
                ? tServices('modal.inspectionSummary')
                : tServices('modal.maintenanceSummary'),
              serviceDetailsTitle: 'Detalhes do Serviço',
              realizationDate: tServices('modal.realizationDate'),
              performedBy: tServices('modal.performedBy'),
              completedAreasTitle: 'Áreas Preenchidas',
              detailedDataTitle: 'Dados Preenchidos',
              getSectionName: (i18nKey) => t(`sectionNames.${i18nKey}`),
              completeService: isInspection ? 'Concluir Inspeção' : 'Concluir Manutenção',
              completing: 'Concluindo...',
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
