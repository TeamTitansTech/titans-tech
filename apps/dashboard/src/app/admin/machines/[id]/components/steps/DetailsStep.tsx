import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Typography } from '@/components/ui/typography';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Stepper, type StepperStep } from '@/components/ui/stepper';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ServiceType } from '@/data/types/services.types';
import { SECTION_REGISTRY } from '../sections/registry';

interface DetailsStepProps {
  date: Date;
  performedBy: string;
  setPerformedBy: (value: string) => void;
  selectedServiceType: ServiceType;
  setSelectedServiceType: (value: ServiceType) => void;
  selectedSections: Set<string>;
  error: string | null;
  isCompletingService: boolean;
  shouldSkipSelection: boolean;
  stepperSteps: StepperStep[];
  onStepClick: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
  translations: {
    dateLabel: string;
    performedByLabel: string;
    performedByPlaceholder: string;
    serviceTypeLabel: string;
    inspectionType: string;
    maintenanceType: string;
    selectedAreasTitle: string;
    getSectionName: (i18nKey: string) => string;
    back: string;
    continue: string;
  };
}

export function DetailsStep({
  date,
  performedBy,
  setPerformedBy,
  selectedServiceType,
  setSelectedServiceType,
  selectedSections,
  error,
  isCompletingService,
  shouldSkipSelection,
  stepperSteps,
  onStepClick,
  onBack,
  onNext,
  translations,
}: DetailsStepProps) {
  return (
    <>
      {/* Stepper */}
      <div className="px-4 pb-2 pt-2">
        <Stepper steps={stepperSteps} onStepClick={onStepClick} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-6 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">{translations.dateLabel}</Label>
            <div className="flex items-center gap-2 mt-1 h-10 px-3 py-2 border rounded-md">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{date ? format(date, 'PPP') : '-'}</span>
            </div>
          </div>

          {isCompletingService ? (
            <div>
              <Label htmlFor="performedBy">{translations.performedByLabel}</Label>
              <Input
                id="performedBy"
                type="text"
                value={performedBy}
                onChange={(e) => setPerformedBy(e.target.value)}
                placeholder={translations.performedByPlaceholder}
                className="mt-1 h-10"
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="type">{translations.serviceTypeLabel}</Label>
              <Select
                value={selectedServiceType}
                onValueChange={(value) => setSelectedServiceType(value as ServiceType)}
              >
                <SelectTrigger id="type" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ServiceType.INSPECTION}>
                    {translations.inspectionType}
                  </SelectItem>
                  <SelectItem value={ServiceType.MAINTENANCE}>
                    {translations.maintenanceType}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Display selected sections summary */}
        <div className="border rounded-lg p-4">
          <Typography variant="h4" className="mb-3">
            {translations.selectedAreasTitle}
          </Typography>
          <div className="flex flex-wrap gap-2">
            {Array.from(selectedSections).map((sectionKey) => {
              const sectionConfig = SECTION_REGISTRY[sectionKey];
              if (!sectionConfig) return null;

              return (
                <div
                  key={sectionConfig.key}
                  className="px-3 py-1.5 bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 rounded-md text-sm"
                >
                  {translations.getSectionName(sectionConfig.metadata.i18nKey)}
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="text-sm text-destructive border border-destructive rounded-md p-2">
            {error}
          </div>
        )}
      </div>

      <div className="flex justify-between gap-3 pt-4 px-4 border-t">
        {!shouldSkipSelection && (
          <Button type="button" variant="outline" onClick={onBack}>
            {translations.back}
          </Button>
        )}
        <Button type="button" onClick={onNext} className={shouldSkipSelection ? 'ml-auto' : ''}>
          {translations.continue}
        </Button>
      </div>
    </>
  );
}
