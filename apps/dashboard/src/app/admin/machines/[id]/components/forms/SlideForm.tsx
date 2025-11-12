'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Check, AlertCircle } from 'lucide-react';
import {
  type SlideData,
  ServiceType,
  ParallelismType,
  YesNoNaDncType,
  YesNoDncType,
} from '@/data/types/services.types';

interface SlideFormData {
  outerBeforeData: SlideData;
  outerAfterData: SlideData;
  innerBeforeData: SlideData;
  innerAfterData: SlideData;
  parallelism: ParallelismType;
  hasParallelismBeenAdjusted: YesNoNaDncType;
  outerShutheightIndicatorsChecked: YesNoDncType;
  outerOverloadsOnTonnageMonitor: string;
  outerShutheightActualSh: string;
  outerIndicatorReading: string;
  innerShutheightIndicatorsChecked: YesNoDncType;
  innerOverloadsOnTonnageMonitor: string;
  innerShutheightActualSh: string;
  innerIndicatorReading: string;
  notes: string;
}

export interface SlideFormProps {
  data: SlideFormData;
  updateFn: <K extends keyof SlideFormData>(field: K, value: SlideFormData[K]) => void;
  errors: {
    outerBefore: Record<string, string>;
    outerAfter: Record<string, string>;
    innerBefore: Record<string, string>;
    innerAfter: Record<string, string>;
  };
  handleBlur: (
    section: 'outerBefore' | 'outerAfter' | 'innerBefore' | 'innerAfter',
    field: keyof SlideData,
  ) => void;
  serviceType: ServiceType;
  onSectionTouched?: () => void;
  includeBeforeMeasurements: boolean;
  onIncludeBeforeMeasurementsChange: (value: boolean) => void;
  onValidate?: (isValid: boolean, errors: string[]) => void;
  onClose?: () => void;
}

