'use client';

import { BearingClearanceSummary } from './BearingClearanceSummary';
import { GenericSectionSummary } from './GenericSectionSummary';
import { SlideSummary } from './SlideSummary';
import { GibsSummary } from './GibsSummary';
import { CounterbalanceSummary } from './CounterbalanceSummary';
import { TrammingSummary } from './TrammingSummary';
import { PistonsSummary } from './PistonsSummary';
import { ClutchSummary } from './ClutchSummary';
import { LubricationSummary } from './LubricationSummary';

// Re-export individual summary components
export { BearingClearanceSummary };
export { GenericSectionSummary };
export { SlideSummary };
export { GibsSummary };
export { CounterbalanceSummary };
export { TrammingSummary };
export { PistonsSummary };
export { ClutchSummary };
export { LubricationSummary };

// Main component that routes to appropriate summary based on section key
export function SectionSummary({
  sectionKey,
  data,
}: {
  sectionKey: string;
  data: Record<string, unknown>;
}) {
  switch (sectionKey) {
    case 'BEARING_CLEARANCE':
      return <BearingClearanceSummary data={data} />;

    case 'SLIDE':
      return <SlideSummary data={data} />;

    case 'GIBS':
      return <GibsSummary data={data} />;

    case 'COUNTERBALANCE_CYLINDER_AIRBAG':
      return <CounterbalanceSummary data={data} />;

    case 'TRAMMING':
      return <TrammingSummary data={data} />;

    case 'PISTONS':
      return <PistonsSummary data={data} />;

    case 'CLUTCH':
      return <ClutchSummary data={data} />;

    case 'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER':
      return <LubricationSummary data={data} />;

    // For all other sections, use the generic summary component
    // This displays data in a readable format instead of raw JSON
    default:
      return <GenericSectionSummary data={data} sectionKey={sectionKey} />;
  }
}
