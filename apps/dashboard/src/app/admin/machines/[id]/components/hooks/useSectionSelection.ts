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
    // Get sections from machineSections that are selected
    const machineSelectedSections = machineSections.filter((section) =>
      selectedSections.has(section),
    );

    // Get dynamically added sections (in selectedSections but not in machineSections)
    // This includes sections like ANGULARITY that are added via checkbox
    const dynamicSections = Array.from(selectedSections).filter(
      (section) => !machineSections.includes(section),
    );

    // Return machine sections first, then dynamic sections
    return [...machineSelectedSections, ...dynamicSections];
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
