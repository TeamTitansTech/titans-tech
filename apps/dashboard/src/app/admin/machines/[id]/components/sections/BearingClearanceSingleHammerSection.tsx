'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { useTranslations } from 'next-intl';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChevronDown } from 'lucide-react';
import {
  type BearingClearanceData,
  type Attachment,
  ServiceType,
  YesNoNaDncType,
} from '@/data/types/services.types';
import { BearingTabContent } from '../shared/BearingTabContent';
import { ShutdownAdjustmentFields } from '../shared/ShutdownAdjustmentFields';
import { isDataTouched } from './utils';
import { buildBearingFields, sanitizeBearingDataForSubmission } from './bearingClearanceUtils';
import { DocumentUpload } from '@/components/ui/document-upload';
import { Typography } from '@/components/ui/typography';

// Default data structure - numeric fields default to undefined to show empty inputs
export const defaultBearingData: BearingClearanceData = {
  totalClearance_RH: undefined,
  totalClearance_LH: undefined,
  mainBearings_RH: undefined,
  mainBearings_LH: undefined,
  upperConnectionBearings_RH: undefined,
  upperConnectionBearings_LH: undefined,
  wristPinToMatingPart_RH: undefined,
  wristPinToMatingPart_LH: undefined,
  wristPinToBushing_RH: undefined,
  wristPinToBushing_LH: undefined,
  slideAdjNutToScrewSleeve_RH: undefined,
  slideAdjNutToScrewSleeve_LH: undefined,
  extraDoubleLockOpen_RH: undefined,
  extraDoubleLockOpen_LH: undefined,
  ballBoxArea_RH: undefined,
  ballBoxArea_LH: undefined,
  hasBeenAdjusted: undefined,
  combinedWith: '',
  matingPart: undefined,
};

// Required fields for validation - only totalClearance (LH or RH) is required
const ALERT_FIELD_PAIRS: {
  key: string;
  lh: keyof BearingClearanceData;
  rh: keyof BearingClearanceData;
}[] = [{ key: 'totalClearance', lh: 'totalClearance_LH', rh: 'totalClearance_RH' }];

const ALERT_REQUIRED_FIELDS = ALERT_FIELD_PAIRS.map((pair) => pair.key);

// Helper to check if a value is filled
const isValueFilled = (value: unknown): boolean => {
  return value !== undefined && value !== null && !(typeof value === 'number' && isNaN(value));
};

// Validation function
export const validateBearingClearanceData = (data: BearingClearanceData): string[] => {
  const missingFields: string[] = [];

  ALERT_FIELD_PAIRS.forEach(({ key, lh, rh }) => {
    const lhValue = data[lh];
    const rhValue = data[rh];
    if (!isValueFilled(lhValue) && !isValueFilled(rhValue)) {
      missingFields.push(key);
    }
  });

  return missingFields;
};

export interface BearingClearanceSingleHammerSectionData {
  beforeData?: BearingClearanceData;
  data?: BearingClearanceData;
  attachments?: Attachment[];
}

export interface BearingClearanceSingleHammerSectionRef {
  getData: () => BearingClearanceSingleHammerSectionData;
  validate: (serviceType: ServiceType) => string[];
  validateAndGetData: (serviceType: ServiceType) => {
    isValid: boolean;
    errors: string[];
    data?: BearingClearanceSingleHammerSectionData;
  };
  reset: () => void;
  isTouched: () => boolean;
}

interface BearingClearanceSingleHammerSectionProps {
  onSectionTouched: () => void;
  serviceType: ServiceType;
  initialData?: BearingClearanceSingleHammerSectionData;
}

export const BearingClearanceSingleHammerSection = forwardRef<
  BearingClearanceSingleHammerSectionRef,
  BearingClearanceSingleHammerSectionProps
