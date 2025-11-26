import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { getServiceById } from '@/data/services/services.api';
import {
  RELATION_TO_SECTION_KEY,
  type AnySectionData,
  type SectionDataMap,
} from '../types/service-completion.types';
import { YesNoNaDncType, YesNoDncType, type Service } from '@titans-tech/shared/types/services';

type ServiceStep = 'selection' | 'details' | 'sections' | 'summary';

interface ServiceWithRelations extends Service {
  [key: string]: unknown;
  completedSections?: string[];
}

export function useServiceDataLoader(
  open: boolean,
  serviceId: string | undefined,
  createdServiceId: string | null,
  isInspection: boolean,
  machineSections: string[],
  shouldSkipSelection: boolean,
  setCompletedSections: (sections: Set<string>) => void,
  setCompletedSectionData: (data: Record<string, AnySectionData>) => void,
  setSelectedSections: (sections: Set<string>) => void,
  setCurrentStep: (step: ServiceStep) => void,
  setCurrentSectionIndex: (index: number) => void,
  // Inspection observation field setters
  setDate?: (date: Date) => void,
  setPerformedBy?: (value: string) => void,
  setIsPressLevel?: (value: YesNoNaDncType | undefined) => void,
  setDriveBeltCondition?: (value: string) => void,
  setAreAllProtectiveCovers?: (value: string) => void,
  setProtectiveCoversExplanation?: (value: string) => void,
  setAreCracksVisible?: (value: YesNoDncType | undefined) => void,
  setCracksLocation?: (value: string) => void,
  setIsMainMotorSecure?: (value: YesNoDncType | undefined) => void,
  setIsMotorPlateSecure?: (value: YesNoDncType | undefined) => void,
  setWhyNotCovered?: (value: string) => void,
) {
  const [isLoadingServiceData, setIsLoadingServiceData] = useState(!!serviceId);
  const hasLoadedInitialData = useRef(false);

  useEffect(() => {
    const loadServiceData = async () => {
      console.log('🔄 [useServiceDataLoader] Effect triggered:', {
        open,
        serviceId,
        createdServiceId,
        hasLoadedInitialData: hasLoadedInitialData.current,
      });

      // Only load if conditions are met
      if (!open || !serviceId || createdServiceId || hasLoadedInitialData.current) {
        console.log('❌ [useServiceDataLoader] Skipping load due to conditions');
        return;
      }

      setIsLoadingServiceData(true);

      try {
        const response = await getServiceById(serviceId);

        if (response.errors || !response.data) {
          console.error('Failed to load service data:', response.errors);
          toast.error('Failed to load service data');
          return;
        }

        const service = response.data as ServiceWithRelations;

        console.log('📦 [useServiceDataLoader] Loaded service data:', {
          serviceId,
          date: service.date,
          performedBy: service.performedBy,
          isPressLevel: service.isPressLevel,
          driveBeltCondition: service.driveBeltCondition,
          areAllProtectiveCovers: service.areAllProtectiveCovers,
          areCracksVisible: service.areCracksVisible,
          isMainMotorSecure: service.isMainMotorSecure,
          isMotorPlateSecure: service.isMotorPlateSecure,
          whyNotCovered: service.whyNotCovered,
        });

        // Extract completed sections
        const savedCompletedSections = Array.isArray(service.completedSections)
          ? service.completedSections
          : [];

        const loadedSectionData: Record<string, AnySectionData> = {};

        // Helper to convert string/Decimal values to numbers in nested objects
        const convertDecimalsToNumbers = (obj: any): any => {
          if (!obj || typeof obj !== 'object') return obj;
          if (Array.isArray(obj)) return obj.map(convertDecimalsToNumbers);

          const converted: any = {};
          for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
              // Convert numeric strings to numbers
              converted[key] = Number(value);
            } else if (typeof value === 'object' && value !== null) {
              // Recursively convert nested objects
              converted[key] = convertDecimalsToNumbers(value);
            } else {
              converted[key] = value;
            }
          }
          return converted;
        };

        // Extract data from each relation
        Object.entries(RELATION_TO_SECTION_KEY).forEach(([relationKey, sectionKey]) => {
          const relationData = service[relationKey];
          if (relationData && Array.isArray(relationData) && relationData.length > 0) {
            const recordWithData = relationData.find((record: Record<string, unknown>) => {
              const hasNestedData =
                record.outerBefore ||
                record.outerData ||
                record.innerBefore ||
                record.innerData ||
                record.data ||
                // GIBS-specific nested data
                record.outerBefore ||
                record.outerData ||
                record.outerFreeHangingData ||
                record.innerBefore ||
                record.innerData ||
                record.innerBeforeTool ||
                record.innerDataTool;
              return hasNestedData;
            });
            const rawData = recordWithData || relationData[relationData.length - 1];
            // Convert Decimal strings to numbers for GIBS section
            loadedSectionData[sectionKey] =
              sectionKey === 'GIBS' ? convertDecimalsToNumbers(rawData) : rawData;
          }
        });

        const sectionsWithMissingData = savedCompletedSections.filter(
          (sectionKey) => !loadedSectionData[sectionKey as keyof SectionDataMap],
        );

        if (sectionsWithMissingData.length > 0) {
          toast.warning(
            `Some sections are marked complete but have missing data: ${sectionsWithMissingData.join(', ')}`,
            { duration: 5000 },
          );
        }

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

        // Restore inspection observation fields
        if (service.date && setDate) {
          setDate(new Date(service.date));
        }
        if (service.performedBy !== undefined && setPerformedBy) {
          setPerformedBy(service.performedBy || '');
        }
        if (service.isPressLevel !== undefined && setIsPressLevel) {
          setIsPressLevel(service.isPressLevel);
        }
        if (service.driveBeltCondition !== undefined && setDriveBeltCondition) {
          setDriveBeltCondition(service.driveBeltCondition || '');
        }
        if (service.areAllProtectiveCovers !== undefined && setAreAllProtectiveCovers) {
          setAreAllProtectiveCovers(service.areAllProtectiveCovers || '');
        }
        if (service.protectiveCoversExplanation !== undefined && setProtectiveCoversExplanation) {
          setProtectiveCoversExplanation(service.protectiveCoversExplanation || '');
        }
        if (service.areCracksVisible !== undefined && setAreCracksVisible) {
          setAreCracksVisible(service.areCracksVisible);
        }
        if (service.cracksLocation !== undefined && setCracksLocation) {
          setCracksLocation(service.cracksLocation || '');
        }
        if (service.isMainMotorSecure !== undefined && setIsMainMotorSecure) {
          setIsMainMotorSecure(service.isMainMotorSecure);
        }
        if (service.isMotorPlateSecure !== undefined && setIsMotorPlateSecure) {
          setIsMotorPlateSecure(service.isMotorPlateSecure);
        }
        if (service.whyNotCovered !== undefined && setWhyNotCovered) {
          setWhyNotCovered(service.whyNotCovered || '');
        }

        console.log('✅ [useServiceDataLoader] Restored inspection observation fields');

        // Restore step
        const isValidStep = (step: string | undefined): step is ServiceStep => {
          return (
            step === 'selection' || step === 'details' || step === 'sections' || step === 'summary'
          );
        };

        if (
          service.currentStep &&
          isValidStep(service.currentStep) &&
          service.currentStep !== 'summary'
        ) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, serviceId, createdServiceId, isInspection, shouldSkipSelection, machineSections]);

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
