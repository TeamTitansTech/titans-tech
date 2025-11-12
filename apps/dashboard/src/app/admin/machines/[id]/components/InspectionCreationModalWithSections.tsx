'use client';

import { useState, useEffect, useRef } from 'react';
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
import { ChevronLeft, CalendarIcon, Check, Save } from 'lucide-react';
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
import {
  BearingClearanceSection,
  type BearingClearanceSectionRef,
} from './sections/BearingClearanceSection';
import { SlideSection, type SlideSectionRef } from './sections/SlideSection';
import { GibsSection, type GibsSectionRef } from './sections/GibsSection';
import {
  LubricationHydraulicsSection,
  type LubricationHydraulicsSectionRef,
} from './sections/LubricationHydraulicsSection';
import { ClutchSection, type ClutchSectionRef } from './sections/ClutchSection';
import {
  CounterbalanceCylinderSection,
  type CounterbalanceCylinderSectionRef,
} from './sections/CounterbalanceCylinderSection';

interface InspectionCreationModalWithSectionsProps {
  machineId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  machineSections?: string[];
  serviceId?: string; // If provided, we're completing an existing service
  initialDate?: string; // Initial date from existing service
  initialPerformedBy?: string; // Initial performedBy from existing service
}

const SECTION_DETAILS = {
  BEARING_CLEARANCE: {
    key: 'BEARING_CLEARANCE',
    image: '/assets/sections/bearing-clearance.svg',
    i18nKey: 'bearingClearance',
  },
  SLIDE: {
    key: 'SLIDE',
    image: '/assets/sections/slide.svg',
    i18nKey: 'slide',
  },
  GIBS: {
    key: 'GIBS',
    image: '/assets/sections/gibs.svg',
    i18nKey: 'gibs',
  },
  LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER: {
    key: 'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER',
    image: '/assets/sections/lubrication-hydraulics.svg',
    i18nKey: 'lubricationHydraulics',
  },
  CLUTCH: {
    key: 'CLUTCH',
    image: '/assets/sections/clutch.svg',
    i18nKey: 'clutch',
  },
  COUNTERBALANCE_CYLINDER_AIRBAG: {
    key: 'COUNTERBALANCE_CYLINDER_AIRBAG',
    image: '/assets/sections/counterbalance.svg',
    i18nKey: 'counterbalance',
  },
} as const;