>(({ onSectionTouched, serviceType, initialData }, ref) => {
  const t = useTranslations('inspections');

  // Initial data
  const initialBeforeData = initialData?.beforeData || defaultBearingData;
  const initialAfterData = initialData?.data || defaultBearingData;

  // State
  const [includeBeforeMeasurements, setIncludeBeforeMeasurements] = useState(
    !!initialData?.beforeData,
  );
  const [beforeData, setBeforeData] = useState<BearingClearanceData>(initialBeforeData);
  const [afterData, setAfterData] = useState<BearingClearanceData>(initialAfterData);

  // Metadata state
  const [beforeHasBeenAdjusted, setBeforeHasBeenAdjusted] = useState<YesNoNaDncType | undefined>(
    initialBeforeData.hasBeenAdjusted as YesNoNaDncType | undefined,
  );
  const [afterHasBeenAdjusted, setAfterHasBeenAdjusted] = useState<YesNoNaDncType | undefined>(
    initialAfterData.hasBeenAdjusted as YesNoNaDncType | undefined,
  );
  const [combinedWith, setCombinedWith] = useState(initialAfterData.combinedWith || '');
  const [matingPart, setMatingPart] = useState(initialAfterData.matingPart);

  // Shutdown adjustment fields
  const [slideMotorMounts, setSlideMotorMounts] = useState(initialAfterData.slideMotorMounts);
  const [powerCordHoses, setPowerCordHoses] = useState(initialAfterData.powerCordHoses);
  const [chainsGearsSprockets, setChainsGearsSprockets] = useState(
    initialAfterData.chainsGearsSprockets,
  );
  const [lockingClamps, setLockingClamps] = useState(initialAfterData.lockingClamps);
  const [notes, setNotes] = useState(initialAfterData.notes || '');
  const [attachments, setAttachments] = useState<Attachment[]>(initialData?.attachments ?? []);

  // Errors
  const [beforeErrors, setBeforeErrors] = useState<Record<string, string>>({});
  const [afterErrors, setAfterErrors] = useState<Record<string, string>>({});

  // UI state
  const [isBeforeOpen, setIsBeforeOpen] = useState(true);
  const [isAfterOpen, setIsAfterOpen] = useState(true);

  // Update functions
  const updateBeforeField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean | undefined,
  ) => {
    setBeforeData((prev) => ({ ...prev, [field]: value }));
    onSectionTouched();
  };

  const updateAfterField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean | undefined,
  ) => {
    setAfterData((prev) => ({ ...prev, [field]: value }));
    onSectionTouched();
  };

  // Blur handlers
  const handleBlurBefore = (field: keyof BearingClearanceData) => {
    const value = beforeData[field];
    if (value !== undefined && value !== null && value !== '') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        setBeforeErrors((prev) => ({ ...prev, [field]: t('form.error.invalidNumber') }));
      } else {
        setBeforeErrors((prev) => ({ ...prev, [field]: '' }));
      }
    } else {
      setBeforeErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleBlurAfter = (field: keyof BearingClearanceData) => {
    const value = afterData[field];
    if (value !== undefined && value !== null && value !== '') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        setAfterErrors((prev) => ({ ...prev, [field]: t('form.error.invalidNumber') }));
      } else {
        setAfterErrors((prev) => ({ ...prev, [field]: '' }));
      }
    } else {
      setAfterErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const reset = () => {
    setBeforeData(defaultBearingData);
    setAfterData(defaultBearingData);
    setBeforeHasBeenAdjusted(undefined);
    setAfterHasBeenAdjusted(undefined);
    setCombinedWith('');
    setMatingPart(undefined);
    setSlideMotorMounts(undefined);
    setPowerCordHoses(undefined);
    setChainsGearsSprockets(undefined);
    setLockingClamps(undefined);
    setNotes('');
    setAttachments([]);
    setIncludeBeforeMeasurements(false);
    setBeforeErrors({});
    setAfterErrors({});
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getData: (): BearingClearanceSingleHammerSectionData => {
      const beforeTouched = isDataTouched(beforeData, initialBeforeData);
      const afterTouched = isDataTouched(afterData, initialAfterData);

      const sharedFields = {
        slideMotorMounts,
        powerCordHoses,
        chainsGearsSprockets,
        lockingClamps,
        notes,
      };

      const beforeFields = buildBearingFields(
        {
          hasBeenAdjusted: beforeHasBeenAdjusted || YesNoNaDncType.NO,
          combinedWith,
          matingPart,
        },
        sharedFields,
      );

      const afterFields = buildBearingFields(
        {
          hasBeenAdjusted: afterHasBeenAdjusted || YesNoNaDncType.NO,
          combinedWith,
          matingPart,
        },
        sharedFields,
      );

      return {
        beforeData:
          includeBeforeMeasurements && beforeTouched
            ? { ...beforeData, ...beforeFields }
            : undefined,
        data: afterTouched ? { ...afterData, ...afterFields } : undefined,
        attachments,
      };
    },

    validate: (serviceType: ServiceType): string[] => {
      const errors: string[] = [];
      const v = t.raw('form.bearingClearance.validation') as Record<string, string>;
      const fields = t.raw('form.bearingClearance.fields') as Record<string, string>;

      const getFieldName = (fieldKey: string) => fields[fieldKey] || fieldKey;

      const beforeTouched = isDataTouched(beforeData, initialBeforeData);
      const afterTouched = isDataTouched(afterData, initialAfterData);

      // Validate before measurements if checkbox is enabled
      if (includeBeforeMeasurements && serviceType === ServiceType.MAINTENANCE) {
        if (!beforeTouched) {
          errors.push(v.beforeMeasurementsRequired);
        }
      }

      // Collect missing fields
      const missingFieldsList: string[] = [];

      const hasData = afterTouched || isDataTouched(initialAfterData, defaultBearingData);

      if (hasData) {
        const dataToValidate = afterTouched ? afterData : initialAfterData;
        const missing = validateBearingClearanceData(dataToValidate);
        missing.forEach((fieldKey) => {
          missingFieldsList.push(getFieldName(fieldKey));
        });
        if (!afterHasBeenAdjusted) {
          missingFieldsList.push(getFieldName('hasBeenAdjusted'));
        }
      } else {
        ALERT_REQUIRED_FIELDS.forEach((fieldKey) => {
          missingFieldsList.push(getFieldName(String(fieldKey)));
        });
        missingFieldsList.push(getFieldName('hasBeenAdjusted'));
      }

      if (missingFieldsList.length > 0) {
        const numberedList = missingFieldsList
          .map((field, index) => `${index + 1}) ${field}`)
          .join('\n');
        errors.push(`${v.sectionHeader}\n${numberedList}`);
      }

      return errors;
    },

    reset,

    isTouched: (): boolean => {
      const beforeTouched = isDataTouched(beforeData, initialBeforeData);
      const afterTouched = isDataTouched(afterData, initialAfterData);
      return beforeTouched || afterTouched;
    },

    validateAndGetData: (
      serviceType: ServiceType,
    ): { isValid: boolean; errors: string[]; data?: BearingClearanceSingleHammerSectionData } => {
      const errors: string[] = [];
      const v = t.raw('form.bearingClearance.validation') as Record<string, string>;
      const fields = t.raw('form.bearingClearance.fields') as Record<string, string>;

      const getFieldName = (fieldKey: string) => fields[fieldKey] || fieldKey;

      const beforeTouched = isDataTouched(beforeData, initialBeforeData);
      const afterTouched = isDataTouched(afterData, initialAfterData);

      if (includeBeforeMeasurements && serviceType === ServiceType.MAINTENANCE) {
        if (!beforeTouched) {
          errors.push(v.beforeMeasurementsRequired);
        }
      }

      const missingFieldsList: string[] = [];
      const hasData = afterTouched || isDataTouched(initialAfterData, defaultBearingData);

      if (hasData) {
        const dataToValidate = afterTouched ? afterData : initialAfterData;
        const missing = validateBearingClearanceData(dataToValidate);
        missing.forEach((fieldKey) => {
          missingFieldsList.push(getFieldName(fieldKey));
        });
        if (!afterHasBeenAdjusted) {
          missingFieldsList.push(getFieldName('hasBeenAdjusted'));
        }
      } else {
        ALERT_REQUIRED_FIELDS.forEach((fieldKey) => {
          missingFieldsList.push(getFieldName(String(fieldKey)));
        });
        missingFieldsList.push(getFieldName('hasBeenAdjusted'));
      }

      if (missingFieldsList.length > 0) {
        const numberedList = missingFieldsList
          .map((field, index) => `${index + 1}) ${field}`)
          .join('\n');
        errors.push(`${v.sectionHeader}\n${numberedList}`);
      }

      if (errors.length > 0) {
        return { isValid: false, errors };
      }

      const sharedFields = {
        slideMotorMounts,
        powerCordHoses,
        chainsGearsSprockets,
        lockingClamps,
        notes,
      };

      const beforeFields = buildBearingFields(
        {
          hasBeenAdjusted: beforeHasBeenAdjusted || YesNoNaDncType.NO,
          combinedWith,
          matingPart,
        },
        sharedFields,
      );

      const afterFields = buildBearingFields(
        {
          hasBeenAdjusted: afterHasBeenAdjusted || YesNoNaDncType.NO,
          combinedWith,
          matingPart,
        },
        sharedFields,
      );

      const data: BearingClearanceSingleHammerSectionData = {
        beforeData:
          includeBeforeMeasurements && beforeTouched
            ? sanitizeBearingDataForSubmission({ ...beforeData, ...beforeFields })
            : undefined,
        data: hasData
          ? sanitizeBearingDataForSubmission({
              ...(afterTouched ? afterData : initialAfterData),
              ...afterFields,
            })
          : undefined,
        attachments,
      };

      return { isValid: true, errors: [], data };
    },
  }));

  return (
    <div className="space-y-6">
      {/* Include Before Measurements Checkbox - Only for Maintenance */}
      {serviceType === ServiceType.MAINTENANCE && (
        <div className="flex items-center space-x-2 pb-4 border-b">
          <Checkbox
            id="includeBeforeMeasurements"
            checked={includeBeforeMeasurements}
            onCheckedChange={(checked) => {
              setIncludeBeforeMeasurements(Boolean(checked));
              onSectionTouched();
            }}
          />
          <Label
            htmlFor="includeBeforeMeasurements"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t('form.bearingClearanceSection.includeBeforeMeasurements')}
          </Label>
        </div>
      )}

      {includeBeforeMeasurements ? (
        <div className="space-y-8">
          {/* Before Maintenance Section */}
          <Collapsible open={isBeforeOpen} onOpenChange={setIsBeforeOpen}>
            <div className="space-y-4">
              <CollapsibleTrigger className="flex items-center justify-between w-full group">
                <h4 className="text-lg font-semibold">
                  {t('form.bearingClearanceSection.beforeMaintenance')}
                </h4>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isBeforeOpen ? '' : 'rotate-180'
                  }`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <BearingTabContent
                  hasBeenAdjusted={beforeHasBeenAdjusted}
                  onHasBeenAdjustedChange={(value) => {
                    setBeforeHasBeenAdjusted(value);
                    onSectionTouched();
                  }}
                  hasBeenAdjustedId="beforeHasBeenAdjusted"
                  combinedWith={combinedWith}
                  onCombinedWithChange={(value) => {
                    setCombinedWith(value);
                    onSectionTouched();
                  }}
                  matingPart={matingPart}
                  onMatingPartChange={(value) => {
                    setMatingPart(value);
                    onSectionTouched();
                  }}
                  metadataPrefix="before"
                  bearingData={beforeData}
                  updateFn={updateBeforeField}
                  errors={beforeErrors}
                  handleBlur={handleBlurBefore}
                />
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Divider */}
          <div className="border-t-2 border-border" />

          {/* After Maintenance Section */}
          <Collapsible open={isAfterOpen} onOpenChange={setIsAfterOpen}>
            <div className="space-y-4">
              <CollapsibleTrigger className="flex items-center justify-between w-full group">
                <h4 className="text-lg font-semibold">
                  {t('form.bearingClearanceSection.afterMaintenance')}
                </h4>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isAfterOpen ? '' : 'rotate-180'
                  }`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <BearingTabContent
                  hasBeenAdjusted={afterHasBeenAdjusted}
                  onHasBeenAdjustedChange={(value) => {
                    setAfterHasBeenAdjusted(value);
                    onSectionTouched();
                  }}
                  hasBeenAdjustedId="afterHasBeenAdjusted"
                  combinedWith={combinedWith}
                  onCombinedWithChange={(value) => {
                    setCombinedWith(value);
                    onSectionTouched();
                  }}
                  matingPart={matingPart}
                  onMatingPartChange={(value) => {
                    setMatingPart(value);
                    onSectionTouched();
                  }}
                  metadataPrefix="after"
                  bearingData={afterData}
                  updateFn={updateAfterField}
                  errors={afterErrors}
                  handleBlur={handleBlurAfter}
                />
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>
      ) : (
        <BearingTabContent
          hasBeenAdjusted={afterHasBeenAdjusted}
          onHasBeenAdjustedChange={(value) => {
            setAfterHasBeenAdjusted(value);
            onSectionTouched();
          }}
          hasBeenAdjustedId="afterHasBeenAdjustedRegular"
          combinedWith={combinedWith}
          onCombinedWithChange={(value) => {
            setCombinedWith(value);
            onSectionTouched();
          }}
          matingPart={matingPart}
          onMatingPartChange={(value) => {
            setMatingPart(value);
            onSectionTouched();
          }}
          metadataPrefix="single"
          bearingData={afterData}
          updateFn={updateAfterField}
          errors={afterErrors}
          handleBlur={handleBlurAfter}
        />
      )}

      {/* Shared Fields - Shutdown Adjustment Mechanism */}
      <ShutdownAdjustmentFields
        slideMotorMounts={slideMotorMounts}
        onSlideMotorMountsChange={(value) => {
          setSlideMotorMounts(value);
          onSectionTouched();
        }}
        powerCordHoses={powerCordHoses}
        onPowerCordHosesChange={(value) => {
          setPowerCordHoses(value);
          onSectionTouched();
        }}
        chainsGearsSprockets={chainsGearsSprockets}
        onChainsGearsSprocketsChange={(value) => {
          setChainsGearsSprockets(value);
          onSectionTouched();
        }}
        lockingClamps={lockingClamps}
        onLockingClampsChange={(value) => {
          setLockingClamps(value);
          onSectionTouched();
        }}
        notes={notes}
        onNotesChange={(value) => {
          setNotes(value);
          onSectionTouched();
        }}
      />

      {/* Attachments */}
      <div className="pt-4 border-t">
        <Typography variant="h4" className="mb-3">
          {t('form.common.attachments')}
        </Typography>
        <DocumentUpload
          value={attachments}
          onChange={(files) => {
            setAttachments(files);
            onSectionTouched();
          }}
          maxFiles={10}
        />
      </div>
    </div>
  );
});

BearingClearanceSingleHammerSection.displayName = 'BearingClearanceSingleHammerSection';
