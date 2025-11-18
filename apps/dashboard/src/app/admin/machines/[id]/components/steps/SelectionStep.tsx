import { Button } from '@/components/ui/button';
import { SelectableSectionCard } from '@/components/SelectableSectionCard';
import type { SectionStatus } from '@/components/SelectableSectionCard';
import { SECTION_REGISTRY } from '../sections/registry';

interface SelectionStepProps {
  machineSections: string[];
  selectedSections: Set<string>;
  toggleSection: (sectionKey: string) => void;
  onCancel: () => void;
  onContinue: () => void;
  translations: {
    getSectionName: (i18nKey: string) => string;
    areasSelected: (count: number) => string;
    selectAreasAbove: string;
    cancel: string;
    continue: string;
  };
}

export function SelectionStep({
  machineSections,
  selectedSections,
  toggleSection,
  onCancel,
  onContinue,
  translations,
}: SelectionStepProps) {
  // Mock function to get section status - replace with actual logic
  const getSectionStatus = (_sectionKey: string): SectionStatus => {
    return 'unknown';
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {machineSections.map((sectionKey) => {
          const sectionConfig = SECTION_REGISTRY[sectionKey];
          if (!sectionConfig) return null;

          return (
            <SelectableSectionCard
              key={sectionConfig.key}
              title={translations.getSectionName(sectionConfig.metadata.i18nKey)}
              status={getSectionStatus(sectionConfig.key)}
              imageUrl={sectionConfig.metadata.image}
              subtitle="CP 2"
              isSelected={selectedSections.has(sectionConfig.key)}
              onClick={() => toggleSection(sectionConfig.key)}
            />
          );
        })}
      </div>

      <div className="mt-6 px-1 text-sm text-muted-foreground">
        {selectedSections.size > 0
          ? translations.areasSelected(selectedSections.size)
          : translations.selectAreasAbove}
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          {translations.cancel}
        </Button>
        <Button type="button" onClick={onContinue} disabled={selectedSections.size === 0}>
          {translations.continue}
        </Button>
      </div>
    </div>
  );
}
