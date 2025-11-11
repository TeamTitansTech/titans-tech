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
  SlideSection,
  type SlideSectionRef,
  type SlideSectionData,
  defaultSlideData,
  validateSlideData,
} from './SlideSection';

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
  defaultLubricationHydraulicsData,
  validateLubricationHydraulicsData,
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
