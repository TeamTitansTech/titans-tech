'use client';

import { BearingClearanceSummary } from './BearingClearanceSummary';
import { GenericSectionSummary } from './GenericSectionSummary';

// Re-export individual summary components
export { BearingClearanceSummary };
export { GenericSectionSummary };

// Main component that routes to appropriate summary based on section key
export function SectionSummary({ sectionKey, data }: { sectionKey: string; data: any }) {
  switch (sectionKey) {
    case 'BEARING_CLEARANCE':
      return <BearingClearanceSummary data={data} />;

    // For all other sections, use the generic summary component
    // This displays data in a readable format instead of raw JSON
    default:
      return <GenericSectionSummary data={data} sectionKey={sectionKey} />;
  }
}
