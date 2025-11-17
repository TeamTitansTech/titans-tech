import { useState } from 'react';
import type { StepType } from '../types/service-completion.types';

export function useServiceSteps(shouldSkipSelection: boolean) {
  // For inspections or editing existing services, start at 'details' step
  // For new maintenance services, start at 'selection' step
  const [currentStep, setCurrentStep] = useState<StepType>(
    shouldSkipSelection ? 'details' : 'selection',
  );
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);

  const reset = (skipSelection: boolean) => {
    setCurrentStep(skipSelection ? 'details' : 'selection');
    setCurrentSectionIndex(0);
  };

  return {
    currentStep,
    setCurrentStep,
    currentSectionIndex,
    setCurrentSectionIndex,
    reset,
  };
}
