import { useState } from 'react';

export function useSectionSelection(isInspection: boolean, machineSections: string[]) {
  // For inspections: pre-select all sections (always)
  // For completing maintenance: start with empty set (user selects what they maintained)
  // For new maintenance: start with empty set
  const [selectedSections, setSelectedSections] = useState<Set<string>>(
    isInspection ? new Set(machineSections) : new Set(),
  );

  const toggleSection = (sectionKey: string) => {
    setSelectedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionKey)) {
        newSet.delete(sectionKey);
      } else {
        newSet.add(sectionKey);
      }
      return newSet;
    });
  };

  const getSelectedSectionsArray = () => {
    return machineSections.filter((section) => selectedSections.has(section));
  };

  const reset = (inspection: boolean, sections: string[]) => {
    setSelectedSections(inspection ? new Set(sections) : new Set());
  };

  return {
    selectedSections,
    setSelectedSections,
    toggleSection,
    getSelectedSectionsArray,
    reset,
  };
}
