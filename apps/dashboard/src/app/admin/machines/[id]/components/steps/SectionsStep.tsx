import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { Stepper, type StepperStep } from '@/components/ui/stepper';
import { SECTION_REGISTRY } from '../sections/registry';
import type { SectionComponentRef } from '../sections/types';
import { ServiceType } from '@/data/types/services.types';

interface SectionsStepProps {
  selectedSectionsArray: string[];
  currentSectionIndex: number;
  completedSectionData: Record<string, any>;
  currentServiceType: ServiceType;
  error: string | null;
  stepperSteps: StepperStep[];
  onStepClick: (index: number) => void;
  onSectionTouched: (sectionKey: string) => void;
  registerSectionRef: (sectionKey: string, ref: SectionComponentRef) => void;
  onPrevious: () => void;
  onNext: () => void;
  translations: {
    getSectionName: (i18nKey: string) => string;
    previous: string;
    saveAndContinue: string;
  };
}

export function SectionsStep({
  selectedSectionsArray,
  currentSectionIndex,
  completedSectionData,
  currentServiceType,
  error,
  stepperSteps,
  onStepClick,
  onSectionTouched,
  registerSectionRef,
  onPrevious,
  onNext,
  translations,
}: SectionsStepProps) {
  const currentSectionKey = selectedSectionsArray[currentSectionIndex];
  const sectionConfig = SECTION_REGISTRY[currentSectionKey];

  if (!sectionConfig) return null;

  const SectionComponent = sectionConfig.component;
  const sectionData = completedSectionData[currentSectionKey];

  // Create a key that changes when data is loaded to force component remount
  const dataHash = sectionData
    ? JSON.stringify(Object.keys(sectionData).sort()).substring(0, 20)
    : 'empty';
  const componentKey = `${currentSectionKey}-${dataHash}`;

  return (
    <>
      {/* Stepper */}
      <div className="px-4 pb-2">
        <Stepper steps={stepperSteps} onStepClick={onStepClick} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div key={componentKey} className="space-y-4">
          <Typography variant="h3" className="text-lg font-semibold">
            {translations.getSectionName(sectionConfig.metadata.i18nKey)}
          </Typography>

          <div className="border rounded-lg">
            <SectionComponent
              key={componentKey}
              ref={(ref: SectionComponentRef | null) => {
                if (ref) {
                  registerSectionRef(currentSectionKey, ref);
                }
              }}
              onSectionTouched={() => onSectionTouched(currentSectionKey)}
              serviceType={currentServiceType}
              isOpen={true}
              onOpenChange={() => {}}
              initialData={sectionData}
            />
          </div>
        </div>

        {error && (
          <div className="text-sm text-destructive border border-destructive rounded-md p-2 mt-4">
            {error}
          </div>
        )}
      </div>

      <div className="flex justify-between gap-3 pt-4 px-4 border-t">
        <Button type="button" variant="outline" onClick={onPrevious}>
          {translations.previous}
        </Button>
        <Button type="button" onClick={onNext}>
          {translations.saveAndContinue}
        </Button>
      </div>
    </>
  );
}
