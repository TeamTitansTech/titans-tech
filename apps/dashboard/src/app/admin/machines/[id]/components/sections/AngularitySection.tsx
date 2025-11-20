'use client';

import { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { ServiceType } from '@/data/types/services.types';
import { AngularityForm, AngularityFormData, AngularityFormHandle } from '../forms/AngularityForm';

export interface AngularitySectionData {
  // Metadata
  sizeTonnage?: string;
  serialNumber?: string;
  stroke?: string;
  spm?: string;

  // Setup
  distanceIndicatorTipFromSlide?: string;
  locationOfIndicator?: string;
  counterbalancePressure?: string;

  // Configuration
  partOfStrokeBeingRead?: string;
  shutheightSetAt?: string;
  whatWasUsedAsSquare?: string;
  whereWasSquarePlaced?: string;

  // Indicator details
  whatIndicatorWasUsed?: string;
  whatKindOfTipWasOnIndicator?: string;
  totalLiftCheck?: string;

  // Perpendicularity
  hasPerpendicularityBeenAdjusted?: 'YES' | 'NO' | 'DNC';

  // Before/After measurements
  beforeFr?: number;
  beforeLr?: number;
  afterFr?: number;
  afterLr?: number;

  // Notes
  notes?: string;
}

export interface AngularitySectionRef {
  getData: () => AngularitySectionData;
  validate: (serviceType: ServiceType) => string[];
  reset: () => void;
  isTouched: () => boolean;
  validateAndGetData: (serviceType: ServiceType) => {
    isValid: boolean;
    errors: string[];
    data?: AngularitySectionData;
  };
}

interface AngularitySectionProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSectionTouched?: () => void;
  initialData?: AngularitySectionData;
}

export const AngularitySection = forwardRef<AngularitySectionRef, AngularitySectionProps>(
  ({ isOpen: _isOpen, onOpenChange: _onOpenChange, onSectionTouched, initialData }, ref) => {
    const formRef = useRef<AngularityFormHandle>(null);
    const [initialFormData] = useState<AngularitySectionData | undefined>(initialData);

    // Track if the form has been touched by wrapping onSectionTouched
    const handleFormChange = () => {
      onSectionTouched?.();
    };

    useImperativeHandle(ref, () => ({
      isTouched: (): boolean => {
        return formRef.current?.isTouched() || false;
      },

      getData: (): AngularitySectionData => {
        const formData = formRef.current?.getData();
        return formData || {};
      },

      validate: (_serviceType: ServiceType): string[] => {
        const formData = formRef.current?.getData();
        const validationErrors: string[] = [];

        // Check if any data was entered
        const hasAnyData =
          formData &&
          (formData.beforeFr !== undefined ||
            formData.beforeLr !== undefined ||
            formData.afterFr !== undefined ||
            formData.afterLr !== undefined ||
            formData.sizeTonnage ||
            formData.serialNumber ||
            formData.notes);

        // If no data at all, require at least measurements
        if (!hasAnyData && formRef.current?.isTouched()) {
          validationErrors.push(
            'Angularity: Please enter at least one measurement or configuration detail',
          );
        }

        return validationErrors;
      },

      reset: () => {
        formRef.current?.reset();
      },

      validateAndGetData: (
        serviceType: ServiceType,
      ): { isValid: boolean; errors: string[]; data?: AngularitySectionData } => {
        const validationErrors: string[] = [];
        const formData = formRef.current?.getData();

        // Check if any data was entered
        const hasAnyData =
          formData &&
          (formData.beforeFr !== undefined ||
            formData.beforeLr !== undefined ||
            formData.afterFr !== undefined ||
            formData.afterLr !== undefined ||
            formData.sizeTonnage ||
            formData.serialNumber ||
            formData.notes);

        // If section was touched but no meaningful data entered
        if (formRef.current?.isTouched() && !hasAnyData) {
          validationErrors.push(
            'Angularity: Please enter at least one measurement or configuration detail',
          );
        }

        const isValid = validationErrors.length === 0;

        if (isValid && formData) {
          return {
            isValid: true,
            errors: [],
            data: formData,
          };
        }

        return {
          isValid: false,
          errors: validationErrors,
        };
      },
    }));

    return (
      <div className="space-y-4">
        <AngularityForm ref={formRef} data={initialFormData} />
      </div>
    );
  },
);

AngularitySection.displayName = 'AngularitySection';
