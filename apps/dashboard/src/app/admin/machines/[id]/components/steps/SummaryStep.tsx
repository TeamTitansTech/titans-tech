import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Typography } from '@/components/ui/typography';
import { Stepper, type StepperStep } from '@/components/ui/stepper';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Check, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { SECTION_REGISTRY } from '../sections/registry';
import { SectionSummary } from '../summary';
import { YesNoNaDncType, YesNoDncType } from '@titans-tech/shared/types/services';
import { WhyNotCoveredType } from '@titans-tech/shared/types';
import type { AnySectionData } from '../types/service-completion.types';

interface SummaryStepProps {
  date: Date;
  performedBy: string;
  completedSections: Set<string>;
  completedSectionData: Record<string, AnySectionData>;
  isSubmitting: boolean;
  error: string | null;
  stepperSteps: StepperStep[];
  onStepClick: (index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  // Inspection observation fields
  isPressLevel?: YesNoNaDncType;
  driveBeltCondition?: string;
  areAllProtectiveCovers?: string;
  protectiveCoversExplanation?: string;
  areCracksVisible?: YesNoDncType;
  cracksLocation?: string;
  isMainMotorSecure?: YesNoDncType;
  isMotorPlateSecure?: YesNoDncType;
  whyNotCovered?: string;
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
  // Inspection observation fields
  isPressLevel,
  driveBeltCondition,
  areAllProtectiveCovers,
  protectiveCoversExplanation,
  areCracksVisible,
  cracksLocation,
  isMainMotorSecure,
  isMotorPlateSecure,
  whyNotCovered,
  translations,
}: SummaryStepProps) {
  const tServices = useTranslations('services.modal');
  const tInspections = useTranslations('inspections.form.enums');

  // Helper function to format enum values for display
  const formatEnumValue = (value: string | undefined, enumType: string) => {
    if (!value) return '-';
    const translationKey = `${enumType}.${value.toLowerCase()}`;
    const translated = tInspections(translationKey);

    // If translation key is returned as-is, return the original value
    if (translated === translationKey || translated.includes('inspections.form.enums')) {
      return value;
    }

    return translated;
  };

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

            {/* Add all inspection observation fields here */}
            <div>
              <Label className="text-xs text-muted-foreground">
                {tServices('inspectionObservations.isPressLevel')}
              </Label>
              <div className="text-sm font-medium">
                {formatEnumValue(isPressLevel, 'yesNoNaDnc')}
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                {tServices('inspectionObservations.driveBeltCondition')}
              </Label>
              <div className="text-sm font-medium">
                {formatEnumValue(driveBeltCondition, 'driveBeltCondition')}
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                {tServices('inspectionObservations.areAllProtectiveCovers')}
              </Label>
              <div className="text-sm font-medium">
                {formatEnumValue(areAllProtectiveCovers, 'protectiveCoversStatus')}
              </div>
            </div>
            {areAllProtectiveCovers === 'NO' && (
              <div>
                <Label className="text-xs text-muted-foreground">
                  {tServices('inspectionObservations.whyNotCovered')}
                </Label>
                <div className="text-sm font-medium">
                  {formatEnumValue(whyNotCovered, 'whyNotCovered')}
                </div>
              </div>
            )}
            {areAllProtectiveCovers === 'NO' &&
              whyNotCovered === WhyNotCoveredType.OTHER_EXPLAIN && (
                <div className="col-span-2">
                  <Label className="text-xs text-muted-foreground">
                    {tServices('inspectionObservations.protectiveCoversExplanation')}
                  </Label>
                  <div className="text-sm font-medium">{protectiveCoversExplanation || '-'}</div>
                </div>
              )}
            <div>
              <Label className="text-xs text-muted-foreground">
                {tServices('inspectionObservations.areCracksVisible')}
              </Label>
              <div className="text-sm font-medium">
                {formatEnumValue(areCracksVisible, 'yesNoDnc')}
              </div>
            </div>
            {areCracksVisible === YesNoDncType.YES && (
              <div>
                <Label className="text-xs text-muted-foreground">
                  {tServices('inspectionObservations.cracksLocation')}
                </Label>
                <div className="text-sm font-medium">{cracksLocation || '-'}</div>
              </div>
            )}
            <div>
              <Label className="text-xs text-muted-foreground">
                {tServices('inspectionObservations.isMainMotorSecure')}
              </Label>
              <div className="text-sm font-medium">
                {formatEnumValue(isMainMotorSecure, 'yesNoDnc')}
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                {tServices('inspectionObservations.isMotorPlateSecure')}
              </Label>
              <div className="text-sm font-medium">
                {formatEnumValue(isMotorPlateSecure, 'yesNoDnc')}
              </div>
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
            const data = completedSectionData[sectionKey as keyof typeof completedSectionData];
            if (!sectionConfig || !data) return null;

            return (
              <Collapsible key={sectionKey} defaultOpen={true}>
                <div className="border rounded-lg">
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors group">
                    <Typography variant="h4" className="font-semibold text-sm">
                      {translations.getSectionName(sectionConfig.metadata.i18nKey)}
                    </Typography>
                    <ChevronUp className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-3 pt-0 text-sm">
                    <SectionSummary sectionKey={sectionKey} data={data} />
                  </CollapsibleContent>
                </div>
              </Collapsible>
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
