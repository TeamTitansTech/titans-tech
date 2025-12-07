import type {
  ServiceType,
  BearingClearanceCheck,
  SlideSingleHammerCheck,
  SlideDoubleHammerCheck,
  GibsCheck,
  LubricationHydraulicsCheck,
  ClutchData,
  CounterbalanceCylinderCheck,
  TrammingCheck,
  PistonsCheck,
} from '@/data/types/services.types';

/**
 * Section data can be any of the section-specific data types
 * Structure varies by section type (Bearing Clearance, Slide Single/Double Hammer, Gibs, etc.)
 */
export type SectionData =
  | BearingClearanceCheck
  | SlideSingleHammerCheck
  | SlideDoubleHammerCheck
  | GibsCheck
  | LubricationHydraulicsCheck
  | ClutchData
  | CounterbalanceCylinderCheck
  | TrammingCheck
  | PistonsCheck;

/**
 * Result of validating a section's data
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  data?: SectionData;
}

/**
 * Standardized interface that all section components must implement
 * This ensures consistent data collection and validation across all sections
 */
export interface SectionComponentRef {
  /**
   * Validate the section's data (returns just errors)
   * @param serviceType - The type of service (MAINTENANCE or INSPECTION)
   * @returns Array of error messages (empty if valid)
   */
  validate: (serviceType: ServiceType) => string[];

  /**
   * Validate and get data in one call (more efficient)
   * @param serviceType - The type of service (MAINTENANCE or INSPECTION)
   * @returns ValidationResult with errors and data
   */
  validateAndGetData: (serviceType: ServiceType) => ValidationResult;

  /**
   * Get the current data from the section
   * @returns The section's data object
   */
  getData: () => SectionData;

  /**
   * Reset the section to its initial state
   */
  reset: () => void;

  /**
   * Check if the section has been touched/modified by the user
   * @returns true if the user has interacted with the section
   */
  isTouched: () => boolean;
}

/**
 * Props that all section components should accept
 */
export interface SectionComponentProps {
  /** Callback when the section is touched/modified */
  onSectionTouched: () => void;

  /** The type of service being completed */
  serviceType: ServiceType;

  /** Initial data to populate the section (for editing existing services) */
  initialData?: SectionData;

  /** Whether the section is currently open (for collapsible sections) */
  isOpen?: boolean;

  /** Callback to change the open state (for collapsible sections) */
  onOpenChange?: (open: boolean) => void;
}
