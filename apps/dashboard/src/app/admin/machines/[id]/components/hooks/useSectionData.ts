import { useState } from 'react';
import type { SectionDataMap, AnySectionData } from '../types/service-completion.types';

export function useSectionData() {
  // Track which sections have been completed (validated)
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  // Store completed section data for summary display
  const [completedSectionData, setCompletedSectionData] = useState<Partial<SectionDataMap>>({});

  // Store the service ID for newly created services
  const [createdServiceId, setCreatedServiceId] = useState<string | null>(null);

  const markSectionComplete = (sectionKey: string, data: AnySectionData) => {
    setCompletedSections((prev) => new Set(prev).add(sectionKey));
    setCompletedSectionData((prev) => ({ ...prev, [sectionKey]: data }));
  };

  const markSectionIncomplete = (sectionKey: string) => {
    setCompletedSections((prev) => {
      const newSet = new Set(prev);
      newSet.delete(sectionKey);
      return newSet;
    });
  };

  const reset = () => {
    setCompletedSections(new Set());
    setCompletedSectionData({});
    setCreatedServiceId(null);
  };

  return {
    completedSections,
    setCompletedSections,
    completedSectionData,
    setCompletedSectionData,
    createdServiceId,
    setCreatedServiceId,
    markSectionComplete,
    markSectionIncomplete,
    reset,
  };
}
