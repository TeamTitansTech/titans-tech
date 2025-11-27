import { Button } from '@/components/ui/button';
import { Stepper, type StepperStep } from '@/components/ui/stepper';
import { SECTION_REGISTRY } from '../sections/registry';
import type { SectionComponentRef } from '../sections/types';
import { ServiceType } from '@/data/types/services.types';
import type { AnySectionData } from '../types/service-completion.types';

interface SectionsStepProps {
  selectedSectionsArray: string[];
  currentSectionIndex: number;
  completedSectionData: Record<string, AnySectionData>;
  currentServiceType: ServiceType;
  error: string | null;
  stepperSteps: StepperStep[];
  onStepClick: (index: number) => void;
  onSectionTouched: (sectionKey: string) => void;
  registerSectionRef: (sectionKey: string, ref: SectionComponentRef) => void;
  onPrevious: () => void;
  onNext: () => void;
  getSectionRef: (sectionKey: string) => SectionComponentRef | undefined;
  completedSections: Set<string>;
  serviceId?: string;
  translations: {
    getSectionName: (i18nKey: string) => string;
    previous: string;
    save: string;
    continue: string;
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
  getSectionRef,
  completedSections,
  serviceId,
  translations,
}: SectionsStepProps) {
  const currentSectionKey = selectedSectionsArray[currentSectionIndex];
  const sectionConfig = SECTION_REGISTRY[currentSectionKey];

  if (!sectionConfig) return null;

  const SectionComponent = sectionConfig.component;
  const sectionData = completedSectionData[currentSectionKey as keyof typeof completedSectionData];

  // Create a key that changes when data is loaded to force component remount
  const dataHash = sectionData
    ? JSON.stringify(Object.keys(sectionData).sort()).substring(0, 20)
    : 'empty';
  const componentKey = `${currentSectionKey}-${dataHash}`;

  // Determine button text based on whether section is completed and has been modified
  const isSectionCompleted = completedSections.has(currentSectionKey);
  const sectionRef = getSectionRef(currentSectionKey);
  const isSectionTouched = sectionRef?.isTouched?.() ?? false;

  // Show "Continue" if section is completed and hasn't been modified
  // Show "Save" if section is new or has been modified
  const buttonText =
    isSectionCompleted && !isSectionTouched ? translations.continue : translations.save;

  return (
    <>
      {/* Stepper */}
      <div className="pb-4 px-4">
        <Stepper steps={stepperSteps} onStepClick={onStepClick} />
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-4">
        <div key={componentKey} className="space-y-4">
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
            serviceId={serviceId}
          />
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
          {buttonText}
        </Button>
      </div>
    </>
  );
}
