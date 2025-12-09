import {
  ServiceType,
  BearingClearanceCheck,
  SlideSingleHammerCheck,
  SlideDoubleHammerCheck,
  GibsCheck,
  LubricationHydraulicsData,
  ClutchData,
  CounterbalanceCylinderCheck,
  TrammingCheck,
  PistonsCheck,
} from '@/data/types/services.types';

export type StepType = 'selection' | 'details' | 'sections' | 'summary';

/**
 * Type-safe mapping of section keys to their data types
 */
export interface SectionDataMap {
  BEARING_CLEARANCE: BearingClearanceCheck;
  SLIDE_SINGLE_HAMMER: SlideSingleHammerCheck;
  SLIDE_DOUBLE_HAMMER: SlideDoubleHammerCheck;
  GIBS: GibsCheck;
  LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER: LubricationHydraulicsData;
  CLUTCH: ClutchData;
  COUNTERBALANCE_CYLINDER_AIRBAG: CounterbalanceCylinderCheck;
  TRAMMING: TrammingCheck;
  PISTONS: PistonsCheck;
}

/**
 * Union type of all possible section data types
 */
export type AnySectionData =
  | BearingClearanceCheck
  | SlideSingleHammerCheck
  | SlideDoubleHammerCheck
  | GibsCheck
  | LubricationHydraulicsData
  | ClutchData
  | CounterbalanceCylinderCheck
  | TrammingCheck
  | PistonsCheck;

export interface ServiceCompletionModalProps {
  machineId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  machineSections?: string[];
  serviceId?: string; // If provided, we're completing an existing service
  serviceType?: ServiceType; // Type of service being completed
  initialDate?: string; // Initial date from existing service
  initialPerformedBy?: string; // Initial performedBy from existing service
  companyId?: string; // Company ID for alert notifications
  onSuccess?: () => void; // Called when service is successfully completed
}

export interface SectionDataState {
  completedSections: Set<string>;
  completedSectionData: Record<string, AnySectionData>;
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

/**
 * Maps Prisma relation names to section keys.
 * Note: 'slide' relation maps to either SLIDE_SINGLE_HAMMER or SLIDE_DOUBLE_HAMMER
 * based on the machine's blueprint sections (handled separately in useServiceDataLoader).
 */
export const RELATION_TO_SECTION_KEY: Record<string, string> = {
  bearingClearance: 'BEARING_CLEARANCE',
  gibs: 'GIBS',
  lubricationHydraulics: 'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER',
  clutch: 'CLUTCH',
  counterbalanceCylinderAirbag: 'COUNTERBALANCE_CYLINDER_AIRBAG',
  tramming: 'TRAMMING',
  pistons: 'PISTONS',
};

/**
 * Maps section keys to their Prisma relation names.
 * Used for saving data back to the database.
 */
export const SECTION_KEY_TO_RELATION: Record<string, string> = {
  BEARING_CLEARANCE: 'bearingClearance',
  SLIDE_SINGLE_HAMMER: 'slideSingleHammer',
  SLIDE_DOUBLE_HAMMER: 'slideDoubleHammer',
  GIBS: 'gibs',
  LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER: 'lubricationHydraulics',
  CLUTCH: 'clutch',
  COUNTERBALANCE_CYLINDER_AIRBAG: 'counterbalanceCylinderAirbag',
  TRAMMING: 'tramming',
  PISTONS: 'pistons',
};
