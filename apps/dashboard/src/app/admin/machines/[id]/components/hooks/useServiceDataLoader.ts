import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { getServiceById } from '@/data/services/services.api';
import { RELATION_TO_SECTION_KEY } from '../types/service-completion.types';

export function useServiceDataLoader(
  open: boolean,
  serviceId: string | undefined,
  createdServiceId: string | null,
  isInspection: boolean,
  machineSections: string[],
  shouldSkipSelection: boolean,
  setCompletedSections: (sections: Set<string>) => void,
  setCompletedSectionData: (data: Record<string, any>) => void,
  setSelectedSections: (sections: Set<string>) => void,
  setCurrentStep: (step: any) => void,
  setCurrentSectionIndex: (index: number) => void,
) {
  const [isLoadingServiceData, setIsLoadingServiceData] = useState(!!serviceId);
  const hasLoadedInitialData = useRef(false);

  useEffect(() => {
    const loadServiceData = async () => {
      // Only load if conditions are met
      if (!open || !serviceId || createdServiceId || hasLoadedInitialData.current) return;

      setIsLoadingServiceData(true);

      try {
        const response = await getServiceById(serviceId);

        if (response.errors || !response.data) {
          console.error('Failed to load service data:', response.errors);
          toast.error('Failed to load service data');
          return;
        }

        const service = response.data as any;

        // Extract completed sections
        const savedCompletedSections = Array.isArray(service.completedSections)
          ? service.completedSections
          : [];

        const loadedSectionData: Record<string, any> = {};

        // Extract data from each relation
        Object.entries(RELATION_TO_SECTION_KEY).forEach(([relationKey, sectionKey]) => {
          const relationData = service[relationKey];
          if (relationData && Array.isArray(relationData) && relationData.length > 0) {
            const recordWithData = relationData.find((record: any) => {
              const hasNestedData =
                record.outerBefore ||
                record.outerData ||
                record.innerBefore ||
                record.innerData ||
                record.data;
              return hasNestedData;
            });
            loadedSectionData[sectionKey] = recordWithData || relationData[relationData.length - 1];
          }
        });

        // Update state
        setCompletedSections(new Set(savedCompletedSections));
        setCompletedSectionData(loadedSectionData);

        // Restore selectedSections
        let savedSelectedSections = Array.isArray(service.selectedSections)
          ? service.selectedSections
          : savedCompletedSections;

        if (isInspection && savedSelectedSections.length === 0) {
          savedSelectedSections = machineSections;
        }

        setSelectedSections(new Set(savedSelectedSections));

        // Restore step
        if (service.currentStep && service.currentStep !== 'summary') {
          setCurrentStep(service.currentStep);

          if (service.currentStep === 'sections' && service.currentSectionKey) {
            const sectionIndex = savedSelectedSections.indexOf(service.currentSectionKey);
            setCurrentSectionIndex(sectionIndex >= 0 ? sectionIndex : 0);
          } else {
            setCurrentSectionIndex(0);
          }
        } else if (savedCompletedSections.length > 0) {
          setCurrentStep('details');
          setCurrentSectionIndex(0);
        } else {
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
  }, [
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
  ]);

  const reset = () => {
    hasLoadedInitialData.current = false;
    setIsLoadingServiceData(false);
  };

  return {
    isLoadingServiceData,
    hasLoadedInitialData,
    reset,
  };
}
