import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';

interface SectionsSelectorProps {
  selectedSections: string[];
  availableSections: readonly string[];
  toggleSection: (section: string) => void;
  disabled?: boolean;
  translations: {
    title: string;
    getSectionName: (section: string) => string;
  };
}

export const SectionsSelector = ({
  selectedSections,
  availableSections,
  toggleSection,
  disabled = false,
  translations,
}: SectionsSelectorProps) => {
  return (
    <section className="space-y-4">
      <div>
        <Typography variant="h3" className="mb-4">
          {translations.title}
        </Typography>
        <div className="flex flex-wrap gap-2">
          {availableSections.map((section) => {
            const isSelected = selectedSections.includes(section);
            return (
              <Button
                key={section}
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={() => toggleSection(section)}
                className={
                  isSelected
                    ? 'bg-orange-500 text-white font-bold hover:bg-orange-600 border-orange-500 transition-all'
                    : 'text-foreground border-border hover:bg-orange-100 hover:text-orange-500 hover:border-orange-500 dark:hover:bg-orange-500/20 dark:hover:text-white transition-all'
                }
              >
                {translations.getSectionName(section)}
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
