import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Typography } from '@/components/ui/typography';
import { Stepper, type StepperStep } from '@/components/ui/stepper';
import { Check } from 'lucide-react';
import { format } from 'date-fns';
import { SECTION_REGISTRY } from '../sections/registry';

interface SummaryStepProps {
  date: Date;
  performedBy: string;
  completedSections: Set<string>;
  completedSectionData: Record<string, any>;
  isSubmitting: boolean;
  error: string | null;
  stepperSteps: StepperStep[];
  onStepClick: (index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  translations: {
    title: string;
    serviceDetailsTitle: string;
    realizationDate: string;
    performedBy: string;
    completedAreasTitle: string;
    detailedDataTitle: string;
    getSectionName: (i18nKey: string) => string;
    completeService: string;
    completing: string;
  };
}

export function SummaryStep({
  date,
  performedBy,
  completedSections,
  completedSectionData,
  isSubmitting,
  error,
  stepperSteps,
  onStepClick,
  onSubmit,
  translations,
}: SummaryStepProps) {
  return (
    <form onSubmit={onSubmit} className="flex-1 overflow-hidden flex flex-col">
      {/* Stepper */}
      <div className="px-4 pb-2">
        <Stepper steps={stepperSteps} onStepClick={onStepClick} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <Typography variant="h3" className="text-lg font-semibold mb-4">
          {translations.title}
        </Typography>

        {/* Service Details Summary */}
        <div className="border rounded-lg p-4 mb-4">
          <Typography variant="h4" className="font-semibold mb-3">
            {translations.serviceDetailsTitle}
          </Typography>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">
                {translations.realizationDate}
              </Label>
              <div className="text-sm font-medium">{date ? format(date, 'PPP') : '-'}</div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{translations.performedBy}</Label>
              <div className="text-sm font-medium">{performedBy || '-'}</div>
            </div>
          </div>
        </div>

        {/* Sections Summary */}
        <div className="border rounded-lg p-4 mb-4">
          <Typography variant="h4" className="font-semibold mb-3">
            {translations.completedAreasTitle}
          </Typography>
          <div className="space-y-2">
            {Array.from(completedSections).map((sectionKey) => {
              const sectionConfig = SECTION_REGISTRY[sectionKey];
              if (!sectionConfig) return null;
              return (
                <div
                  key={sectionKey}
                  className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md"
                >
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {translations.getSectionName(sectionConfig.metadata.i18nKey)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Data Review */}
        <div className="space-y-3">
          <Typography variant="h4" className="font-semibold">
            {translations.detailedDataTitle}
          </Typography>

          {/*
            NOTE: Full implementation requires individual section summary components:
            - BearingClearanceSummary
            - SlideSummary
            - GibsSummary
            - LubricationSummary
            - ClutchSummary
            - CounterbalanceSummary
            - TrammingSummary

            Each would render detailed data from completedSectionData[sectionKey]
          */}
          {Array.from(completedSections).map((sectionKey) => {
            const sectionConfig = SECTION_REGISTRY[sectionKey];
            const data = completedSectionData[sectionKey];
            if (!sectionConfig || !data) return null;

            return (
              <div key={sectionKey} className="border rounded-lg p-4">
                <Typography variant="h4" className="font-semibold mb-2">
                  {translations.getSectionName(sectionConfig.metadata.i18nKey)}
                </Typography>
                <div className="text-sm text-muted-foreground">
                  {/* Placeholder - would render section-specific summary component here */}
                  Data saved for this section
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="text-sm text-destructive border border-destructive rounded-md p-2 mt-4">
            {error}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 px-4 border-t">
        <Button type="submit" disabled={isSubmitting} className="min-w-[200px]">
          {isSubmitting ? translations.completing : translations.completeService}
        </Button>
      </div>
    </form>
  );
}
