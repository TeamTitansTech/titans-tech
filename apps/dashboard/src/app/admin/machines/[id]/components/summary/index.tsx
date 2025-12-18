'use client';

import type { AnySectionData } from '../types/service-completion.types';
import type {
  BearingClearanceCheck,
  BearingClearanceSingleHammerCheck,
  SlideSingleHammerCheck,
  SlideDoubleHammerCheck,
  GibsCheck,
  CounterbalanceCylinderCheck,
  TrammingCheck,
  PistonsCheck,
  ClutchData,
  LubricationHydraulicsCheck,
  Attachment,
  DieCushionCheck,
  ElectricalControlCheck,
  PerpendicularityCheck,
  AngularityCheck,
} from '@/data/types/services.types';
import type { ShimThicknessSectionData } from '../sections/ShimThicknessSection';
import { BearingClearanceSummary } from './BearingClearanceSummary';
import { BearingClearanceSingleHammerSummary } from './BearingClearanceSingleHammerSummary';
import { GenericSectionSummary } from './GenericSectionSummary';
import { SlideSingleHammerSummary } from './SlideSingleHammerSummary';
import { SlideDoubleHammerSummary } from './SlideDoubleHammerSummary';
import { GibsSummary } from './GibsSummary';
import { CounterbalanceSummary } from './CounterbalanceSummary';
import { TrammingSummary } from './TrammingSummary';
import { PistonsSummary } from './PistonsSummary';
import { ClutchSummary } from './ClutchSummary';
import { LubricationSummary } from './LubricationSummary';
import { ShimThicknessSummary } from './ShimThicknessSummary';
import { DieCushionSummary } from './DieCushionSummary';
import { ElectricalControlSummary } from './ElectricalControlSummary';
import { PerpendiculariySummary } from './PerpendiculariySummary';
import { AngularitySummary } from './AngularitySummary';

// Re-export individual summary components
export { BearingClearanceSummary };
export { BearingClearanceSingleHammerSummary };
export { GenericSectionSummary };
export { SlideSingleHammerSummary };
export { SlideDoubleHammerSummary };
export { GibsSummary };
export { CounterbalanceSummary };
export { TrammingSummary };
export { PistonsSummary };
export { ClutchSummary };
export { LubricationSummary };
export { ShimThicknessSummary };
export { DieCushionSummary };
export { ElectricalControlSummary };
export { PerpendiculariySummary };
export { AngularitySummary };

// Main component that routes to appropriate summary based on section key
export function SectionSummary({
  sectionKey,
  data,
  serviceId,
}: {
  sectionKey: string;
  data: AnySectionData;
  serviceId?: string;
}) {
  switch (sectionKey) {
    case 'BEARING_CLEARANCE':
      return <BearingClearanceSummary data={data as BearingClearanceCheck} />;

    case 'BEARING_CLEARANCE_SINGLE_HAMMER':
      return (
        <BearingClearanceSingleHammerSummary data={data as BearingClearanceSingleHammerCheck} />
      );

    case 'SLIDE_SINGLE_HAMMER':
      return <SlideSingleHammerSummary data={data as SlideSingleHammerCheck} />;

    case 'SLIDE_DOUBLE_HAMMER':
      return <SlideDoubleHammerSummary data={data as SlideDoubleHammerCheck} />;

    case 'GIBS':
      return <GibsSummary data={data as GibsCheck} />;

    case 'COUNTERBALANCE_CYLINDER_AIRBAG':
      return (
        <CounterbalanceSummary data={data as CounterbalanceCylinderCheck} serviceId={serviceId} />
      );

    case 'TRAMMING':
      return <TrammingSummary data={data as TrammingCheck} />;

    case 'PISTONS':
      return <PistonsSummary data={data as PistonsCheck} />;

    case 'CLUTCH': {
      // Handle the wrapped structure from ClutchSectionData
      const clutchSectionData = data as { data?: ClutchData; attachments?: Attachment[] };
      const innerData = clutchSectionData?.data ?? (clutchSectionData as ClutchData);
      return (
        <ClutchSummary
          data={innerData as ClutchData}
          attachments={clutchSectionData?.attachments}
        />
      );
    }

    case 'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER': {
      // Handle both wrapped and unwrapped data structures
      const lubData = data as LubricationHydraulicsCheck;
      const innerData = lubData?.data ?? lubData;
      return (
        <LubricationSummary
          data={innerData as LubricationHydraulicsCheck['data']}
          attachments={lubData?.attachments}
        />
      );
    }

    case 'SHIM_THICKNESS':
      return <ShimThicknessSummary data={data as ShimThicknessSectionData} />;

    case 'DIE_CUSHION':
      return <DieCushionSummary data={data as DieCushionCheck} />;

    case 'ELECTRICAL_CONTROL':
      return <ElectricalControlSummary data={data as ElectricalControlCheck} />;

    case 'PERPENDICULARITY':
      return <PerpendiculariySummary data={data as PerpendicularityCheck} />;

    case 'ANGULARITY':
      return <AngularitySummary data={data as AngularityCheck} />;

    // For all other sections, use the generic summary component
    // This displays data in a readable format instead of raw JSON
    default:
      return <GenericSectionSummary data={data} sectionKey={sectionKey} />;
  }
}