export function InspectionCreationModalWithSections({
  machineId,
  open,
  onOpenChange,
  machineSections = Object.keys(SECTION_DETAILS),
  serviceId,
  initialDate,
  initialPerformedBy,
}: InspectionCreationModalWithSectionsProps) {
  const t = useTranslations('machines');
  const tServices = useTranslations('services');
  const router = useInternalRouter();

  const isCompletingService = !!serviceId;

  // Multi-step state
  const [currentStep, setCurrentStep] = useState<'selection' | 'details'>('selection');

  // Section selection state
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());

  // Service details
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  const getInitialDate = () => {
    if (initialDate) {
      return new Date(initialDate);
    }
    return getTomorrowDate();
  };

  const [date, setDate] = useState<Date>(getInitialDate());
  const [serviceType, setServiceType] = useState<ServiceType>(ServiceType.MAINTENANCE);
  const [performedBy, setPerformedBy] = useState(initialPerformedBy || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Section refs for data collection
  const bearingClearanceRef = useRef<BearingClearanceSectionRef>(null);
  const slideRef = useRef<SlideSectionRef>(null);
  const gibsRef = useRef<GibsSectionRef>(null);
  const lubricationRef = useRef<LubricationHydraulicsSectionRef>(null);
  const clutchRef = useRef<ClutchSectionRef>(null);
  const counterbalanceRef = useRef<CounterbalanceCylinderSectionRef>(null);

  // Collapsible section states (first selected section open by default)
  const [sectionStates, setSectionStates] = useState<Record<string, boolean>>({});

  // Track which sections have been saved successfully
  const [savedSections, setSavedSections] = useState<Set<string>>(new Set());

  // Initialize section states when sections are selected
  useEffect(() => {
    if (currentStep === 'details' && selectedSections.size > 0) {
      const states: Record<string, boolean> = {};
      const sectionsArray = Array.from(selectedSections);
      sectionsArray.forEach((section, index) => {
        states[section] = index === 0; // First section open by default
      });
      setSectionStates(states);
    }
  }, [currentStep, selectedSections]);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setCurrentStep('selection');
      setSelectedSections(new Set());
      setDate(getInitialDate());
      setServiceType(isCompletingService ? ServiceType.MAINTENANCE : ServiceType.INSPECTION);
      setPerformedBy(initialPerformedBy || '');
      setError(null);
      setSectionStates({});
      setSavedSections(new Set());
      // Reset section refs
      bearingClearanceRef.current?.reset();
      slideRef.current?.reset();
      gibsRef.current?.reset();
      lubricationRef.current?.reset();
      clutchRef.current?.reset();
      counterbalanceRef.current?.reset();
    }
  }, [open]);

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

  const handleBackToSelection = () => {
    setCurrentStep('selection');
  };

  // Handle saving individual section data
  const handleSaveSection = (sectionKey: string) => {
    const validationErrors: string[] = [];

    // Validate based on section type
    switch (sectionKey) {
      case 'BEARING_CLEARANCE':
        if (bearingClearanceRef.current) {
          const errors = bearingClearanceRef.current.validate(serviceType);
          validationErrors.push(...errors);
        }
        break;

      case 'SLIDE':
        if (slideRef.current?.isTouched()) {
          const result = slideRef.current.validateAndGetData(serviceType);
          if (!result.isValid) {
            validationErrors.push(...result.errors);
          }
        }
        break;

      case 'GIBS':
        if (gibsRef.current?.isTouched()) {
          const result = gibsRef.current.validateAndGetData(serviceType);
          if (!result.isValid) {
            validationErrors.push(...result.errors);
          }
        }
        break;

      case 'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER':
        if (lubricationRef.current?.isTouched()) {
          const result = lubricationRef.current.validateAndGetData(serviceType);
          if (!result.isValid) {
            validationErrors.push(...result.errors);
          }
        }
        break;

      case 'CLUTCH':
        if (clutchRef.current?.isTouched()) {
          const result = clutchRef.current.validateAndGetData(serviceType);
          if (!result.isValid) {
            validationErrors.push(...result.errors);
          }
        }
        break;

      case 'COUNTERBALANCE_CYLINDER_AIRBAG':
        if (counterbalanceRef.current?.isTouched()) {
          const result = counterbalanceRef.current.validateAndGetData(serviceType);
          if (!result.isValid) {
            validationErrors.push(...result.errors);
          }
        }
        break;
    }

    if (validationErrors.length > 0) {
      toast.error(validationErrors.join('\n\n'));
      return;
    }

    // Mark section as saved
    setSavedSections((prev) => new Set(prev).add(sectionKey));
    toast.success('Dados salvos com sucesso');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isCompletingService && serviceId) {
        // Completing an existing maintenance service - validate and collect section data
        const validationErrors: string[] = [];

        // Bearing Clearance validation
        if (selectedSections.has('BEARING_CLEARANCE') && bearingClearanceRef.current) {
          const bearingErrors = bearingClearanceRef.current.validate(serviceType);
          validationErrors.push(...bearingErrors);
        }

        // Slide validation
        if (selectedSections.has('SLIDE') && slideRef.current?.isTouched()) {
          const slideResult = slideRef.current.validateAndGetData(serviceType);
          if (!slideResult.isValid) {
            validationErrors.push(...slideResult.errors);
          }
        }

        // Gibs validation
        if (selectedSections.has('GIBS') && gibsRef.current?.isTouched()) {
          const gibsResult = gibsRef.current.validateAndGetData(serviceType);
          if (!gibsResult.isValid) {
            validationErrors.push(...gibsResult.errors);
          }
        }

        // Lubrication Hydraulics validation
        if (
          selectedSections.has('LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER') &&
          lubricationRef.current?.isTouched()
        ) {
          const lubricationResult = lubricationRef.current.validateAndGetData(serviceType);
          if (!lubricationResult.isValid) {
            validationErrors.push(...lubricationResult.errors);
          }
        }

        // Clutch validation
        if (selectedSections.has('CLUTCH') && clutchRef.current?.isTouched()) {
          const clutchResult = clutchRef.current.validateAndGetData(serviceType);
          if (!clutchResult.isValid) {
            validationErrors.push(...clutchResult.errors);
          }
        }

        // Counterbalance Cylinder validation
        if (
          selectedSections.has('COUNTERBALANCE_CYLINDER_AIRBAG') &&
          counterbalanceRef.current?.isTouched()
        ) {
          const counterbalanceResult = counterbalanceRef.current.validateAndGetData(serviceType);
          if (!counterbalanceResult.isValid) {
            validationErrors.push(...counterbalanceResult.errors);
          }
        }

        if (validationErrors.length > 0) {
          toast.error(validationErrors.join('\n\n'));
          setIsSubmitting(false);
          return;
        }

        // Build payload with section data
        const payload: UpdateServicePayload = {
          date: date.toISOString(),
          type: serviceType,
          status: ServiceStatus.COMPLETED,
          performedBy: performedBy || undefined,
        };

        // Add bearing clearance data if section was selected
        if (selectedSections.has('BEARING_CLEARANCE') && bearingClearanceRef.current) {
          const bearingData = bearingClearanceRef.current.getData();
          payload.bearingClearance = bearingData;
        }

        // Add slide data if section was selected
        if (selectedSections.has('SLIDE') && slideRef.current?.isTouched()) {
          const slideResult = slideRef.current.validateAndGetData(serviceType);
          if (slideResult.isValid && slideResult.data) {
            payload.slide = slideResult.data;
          }
        }

        // Add gibs data if section was selected
        if (selectedSections.has('GIBS') && gibsRef.current?.isTouched()) {
          const gibsResult = gibsRef.current.validateAndGetData(serviceType);
          if (gibsResult.isValid && gibsResult.data) {
            payload.gibs = gibsResult.data;
          }
        }

        // Add lubrication hydraulics data if section was selected
        if (
          selectedSections.has('LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER') &&
          lubricationRef.current?.isTouched()
        ) {
          const lubricationResult = lubricationRef.current.validateAndGetData(serviceType);
          if (lubricationResult.isValid && lubricationResult.data) {
            payload.lubricationHydraulics = lubricationResult.data;
          }
        }

        // Add clutch data if section was selected
        if (selectedSections.has('CLUTCH') && clutchRef.current?.isTouched()) {
          const clutchResult = clutchRef.current.validateAndGetData(serviceType);
          if (clutchResult.isValid && clutchResult.data) {
            payload.clutch = clutchResult.data;
          }
        }

        // Add counterbalance cylinder data if section was selected
        if (
          selectedSections.has('COUNTERBALANCE_CYLINDER_AIRBAG') &&
          counterbalanceRef.current?.isTouched()
        ) {
          const counterbalanceResult = counterbalanceRef.current.validateAndGetData(serviceType);
          if (counterbalanceResult.isValid && counterbalanceResult.data) {
            payload.counterbalanceCylinder = counterbalanceResult.data;
          }
        }

        const response = await updateService(serviceId, payload, machineId);

        if (response.errors) {
          setError(response.errors.join(', '));
          setIsSubmitting(false);
          return;
        }

        toast.success('Manutenção concluída com sucesso');
      } else {
        // Creating a new service
        const payload: CreateServicePayload = {
          machineId,
          date: date.toISOString(),
          type: serviceType,
          // TODO: Add selected sections to the payload when backend supports it
          // sections: Array.from(selectedSections),
        };

        const response = await createService(payload);

        if (response.errors) {
          setError(response.errors.join(', '));
          setIsSubmitting(false);
          return;
        }

        toast.success('Serviço criado com sucesso');
      }

      // Reset and close
      setDate(getTomorrowDate());
      setServiceType(ServiceType.MAINTENANCE);
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

  // Mock function to get section status - replace with actual logic
  const getSectionStatus = (sectionKey: string): SectionStatus => {
    // This should check the latest inspection data for this section
    // For now, return 'unknown' as placeholder
    return 'unknown';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[1200px] h-[700px] max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isCompletingService
              ? currentStep === 'selection'
                ? 'Concluir Manutenção'
                : 'Concluir Manutenção - Detalhes'
              : currentStep === 'selection'
                ? tServices('createNewService')
                : tServices('createNewService') + ' - ' + t('inspectionSections')}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 'selection'
              ? 'Selecione as áreas de manutenção a serem realizadas'
              : isCompletingService
                ? 'Preencha os detalhes da manutenção realizada'
                : tServices('createServiceDescription')}
          </DialogDescription>
        </DialogHeader>

        {currentStep === 'selection' ? (
          // Step 1: Section Selection
          <div className="flex-1 overflow-y-auto py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {machineSections.map((sectionKey) => {
                const section = SECTION_DETAILS[sectionKey as keyof typeof SECTION_DETAILS];
                if (!section) return null;

                return (
                  <SelectableSectionCard
                    key={section.key}
                    title={t(`sectionNames.${section.i18nKey}`)}
                    status={getSectionStatus(section.key)}
                    imageUrl={section.image}
                    subtitle="CP 2"
                    isSelected={selectedSections.has(section.key)}
                    onClick={() => toggleSection(section.key)}
                  />
                );
              })}
            </div>

            <div className="mt-6 px-1 text-sm text-muted-foreground">
              {selectedSections.size > 0
                ? `${selectedSections.size} ${selectedSections.size === 1 ? 'área selecionada' : 'áreas selecionadas'}`
                : 'Selecione as áreas de manutenção acima para começar'}
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
        ) : (
          // Step 2: Service Details (Date & Type)
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-6 py-4">
            <div className="flex items-center gap-2 mb-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBackToSelection}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar para seleção
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">
                  {isCompletingService ? 'Data da realização' : tServices('serviceDate')}
                </Label>
                <div className="flex items-center gap-2 mt-1 p-3 border rounded-md bg-muted/50">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{date ? format(date, 'PPP') : '-'}</span>
                </div>
              </div>

              {isCompletingService ? (
                <div>
                  <Label htmlFor="performedBy">Realizado por</Label>
                  <Input
                    id="performedBy"
                    type="text"
                    value={performedBy}
                    onChange={(e) => setPerformedBy(e.target.value)}
                    placeholder="Nome do técnico"
                    className="mt-1"
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="type">{tServices('serviceType')}</Label>
                  <Select
                    value={serviceType}
                    onValueChange={(value) => setServiceType(value as ServiceType)}
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
            {!isCompletingService && (
              <div className="border rounded-lg p-4">
                <Typography variant="h4" className="mb-3">
                  Áreas selecionadas
                </Typography>
                <div className="flex flex-wrap gap-2">
                  {Array.from(selectedSections).map((sectionKey) => {
                    const section = SECTION_DETAILS[sectionKey as keyof typeof SECTION_DETAILS];
                    if (!section) return null;

                    return (
                      <div
                        key={section.key}
                        className="px-3 py-1.5 bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 rounded-md text-sm"
                      >
                        {t(`sectionNames.${section.i18nKey}`)}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section Forms - Only show when completing service */}
            {isCompletingService && (
              <div className="space-y-4">
                {selectedSections.has('BEARING_CLEARANCE') && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-4 bg-muted/30 border-b">
                      <div className="flex items-center gap-3">
                        <Typography variant="h3" className="text-sm font-semibold">
                          {t('sectionNames.bearingClearance')}
                        </Typography>
                        {savedSections.has('BEARING_CLEARANCE') && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
                            <Check className="w-3.5 h-3.5 text-green-700 dark:text-green-400" />
                            <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                              Salvo
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleSaveSection('BEARING_CLEARANCE')}
                      >
                        <Save className="w-3 h-3 mr-2" />
                        Salvar Dados
                      </Button>
                    </div>
                    <BearingClearanceSection
                      ref={bearingClearanceRef}
                      isOpen={sectionStates['BEARING_CLEARANCE'] ?? false}
                      onOpenChange={(open) =>
                        setSectionStates((prev) => ({
                          ...prev,
                          BEARING_CLEARANCE: open,
                        }))
                      }
                      onSectionTouched={() => {}}
                      serviceType={serviceType}
                    />
                  </div>
                )}

                {selectedSections.has('SLIDE') && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-4 bg-muted/30 border-b">
                      <div className="flex items-center gap-3">
                        <Typography variant="h3" className="text-sm font-semibold">
                          {t('sectionNames.slide')}
                        </Typography>
                        {savedSections.has('SLIDE') && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
                            <Check className="w-3.5 h-3.5 text-green-700 dark:text-green-400" />
                            <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                              Salvo
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleSaveSection('SLIDE')}
                      >
                        <Save className="w-3 h-3 mr-2" />
                        Salvar Dados
                      </Button>
                    </div>
                    <SlideSection
                      ref={slideRef}
                      isOpen={sectionStates['SLIDE'] ?? false}
                      onOpenChange={(open) =>
                        setSectionStates((prev) => ({
                          ...prev,
                          SLIDE: open,
                        }))
                      }
                      onSectionTouched={() => {}}
                      serviceType={serviceType}
                    />
                  </div>
                )}

                {selectedSections.has('GIBS') && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-4 bg-muted/30 border-b">
                      <div className="flex items-center gap-3">
                        <Typography variant="h3" className="text-sm font-semibold">
                          {t('sectionNames.gibs')}
                        </Typography>
                        {savedSections.has('GIBS') && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
                            <Check className="w-3.5 h-3.5 text-green-700 dark:text-green-400" />
                            <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                              Salvo
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleSaveSection('GIBS')}
                      >
                        <Save className="w-3 h-3 mr-2" />
                        Salvar Dados
                      </Button>
                    </div>
                    <GibsSection
                      ref={gibsRef}
                      isOpen={sectionStates['GIBS'] ?? false}
                      onOpenChange={(open) =>
                        setSectionStates((prev) => ({
                          ...prev,
                          GIBS: open,
                        }))
                      }
                      onSectionTouched={() => {}}
                    />
                  </div>
                )}

                {selectedSections.has('LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER') && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-4 bg-muted/30 border-b">
                      <div className="flex items-center gap-3">
                        <Typography variant="h3" className="text-sm font-semibold">
                          {t('sectionNames.lubricationHydraulics')}
                        </Typography>
                        {savedSections.has(
                          'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER',
                        ) && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
                            <Check className="w-3.5 h-3.5 text-green-700 dark:text-green-400" />
                            <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                              Salvo
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleSaveSection('LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER')
                        }
                      >
                        <Save className="w-3 h-3 mr-2" />
                        Salvar Dados
                      </Button>
                    </div>
                    <LubricationHydraulicsSection
                      ref={lubricationRef}
                      isOpen={
                        sectionStates['LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER'] ??
                        false
                      }
                      onOpenChange={(open) =>
                        setSectionStates((prev) => ({
                          ...prev,
                          LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER: open,
                        }))
                      }
                      onSectionTouched={() => {}}
                    />
                  </div>
                )}

                {selectedSections.has('CLUTCH') && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-4 bg-muted/30 border-b">
                      <div className="flex items-center gap-3">
                        <Typography variant="h3" className="text-sm font-semibold">
                          {t('sectionNames.clutch')}
                        </Typography>
                        {savedSections.has('CLUTCH') && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
                            <Check className="w-3.5 h-3.5 text-green-700 dark:text-green-400" />
                            <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                              Salvo
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleSaveSection('CLUTCH')}
                      >
                        <Save className="w-3 h-3 mr-2" />
                        Salvar Dados
                      </Button>
                    </div>
                    <ClutchSection
                      ref={clutchRef}
                      isOpen={sectionStates['CLUTCH'] ?? false}
                      onOpenChange={(open) =>
                        setSectionStates((prev) => ({
                          ...prev,
                          CLUTCH: open,
                        }))
                      }
                      onSectionTouched={() => {}}
                    />
                  </div>
                )}

                {selectedSections.has('COUNTERBALANCE_CYLINDER_AIRBAG') && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-4 bg-muted/30 border-b">
                      <div className="flex items-center gap-3">
                        <Typography variant="h3" className="text-sm font-semibold">
                          {t('sectionNames.counterbalance')}
                        </Typography>
                        {savedSections.has('COUNTERBALANCE_CYLINDER_AIRBAG') && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
                            <Check className="w-3.5 h-3.5 text-green-700 dark:text-green-400" />
                            <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                              Salvo
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleSaveSection('COUNTERBALANCE_CYLINDER_AIRBAG')}
                      >
                        <Save className="w-3 h-3 mr-2" />
                        Salvar Dados
                      </Button>
                    </div>
                    <CounterbalanceCylinderSection
                      ref={counterbalanceRef}
                      isOpen={sectionStates['COUNTERBALANCE_CYLINDER_AIRBAG'] ?? false}
                      onOpenChange={(open) =>
                        setSectionStates((prev) => ({
                          ...prev,
                          COUNTERBALANCE_CYLINDER_AIRBAG: open,
                        }))
                      }
                      onSectionTouched={() => {}}
                    />
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="text-sm text-destructive border border-destructive rounded-md p-2">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={handleBackToSelection}>
                Voltar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isCompletingService
                  ? isSubmitting
                    ? 'Concluindo...'
                    : 'Concluir Manutenção'
                  : isSubmitting
                    ? tServices('creating')
                    : tServices('createService')}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
