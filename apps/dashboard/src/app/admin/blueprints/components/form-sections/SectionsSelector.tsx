import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';

interface SectionsSelectorProps {
  selectedSections: string[];
  availableSections: readonly string[];
  toggleSection: (section: string) => void;
  translations: {
    title: string;
    getSectionName: (section: string) => string;
  };
  disabled?: boolean;
}

export const SectionsSelector = ({
  selectedSections,
  availableSections,
  toggleSection,
  translations,
  disabled = false,
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
                onClick={() => !disabled && toggleSection(section)}
                disabled={disabled}
                className={
                  isSelected
                    ? 'bg-orange-500 text-white font-bold hover:bg-orange-600 border-orange-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed'
                    : 'text-foreground border-border hover:bg-orange-100 hover:text-orange-500 hover:border-orange-500 dark:hover:bg-orange-500/20 dark:hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed'
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
