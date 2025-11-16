'use client';

import { BearingClearanceForm } from '../forms/BearingClearanceForm';
import { HasBeenAdjustedSelect } from './HasBeenAdjustedSelect';
import { BearingMetadataFields } from './BearingMetadataFields';
import {
  type BearingClearanceData,
  YesNoNaDncType,
  MatingPartType,
} from '@/data/types/services.types';

interface BearingTabContentProps {
  // "Foi Ajustado" field
  hasBeenAdjusted: YesNoNaDncType | undefined;
  onHasBeenAdjustedChange: (value: YesNoNaDncType) => void;
  hasBeenAdjustedId: string;

  // Metadata fields (Combined With + Mating Part)
  combinedWith: string;
  onCombinedWithChange: (value: string) => void;
  matingPart: MatingPartType | undefined;
  onMatingPartChange: (value: MatingPartType) => void;
  metadataPrefix: string; // e.g., 'outer', 'inner'

  // BearingClearanceForm props
  bearingData: BearingClearanceData;
  updateFn: (field: keyof BearingClearanceData, value: string | number | boolean) => void;
  errors: Partial<Record<keyof BearingClearanceData, string>>;
  handleBlur: (field: keyof BearingClearanceData) => void;
}

export function BearingTabContent({
  hasBeenAdjusted,
  onHasBeenAdjustedChange,
  hasBeenAdjustedId,
  combinedWith,
  onCombinedWithChange,
  matingPart,
  onMatingPartChange,
  metadataPrefix,
  bearingData,
  updateFn,
  errors,
  handleBlur,
}: BearingTabContentProps) {
  return (
    <>
      <div className="pt-6 border-t">
        <HasBeenAdjustedSelect
          value={hasBeenAdjusted}
          onValueChange={onHasBeenAdjustedChange}
          id={hasBeenAdjustedId}
        />

        <BearingMetadataFields
          combinedWithValue={combinedWith}
          onCombinedWithChange={onCombinedWithChange}
          matingPartValue={matingPart}
          onMatingPartChange={onMatingPartChange}
          prefix={metadataPrefix}
        />
      </div>
      <BearingClearanceForm
        title=""
        data={bearingData}
        updateFn={updateFn}
        errors={errors}
        handleBlur={handleBlur}
      />
    </>
  );
}
