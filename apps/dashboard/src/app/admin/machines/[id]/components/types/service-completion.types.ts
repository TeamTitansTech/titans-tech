import { ServiceType } from '@/data/types/services.types';

export type StepType = 'selection' | 'details' | 'sections' | 'summary';

export interface ServiceCompletionModalProps {
  machineId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  machineSections?: string[];
  serviceId?: string; // If provided, we're completing an existing service
  serviceType?: ServiceType; // Type of service being completed
  initialDate?: string; // Initial date from existing service
  initialPerformedBy?: string; // Initial performedBy from existing service
}

export interface SectionDataState {
  completedSections: Set<string>;
  completedSectionData: Record<string, any>;
}

export interface ServiceFormState {
  date: Date;
  performedBy: string;
  selectedServiceType: ServiceType;
  currentServiceType: ServiceType;
  isSubmitting: boolean;
  error: string | null;
}

export interface StepNavigationState {
  currentStep: StepType;
  currentSectionIndex: number;
}

export interface BearingRow {
  label: string;
  before?: string | number;
  after?: string | number;
  condition?: string;
  matingPart?: string;
  combinedWith?: string;
}

export interface SectionValidationResult {
  isValid: boolean;
  errors: string[];
}

export const RELATION_TO_SECTION_KEY: Record<string, string> = {
  bearingClearance: 'BEARING_CLEARANCE',
  slide: 'SLIDE',
  gibs: 'GIBS',
  lubricationHydraulics: 'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER',
  clutch: 'CLUTCH',
  counterbalanceCylinderAirbag: 'COUNTERBALANCE_CYLINDER_AIRBAG',
  tramming: 'TRAMMING',
};
