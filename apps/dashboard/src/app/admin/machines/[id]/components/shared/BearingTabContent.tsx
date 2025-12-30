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
  onHasBeenAdjustedClear?: () => void;
  hasBeenAdjustedId: string;

  // Metadata fields (Combined With + Mating Part)
  combinedWith: string;
  onCombinedWithChange: (value: string) => void;
  matingPart: MatingPartType | undefined;
  onMatingPartChange: (value: MatingPartType) => void;
  onMatingPartClear?: () => void;
  metadataPrefix: string; // e.g., 'outer', 'inner'

  // BearingClearanceForm props
  bearingData: BearingClearanceData;
  updateFn: (
    field: keyof BearingClearanceData,
    value: string | number | boolean | undefined,
  ) => void;
  errors: Partial<Record<keyof BearingClearanceData, string>>;
  handleBlur: (field: keyof BearingClearanceData) => void;
}

export function BearingTabContent({
  hasBeenAdjusted,
  onHasBeenAdjustedChange,
  onHasBeenAdjustedClear,
  hasBeenAdjustedId,
  combinedWith,
  onCombinedWithChange,
  matingPart,
  onMatingPartChange,
  onMatingPartClear,
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
          onClear={onHasBeenAdjustedClear}
          id={hasBeenAdjustedId}
        />

        <BearingMetadataFields
          combinedWithValue={combinedWith}
          onCombinedWithChange={onCombinedWithChange}
          matingPartValue={matingPart}
          onMatingPartChange={onMatingPartChange}
          onMatingPartClear={onMatingPartClear}
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
