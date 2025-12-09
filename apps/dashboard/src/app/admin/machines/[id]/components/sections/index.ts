/**
 * Section components for InspectionModal
 * Each section is self-contained with its own state, validation, and data management
 */

export {
  BearingClearanceSection,
  type BearingClearanceSectionRef,
  type BearingClearanceSectionData,
  defaultBearingData,
  validateBearingClearanceData,
} from './BearingClearanceSection';

export {
  SlideSingleHammerSection,
  type SlideSingleHammerSectionRef,
  type SlideSingleHammerSectionData,
  type SlideFormData,
  defaultSlideFormData,
  validateSlideFormData,
} from './SlideSingleHammerSection';

export {
  SlideDoubleHammerSection,
  type SlideDoubleHammerSectionRef,
  type SlideDoubleHammerSectionData,
} from './SlideDoubleHammerSection';

export {
  GibsSection,
  type GibsSectionRef,
  type GibsSectionData,
  defaultGibsData,
  validateGibsData,
} from './GibsSection';

export {
  LubricationHydraulicsSection,
  type LubricationHydraulicsSectionRef,
  defaultLubricationHydraulicsCheck,
  validateLubricationHydraulicsCheck,
} from './LubricationHydraulicsSection';

export {
  ClutchSection,
  type ClutchSectionRef,
  defaultClutchData,
  validateClutchData,
} from './ClutchSection';

export {
  CounterbalanceCylinderSection,
  type CounterbalanceCylinderSectionRef,
  defaultCounterbalanceCylinderData,
  validateCounterbalanceCylinderData,
} from './CounterbalanceCylinderSection';

export { isDataTouched } from './utils';