function PositionFields({
  data,
  updateFn,
  errors,
  handleBlur,
  title,
}: {
  data: SlideData;
  updateFn: (field: keyof SlideData, value: number) => void;
  errors: Record<string, string>;
  handleBlur: (field: keyof SlideData) => void;
  title: string;
}) {
  const t = useTranslations('inspections.form.slide');

  // Calculate max deviation: MAX - MIN of positions 1-5 if more than 1 value exists
  const calculateMaxDeviation = (): string => {
    const positions = [
      data.position1,
      data.position2,
      data.position3,
      data.position4,
      data.position5,
    ];
    const validValues = positions.filter(
      (val) => val !== undefined && val !== null && !isNaN(val) && val !== 0,
    );

    if (validValues.length > 1) {
      const max = Math.max(...validValues);
      const min = Math.min(...validValues);
      return (max - min).toFixed(4);
    }
    return '';
  };

  return (
    <div className="space-y-4">
      <h5 className="font-medium text-sm">{title}</h5>

      {/* Big screens: 4 columns + deviation */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-2">
        {/* Row 1: position1, position2, position3, deviation label */}
        <div>
          <Input
            id={`position1-${title}`}
            type="number"
            step="0.0001"
            min="0"
            max="999999.9999"
            value={data.position1}
            onChange={(e) => updateFn('position1', Number(e.target.value))}
            onBlur={() => handleBlur('position1')}
            className={errors.position1 ? 'border-destructive' : ''}
            required
          />
          {errors.position1 && <p className="text-xs text-destructive mt-1">{errors.position1}</p>}
        </div>
        <div>
          <Input
            id={`position2-${title}`}
            type="number"
            step="0.0001"
            min="0"
            max="999999.9999"
            value={data.position2}
            onChange={(e) => updateFn('position2', Number(e.target.value))}
            onBlur={() => handleBlur('position2')}
            className={errors.position2 ? 'border-destructive' : ''}
            required
          />
          {errors.position2 && <p className="text-xs text-destructive mt-1">{errors.position2}</p>}
        </div>
        <div>
          <Input
            id={`position3-${title}`}
            type="number"
            step="0.0001"
            min="0"
            max="999999.9999"
            value={data.position3}
            onChange={(e) => updateFn('position3', Number(e.target.value))}
            onBlur={() => handleBlur('position3')}
            className={errors.position3 ? 'border-destructive' : ''}
            required
          />
          {errors.position3 && <p className="text-xs text-destructive mt-1">{errors.position3}</p>}
        </div>
        <div>
          <Input
            type="text"
            value={t('maxDeviation')}
            disabled
            className="bg-muted text-center font-medium"
            readOnly
          />
        </div>

        {/* Row 2: position4, position5, empty, deviation calc */}
        <div>
          <Input
            id={`position4-${title}`}
            type="number"
            step="0.0001"
            min="0"
            max="999999.9999"
            value={data.position4}
            onChange={(e) => updateFn('position4', Number(e.target.value))}
            onBlur={() => handleBlur('position4')}
            className={errors.position4 ? 'border-destructive' : ''}
            required
          />
          {errors.position4 && <p className="text-xs text-destructive mt-1">{errors.position4}</p>}
        </div>
        <div>
          <Input
            id={`position5-${title}`}
            type="number"
            step="0.0001"
            min="0"
            max="999999.9999"
            value={data.position5}
            onChange={(e) => updateFn('position5', Number(e.target.value))}
            onBlur={() => handleBlur('position5')}
            className={errors.position5 ? 'border-destructive' : ''}
            required
          />
          {errors.position5 && <p className="text-xs text-destructive mt-1">{errors.position5}</p>}
        </div>
        <div></div>
        <div>
          <Input
            type="text"
            value={calculateMaxDeviation()}
            disabled
            className="bg-muted text-center font-medium"
            readOnly
          />
        </div>
      </div>

      {/* Medium screens: 3 columns */}
      <div className="hidden md:grid lg:hidden md:grid-cols-3 gap-2">
        {/* Row 1: position1, position2, deviation label */}
        <div>
          <Input
            id={`position1-${title}-md`}
            type="number"
            step="0.0001"
            min="0"
            max="999999.9999"
            value={data.position1}
            onChange={(e) => updateFn('position1', Number(e.target.value))}
            onBlur={() => handleBlur('position1')}
            className={errors.position1 ? 'border-destructive' : ''}
            required
          />
          {errors.position1 && <p className="text-xs text-destructive mt-1">{errors.position1}</p>}
        </div>
        <div>
          <Input
            id={`position2-${title}-md`}
            type="number"
            step="0.0001"
            min="0"
            max="999999.9999"
            value={data.position2}
            onChange={(e) => updateFn('position2', Number(e.target.value))}
            onBlur={() => handleBlur('position2')}
            className={errors.position2 ? 'border-destructive' : ''}
            required
          />
          {errors.position2 && <p className="text-xs text-destructive mt-1">{errors.position2}</p>}
        </div>
        <div>
          <Input
            type="text"
            value={t('maxDeviation')}
            disabled
            className="bg-muted text-center font-medium"
            readOnly
          />
        </div>

        {/* Row 2: position3, position4, deviation calc */}
        <div>
          <Input
            id={`position3-${title}-md`}
            type="number"
            step="0.0001"
            min="0"
            max="999999.9999"
            value={data.position3}
            onChange={(e) => updateFn('position3', Number(e.target.value))}
            onBlur={() => handleBlur('position3')}
            className={errors.position3 ? 'border-destructive' : ''}
            required
          />
          {errors.position3 && <p className="text-xs text-destructive mt-1">{errors.position3}</p>}
        </div>
        <div>
          <Input
            id={`position4-${title}-md`}
            type="number"
            step="0.0001"
            min="0"
            max="999999.9999"
            value={data.position4}
            onChange={(e) => updateFn('position4', Number(e.target.value))}
            onBlur={() => handleBlur('position4')}
            className={errors.position4 ? 'border-destructive' : ''}
            required
          />
          {errors.position4 && <p className="text-xs text-destructive mt-1">{errors.position4}</p>}
        </div>
        <div>
          <Input
            type="text"
            value={calculateMaxDeviation()}
            disabled
            className="bg-muted text-center font-medium"
            readOnly
          />
        </div>

        {/* Row 3: position5 */}
        <div>
          <Input
            id={`position5-${title}-md`}
            type="number"
            step="0.0001"
            min="0"
            max="999999.9999"
            value={data.position5}
            onChange={(e) => updateFn('position5', Number(e.target.value))}
            onBlur={() => handleBlur('position5')}
            className={errors.position5 ? 'border-destructive' : ''}
            required
          />
          {errors.position5 && <p className="text-xs text-destructive mt-1">{errors.position5}</p>}
        </div>
      </div>

      {/* Small screens: 2 columns */}
      <div className="grid md:hidden grid-cols-2 gap-2">
        {/* Row 1: position1, position2 */}
        <div>
          <Input
            id={`position1-${title}-sm`}
            type="number"
            step="0.0001"
            min="0"
            max="999999.9999"
            value={data.position1}
            onChange={(e) => updateFn('position1', Number(e.target.value))}
            onBlur={() => handleBlur('position1')}
            className={errors.position1 ? 'border-destructive' : ''}
            required
          />
          {errors.position1 && <p className="text-xs text-destructive mt-1">{errors.position1}</p>}
        </div>
        <div>
          <Input
            id={`position2-${title}-sm`}
            type="number"
            step="0.0001"
            min="0"
            max="999999.9999"
            value={data.position2}
            onChange={(e) => updateFn('position2', Number(e.target.value))}
            onBlur={() => handleBlur('position2')}
            className={errors.position2 ? 'border-destructive' : ''}
            required
          />
          {errors.position2 && <p className="text-xs text-destructive mt-1">{errors.position2}</p>}
        </div>

        {/* Row 2: position3, position4 */}
        <div>
          <Input
            id={`position3-${title}-sm`}
            type="number"
            step="0.0001"
            min="0"
            max="999999.9999"
            value={data.position3}
            onChange={(e) => updateFn('position3', Number(e.target.value))}
            onBlur={() => handleBlur('position3')}
            className={errors.position3 ? 'border-destructive' : ''}
            required
          />
          {errors.position3 && <p className="text-xs text-destructive mt-1">{errors.position3}</p>}
        </div>
        <div>
          <Input
            id={`position4-${title}-sm`}
            type="number"
            step="0.0001"
            min="0"
            max="999999.9999"
            value={data.position4}
            onChange={(e) => updateFn('position4', Number(e.target.value))}
            onBlur={() => handleBlur('position4')}
            className={errors.position4 ? 'border-destructive' : ''}
            required
          />
          {errors.position4 && <p className="text-xs text-destructive mt-1">{errors.position4}</p>}
        </div>

        {/* Row 3: position5, empty */}
        <div>
          <Input
            id={`position5-${title}-sm`}
            type="number"
            step="0.0001"
            min="0"
            max="999999.9999"
            value={data.position5}
            onChange={(e) => updateFn('position5', Number(e.target.value))}
            onBlur={() => handleBlur('position5')}
            className={errors.position5 ? 'border-destructive' : ''}
            required
          />
          {errors.position5 && <p className="text-xs text-destructive mt-1">{errors.position5}</p>}
        </div>
        <div></div>

        {/* Row 4: deviation label, deviation calc */}
        <div>
          <Input
            type="text"
            value={t('maxDeviation')}
            disabled
            className="bg-muted text-center font-medium"
            readOnly
          />
        </div>
        <div>
          <Input
            type="text"
            value={calculateMaxDeviation()}
            disabled
            className="bg-muted text-center font-medium"
            readOnly
          />
        </div>
      </div>
    </div>
  );
}

function ShutheightFields({
  type,
  data,
  handleFieldUpdate,
}: {
  type: 'outer' | 'inner';
  data: SlideFormData;
  handleFieldUpdate: (field: keyof SlideFormData, value: string | YesNoDncType) => void;
}) {
  const t = useTranslations('inspections.form.slide');
  const isOuter = type === 'outer';
  const indicatorsField = isOuter
    ? 'outerShutheightIndicatorsChecked'
    : 'innerShutheightIndicatorsChecked';
  const overloadsField = isOuter
    ? 'outerOverloadsOnTonnageMonitor'
    : 'innerOverloadsOnTonnageMonitor';
  const actualShField = isOuter ? 'outerShutheightActualSh' : 'innerShutheightActualSh';
  const indicatorReadingField = isOuter ? 'outerIndicatorReading' : 'innerIndicatorReading';

  const indicatorsValue = data[indicatorsField] as YesNoDncType;
  const overloadsValue = data[overloadsField] as string;
  const actualShValue = data[actualShField] as string;
  const indicatorReadingValue = data[indicatorReadingField] as string;

  return (
    <div className="space-y-4 mt-6">
      <h5 className="font-medium text-sm">{t('shutheightInformation')}</h5>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={indicatorsField} className="text-xs">
            {t('indicatorsChecked')}
          </Label>
          <Select
            value={indicatorsValue}
            onValueChange={(value) => handleFieldUpdate(indicatorsField, value as YesNoDncType)}
          >
            <SelectTrigger id={indicatorsField} className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={YesNoDncType.YES}>Yes</SelectItem>
              <SelectItem value={YesNoDncType.NO}>No</SelectItem>
              <SelectItem value={YesNoDncType.DNC}>DNC</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor={overloadsField} className="text-xs">
            {t('overloadsOnTonnageMonitor')}
          </Label>
          <Input
            id={overloadsField}
            type="text"
            value={overloadsValue}
            onChange={(e) => handleFieldUpdate(overloadsField, e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor={actualShField} className="text-xs">
            {t('actualSH')}
          </Label>
          <Input
            id={actualShField}
            type="text"
            value={actualShValue}
            onChange={(e) => handleFieldUpdate(actualShField, e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor={indicatorReadingField} className="text-xs">
            {t('indicatorReading')}
          </Label>
          <Input
            id={indicatorReadingField}
            type="text"
            value={indicatorReadingValue}
            onChange={(e) => handleFieldUpdate(indicatorReadingField, e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
}

// Helper function to check if slide data has been touched
const isDataTouched = (data: SlideData): boolean => {
  return Object.values(data).some((val) => val !== 0);
};

// Helper function to validate slide data
const validateSlideData = (data: SlideData): string[] => {
  const errors: string[] = [];
  const requiredFields: (keyof SlideData)[] = [
    'position1',
    'position2',
    'position3',
    'position4',
    'position5',
  ];

  requiredFields.forEach((field) => {
    const value = data[field];
    if (typeof value !== 'number' || isNaN(value)) {
      errors.push(`${String(field)} is required and must be a valid number`);
    }
  });

  return errors;
};

export function SlideForm({
  data,
  updateFn,
  errors,
  handleBlur,
  serviceType,
  onSectionTouched,
  includeBeforeMeasurements,
  onIncludeBeforeMeasurementsChange,
  onValidate,
  onClose,
}: SlideFormProps) {
  const t = useTranslations('inspections.form.slide');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleFieldUpdate = (
    field: keyof SlideFormData,
    value: SlideData | ParallelismType | YesNoNaDncType | YesNoDncType | string,
  ) => {
    updateFn(field, value);
    onSectionTouched?.();
    // Reset validation state when data changes
    setIsValid(null);
    setValidationErrors([]);
  };

  const handleValidateAndClose = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    e?.stopPropagation();

    setIsSaving(true);

    const outerBeforeTouched = isDataTouched(data.outerBeforeData);
    const outerAfterTouched = isDataTouched(data.outerAfterData);
    const innerBeforeTouched = isDataTouched(data.innerBeforeData);
    const innerAfterTouched = isDataTouched(data.innerAfterData);

    const validationErrors: string[] = [];

    // Validate that at least one section (outer or inner) is filled
    if (!outerAfterTouched && !innerAfterTouched) {
      validationErrors.push(t('validationError'));
      setIsValid(false);
      setValidationErrors(validationErrors);
      setIsSaving(false);
      onValidate?.(false, validationErrors);
      return;
    }

    // Validate outer data if touched
    if (outerAfterTouched) {
      const outerErrors = validateSlideData(data.outerAfterData);
      if (outerErrors.length > 0) {
        validationErrors.push(...outerErrors.map((e) => `Outer: ${e}`));
      }
    }

    // Validate inner data if touched
    if (innerAfterTouched) {
      const innerErrors = validateSlideData(data.innerAfterData);
      if (innerErrors.length > 0) {
        validationErrors.push(...innerErrors.map((e) => `Inner: ${e}`));
      }
    }

    // Validate before measurements if checkbox is checked
    if (includeBeforeMeasurements) {
      if (!outerBeforeTouched && !innerBeforeTouched) {
        validationErrors.push(t('fillBeforeMeasurements'));
      } else {
        if (outerBeforeTouched) {
          const outerBeforeErrors = validateSlideData(data.outerBeforeData);
          if (outerBeforeErrors.length > 0) {
            validationErrors.push(...outerBeforeErrors.map((e) => `Outer Before: ${e}`));
          }
        }
        if (innerBeforeTouched) {
          const innerBeforeErrors = validateSlideData(data.innerBeforeData);
          if (innerBeforeErrors.length > 0) {
            validationErrors.push(...innerBeforeErrors.map((e) => `Inner Before: ${e}`));
          }
        }
      }
    }

    if (validationErrors.length > 0) {
      setIsValid(false);
      setValidationErrors(validationErrors);
      setIsSaving(false);
      onValidate?.(false, validationErrors);
      return;
    }

    // If validation passes
    setIsValid(true);
    setValidationErrors([]);
    setIsSaving(false);
    onValidate?.(true, []);

    // Close the section after successful validation
    setTimeout(() => {
      onClose?.();
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Checkbox for MAINTENANCE service type */}
      {serviceType === ServiceType.MAINTENANCE && (
        <div className="flex items-center space-x-2 p-4 bg-slate-50 rounded-lg">
          <Checkbox
            id="include-before-measurements"
            checked={includeBeforeMeasurements}
            onCheckedChange={(checked) => {
              onIncludeBeforeMeasurementsChange(checked === true);
              onSectionTouched?.();
            }}
          />
          <Label
            htmlFor="include-before-measurements"
            className="text-sm font-medium leading-none cursor-pointer"
          >
            {t('includeMeasurementsBeforeMaintenance')}
          </Label>
        </div>
      )}

      {/* {t('beforeMaintenance')} Section */}
      {includeBeforeMeasurements && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold border-b pb-2">{t('beforeMaintenance')}</h3>

          <Tabs defaultValue="outer" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="outer">{t('outer')}</TabsTrigger>
              <TabsTrigger value="inner">{t('inner')}</TabsTrigger>
            </TabsList>

            <TabsContent value="outer" className="space-y-6">
              <PositionFields
                data={data.outerBeforeData}
                updateFn={(field, value) => {
                  const newData = { ...data.outerBeforeData, [field]: value };
                  handleFieldUpdate('outerBeforeData', newData);
                }}
                errors={errors.outerBefore}
                handleBlur={(field) => handleBlur('outerBefore', field)}
                title={t('positionMeasurements')}
              />
            </TabsContent>

            <TabsContent value="inner" className="space-y-6">
              <PositionFields
                data={data.innerBeforeData}
                updateFn={(field, value) => {
                  const newData = { ...data.innerBeforeData, [field]: value };
                  handleFieldUpdate('innerBeforeData', newData);
                }}
                errors={errors.innerBefore}
                handleBlur={(field) => handleBlur('innerBefore', field)}
                title={t('positionMeasurements')}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* {t('afterMaintenance')} Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold border-b pb-2">
          {includeBeforeMeasurements ? t('afterMaintenance') : t('measurements')}
        </h3>

        <Tabs defaultValue="outer" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="outer">{t('outer')}</TabsTrigger>
            <TabsTrigger value="inner">{t('inner')}</TabsTrigger>
          </TabsList>

          <TabsContent value="outer" className="space-y-6">
            <PositionFields
              data={data.outerAfterData}
              updateFn={(field, value) => {
                const newData = { ...data.outerAfterData, [field]: value };
                handleFieldUpdate('outerAfterData', newData);
              }}
              errors={errors.outerAfter}
              handleBlur={(field) => handleBlur('outerAfter', field)}
              title={t('positionMeasurements')}
            />
            <ShutheightFields type="outer" data={data} handleFieldUpdate={handleFieldUpdate} />
          </TabsContent>

          <TabsContent value="inner" className="space-y-6">
            <PositionFields
              data={data.innerAfterData}
              updateFn={(field, value) => {
                const newData = { ...data.innerAfterData, [field]: value };
                handleFieldUpdate('innerAfterData', newData);
              }}
              errors={errors.innerAfter}
              handleBlur={(field) => handleBlur('outerAfter', field)}
              title={t('positionMeasurements')}
            />
            <ShutheightFields type="inner" data={data} handleFieldUpdate={handleFieldUpdate} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Parent-level fields */}
      <div className="space-y-6 border-t pt-6">
        <h4 className="font-semibold text-sm">{t('additionalInformation')}</h4>

        {/* Parallelism */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="parallelism" className="text-xs">
              Parallelism
            </Label>
            <Select
              value={data.parallelism}
              onValueChange={(value) => handleFieldUpdate('parallelism', value as ParallelismType)}
            >
              <SelectTrigger id="parallelism" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ParallelismType.DNC}>DNC</SelectItem>
                <SelectItem value={ParallelismType.TO_BED}>To Bed</SelectItem>
                <SelectItem value={ParallelismType.TO_BOLSTER}>To Bolster</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="hasParallelismBeenAdjusted" className="text-xs">
              {t('hasParallelismBeenAdjusted')}
            </Label>
            <Select
              value={data.hasParallelismBeenAdjusted}
              onValueChange={(value) =>
                handleFieldUpdate('hasParallelismBeenAdjusted', value as YesNoNaDncType)
              }
            >
              <SelectTrigger id="hasParallelismBeenAdjusted" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={YesNoNaDncType.YES}>Yes</SelectItem>
                <SelectItem value={YesNoNaDncType.NO}>No</SelectItem>
                <SelectItem value={YesNoNaDncType.NA}>N/A</SelectItem>
                <SelectItem value={YesNoNaDncType.DNC}>DNC</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes" className="text-xs">
            Notes
          </Label>
          <Textarea
            id="notes"
            value={data.notes}
            onChange={(e) => handleFieldUpdate('notes', e.target.value)}
            className="mt-1"
            rows={4}
          />
        </div>
      </div>

      {/* Validation Messages Display */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-900 mb-2">Validation Errors:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Success Message Display */}
      {isValid === true && validationErrors.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-green-900">{t('dataSaved')}</h4>
              <p className="text-sm text-green-800">Slide data has been validated successfully</p>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button
          type="button"
          onClick={handleValidateAndClose}
          disabled={isSaving}
          className="min-w-[120px]"
        >
          {isSaving ? t('saving') : t('saveData')}
        </Button>
      </div>
    </div>
  );
}
