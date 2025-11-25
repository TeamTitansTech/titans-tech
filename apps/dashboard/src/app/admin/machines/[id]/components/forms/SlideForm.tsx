'use client';

import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  type SlideData,
  ParallelismType,
  YesNoNaDncType,
  YesNoDncType,
} from '@/data/types/services.types';
import { useNumericInput } from '@/hooks/useNumericInput';

interface SlideFormData {
  outerData: SlideData;
  innerData: SlideData;
  notes: string;
}

export interface SlideFormProps {
  data: SlideFormData;
  updateFn: <K extends keyof SlideFormData>(field: K, value: SlideFormData[K]) => void;
  errors: {
    outer: Record<string, string>;
    inner: Record<string, string>;
  };
  handleBlur: (section: 'outer' | 'inner', field: keyof SlideData) => void;
  onSectionTouched?: () => void;
}

function PositionFields({
  data,
  updateFn,
  errors,
  handleBlur,
  title,
  fieldPrefix,
}: {
  data: SlideData;
  updateFn: (field: keyof SlideData, value: number | undefined) => void;
  errors: Record<string, string>;
  handleBlur: (field: keyof SlideData) => void;
  title: string;
  fieldPrefix: 'before' | 'after';
}) {
  const t = useTranslations('inspections.form.slide');

  // Build the actual field names based on prefix
  const pos1Field = `${fieldPrefix}Position1` as keyof SlideData;
  const pos2Field = `${fieldPrefix}Position2` as keyof SlideData;
  const pos3Field = `${fieldPrefix}Position3` as keyof SlideData;
  const pos4Field = `${fieldPrefix}Position4` as keyof SlideData;
  const pos5Field = `${fieldPrefix}Position5` as keyof SlideData;

  // Use numeric input hook for each position
  const [position1Value, handlePosition1Change, handlePosition1Blur] = useNumericInput(
    data[pos1Field] as number | undefined,
    (val) => updateFn(pos1Field, val),
    { maxDecimals: 4, required: fieldPrefix === 'after' },
  );
  const [position2Value, handlePosition2Change, handlePosition2Blur] = useNumericInput(
    data[pos2Field] as number | undefined,
    (val) => updateFn(pos2Field, val),
    { maxDecimals: 4, required: fieldPrefix === 'after' },
  );
  const [position3Value, handlePosition3Change, handlePosition3Blur] = useNumericInput(
    data[pos3Field] as number | undefined,
    (val) => updateFn(pos3Field, val),
    { maxDecimals: 4, required: fieldPrefix === 'after' },
  );
  const [position4Value, handlePosition4Change, handlePosition4Blur] = useNumericInput(
    data[pos4Field] as number | undefined,
    (val) => updateFn(pos4Field, val),
    { maxDecimals: 4, required: fieldPrefix === 'after' },
  );
  const [position5Value, handlePosition5Change, handlePosition5Blur] = useNumericInput(
    data[pos5Field] as number | undefined,
    (val) => updateFn(pos5Field, val),
    { maxDecimals: 4, required: fieldPrefix === 'after' },
  );

  // Calculate max deviation: MAX - MIN of positions 1-5 if more than 1 value exists
  const calculateMaxDeviation = (): string => {
    const positions = [
      data[pos1Field] as number | undefined,
      data[pos2Field] as number | undefined,
      data[pos3Field] as number | undefined,
      data[pos4Field] as number | undefined,
      data[pos5Field] as number | undefined,
    ];
    const validValues = positions.filter(
      (val) => val !== undefined && val !== null && !isNaN(val) && val !== 0,
    );

    if (validValues.length > 1) {
      const max = Math.max(...(validValues as number[]));
      const min = Math.min(...(validValues as number[]));
      return (max - min).toFixed(4);
    }
    return '';
  };

  return (
    <div className="space-y-4">
      <h5 className="font-medium text-sm">{title}</h5>

      {/* Big screens: 3 columns + deviation */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-2">
        {/* Row 1: position1, position2, position3, deviation label */}
        <div>
          <Input
            id={`position1-${title}`}
            type="number"
            step="0.0001"
            max="999999.9999"
            value={position1Value}
            onChange={handlePosition1Change}
            onBlur={() => {
              handlePosition1Blur();
              handleBlur(pos1Field);
            }}
            className={errors[pos1Field] ? 'border-destructive' : ''}
            required={fieldPrefix === 'after'}
          />
          {errors[pos1Field] && (
            <p className="text-xs text-destructive mt-1">{errors[pos1Field]}</p>
          )}
        </div>
        <div>
          <Input
            id={`position2-${title}`}
            type="number"
            step="0.0001"
            max="999999.9999"
            value={position2Value}
            onChange={handlePosition2Change}
            onBlur={() => {
              handlePosition2Blur();
              handleBlur(pos2Field);
            }}
            className={errors[pos2Field] ? 'border-destructive' : ''}
            required={fieldPrefix === 'after'}
          />
          {errors[pos2Field] && (
            <p className="text-xs text-destructive mt-1">{errors[pos2Field]}</p>
          )}
        </div>
        <div>
          <Input
            id={`position3-${title}`}
            type="number"
            step="0.0001"
            max="999999.9999"
            value={position3Value}
            onChange={handlePosition3Change}
            onBlur={() => {
              handlePosition3Blur();
              handleBlur(pos3Field);
            }}
            className={errors[pos3Field] ? 'border-destructive' : ''}
            required={fieldPrefix === 'after'}
          />
          {errors[pos3Field] && (
            <p className="text-xs text-destructive mt-1">{errors[pos3Field]}</p>
          )}
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
            max="999999.9999"
            value={position4Value}
            onChange={handlePosition4Change}
            onBlur={() => {
              handlePosition4Blur();
              handleBlur(pos4Field);
            }}
            className={errors[pos4Field] ? 'border-destructive' : ''}
            required={fieldPrefix === 'after'}
          />
          {errors[pos4Field] && (
            <p className="text-xs text-destructive mt-1">{errors[pos4Field]}</p>
          )}
        </div>
        <div>
          <Input
            id={`position5-${title}`}
            type="number"
            step="0.0001"
            max="999999.9999"
            value={position5Value}
            onChange={handlePosition5Change}
            onBlur={() => {
              handlePosition5Blur();
              handleBlur(pos5Field);
            }}
            className={errors[pos5Field] ? 'border-destructive' : ''}
            required={fieldPrefix === 'after'}
          />
          {errors[pos5Field] && (
            <p className="text-xs text-destructive mt-1">{errors[pos5Field]}</p>
          )}
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

      {/* Medium and Small screens: 2 columns */}
      <div className="grid lg:hidden grid-cols-2 gap-2">
        <div>
          <Label htmlFor={`position1-${title}-sm`} className="text-xs">
            Pos 1
          </Label>
          <Input
            id={`position1-${title}-sm`}
            type="number"
            step="0.0001"
            max="999999.9999"
            value={position1Value}
            onChange={handlePosition1Change}
            onBlur={() => {
              handlePosition1Blur();
              handleBlur(pos1Field);
            }}
            className={errors[pos1Field] ? 'border-destructive' : ''}
            required={fieldPrefix === 'after'}
          />
          {errors[pos1Field] && (
            <p className="text-xs text-destructive mt-1">{errors[pos1Field]}</p>
          )}
        </div>
        <div>
          <Label htmlFor={`position2-${title}-sm`} className="text-xs">
            Pos 2
          </Label>
          <Input
            id={`position2-${title}-sm`}
            type="number"
            step="0.0001"
            max="999999.9999"
            value={position2Value}
            onChange={handlePosition2Change}
            onBlur={() => {
              handlePosition2Blur();
              handleBlur(pos2Field);
            }}
            className={errors[pos2Field] ? 'border-destructive' : ''}
            required={fieldPrefix === 'after'}
          />
          {errors[pos2Field] && (
            <p className="text-xs text-destructive mt-1">{errors[pos2Field]}</p>
          )}
        </div>

        <div>
          <Label htmlFor={`position3-${title}-sm`} className="text-xs">
            Pos 3
          </Label>
          <Input
            id={`position3-${title}-sm`}
            type="number"
            step="0.0001"
            max="999999.9999"
            value={position3Value}
            onChange={handlePosition3Change}
            onBlur={() => {
              handlePosition3Blur();
              handleBlur(pos3Field);
            }}
            className={errors[pos3Field] ? 'border-destructive' : ''}
            required={fieldPrefix === 'after'}
          />
          {errors[pos3Field] && (
            <p className="text-xs text-destructive mt-1">{errors[pos3Field]}</p>
          )}
        </div>
        <div>
          <Label htmlFor={`position4-${title}-sm`} className="text-xs">
            Pos 4
          </Label>
          <Input
            id={`position4-${title}-sm`}
            type="number"
            step="0.0001"
            max="999999.9999"
            value={position4Value}
            onChange={handlePosition4Change}
            onBlur={() => {
              handlePosition4Blur();
              handleBlur(pos4Field);
            }}
            className={errors[pos4Field] ? 'border-destructive' : ''}
            required={fieldPrefix === 'after'}
          />
          {errors[pos4Field] && (
            <p className="text-xs text-destructive mt-1">{errors[pos4Field]}</p>
          )}
        </div>

        <div>
          <Label htmlFor={`position5-${title}-sm`} className="text-xs">
            Pos 5
          </Label>
          <Input
            id={`position5-${title}-sm`}
            type="number"
            step="0.0001"
            max="999999.9999"
            value={position5Value}
            onChange={handlePosition5Change}
            onBlur={() => {
              handlePosition5Blur();
              handleBlur(pos5Field);
            }}
            className={errors[pos5Field] ? 'border-destructive' : ''}
            required={fieldPrefix === 'after'}
          />
          {errors[pos5Field] && (
            <p className="text-xs text-destructive mt-1">{errors[pos5Field]}</p>
          )}
        </div>

        {/* Deviation display */}
        <div className="col-span-1">
          <Label className="text-xs">{t('maxDeviation')}</Label>
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

function SlideDataFields({
  type,
  data,
  handleFieldUpdate,
  errors,
  handleBlur,
}: {
  type: 'outer' | 'inner';
  data: SlideData;
  handleFieldUpdate: (field: keyof SlideData, value: any) => void;
  errors: Record<string, string>;
  handleBlur: (field: keyof SlideData) => void;
}) {
  const t = useTranslations('inspections.form.slide');

  const showBeforeMeasurements = data.hasParallelismBeenAdjusted === YesNoNaDncType.YES;

  return (
    <div className="space-y-6">
      {/* Parallelism Configuration */}
      <div className="border border-border rounded-lg p-4 space-y-4 bg-card">
        <h4 className="font-semibold text-sm text-foreground">{t('parallelismConfiguration')}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`${type}-parallelism`} className="text-xs">
              {t('parallelism')}
            </Label>
            <Select
              value={data.parallelism}
              onValueChange={(value: ParallelismType) => handleFieldUpdate('parallelism', value)}
            >
              <SelectTrigger id={`${type}-parallelism`} className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ParallelismType.DNC}>{t('dnc')}</SelectItem>
                <SelectItem value={ParallelismType.TO_BED}>{t('toBed')}</SelectItem>
                <SelectItem value={ParallelismType.TO_BOLSTER}>{t('toBolster')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor={`${type}-hasParallelismBeenAdjusted`} className="text-xs">
              {t('hasParallelismBeenAdjusted')}
            </Label>
            <Select
              value={data.hasParallelismBeenAdjusted}
              onValueChange={(value: YesNoNaDncType) =>
                handleFieldUpdate('hasParallelismBeenAdjusted', value)
              }
            >
              <SelectTrigger id={`${type}-hasParallelismBeenAdjusted`} className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={YesNoNaDncType.YES}>{t('yes')}</SelectItem>
                <SelectItem value={YesNoNaDncType.NO}>{t('no')}</SelectItem>
                <SelectItem value={YesNoNaDncType.NA}>{t('na')}</SelectItem>
                <SelectItem value={YesNoNaDncType.DNC}>{t('dnc')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Before Measurements - Only show if adjusted = YES */}
      {showBeforeMeasurements && (
        <div className="space-y-4">
          <h4 className="text-md font-semibold pb-2 border-b">{t('beforeAdjustment')}</h4>
          <PositionFields
            data={data}
            updateFn={handleFieldUpdate}
            errors={errors}
            handleBlur={handleBlur}
            title={t('positionMeasurements')}
            fieldPrefix="before"
          />
        </div>
      )}

      {/* After/Current Measurements - Always show */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold pb-2 border-b">
          {showBeforeMeasurements ? t('afterAdjustment') : t('measurements')}
        </h4>
        <PositionFields
          data={data}
          updateFn={handleFieldUpdate}
          errors={errors}
          handleBlur={handleBlur}
          title={t('positionMeasurements')}
          fieldPrefix="after"
        />
      </div>

      {/* Shutheight Information */}
      <div className="border border-border rounded-lg p-4 space-y-4 bg-card mt-6">
        <h5 className="font-medium text-sm">{t('shutheightInformation')}</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`${type}-shutheightIndicatorsChecked`} className="text-xs">
              {t('indicatorsChecked')}
            </Label>
            <Select
              value={data.shutheightIndicatorsChecked}
              onValueChange={(value: YesNoDncType) =>
                handleFieldUpdate('shutheightIndicatorsChecked', value)
              }
            >
              <SelectTrigger id={`${type}-shutheightIndicatorsChecked`} className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={YesNoDncType.YES}>{t('yes')}</SelectItem>
                <SelectItem value={YesNoDncType.NO}>{t('no')}</SelectItem>
                <SelectItem value={YesNoDncType.DNC}>{t('dnc')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor={`${type}-overloadsOnTonnageMonitor`} className="text-xs">
              {t('overloadsOnTonnageMonitor')}
            </Label>
            <Input
              id={`${type}-overloadsOnTonnageMonitor`}
              type="text"
              value={data.overloadsOnTonnageMonitor || ''}
              onChange={(e) => handleFieldUpdate('overloadsOnTonnageMonitor', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor={`${type}-shutheightActualSh`} className="text-xs">
              {t('actualSH')}
            </Label>
            <Input
              id={`${type}-shutheightActualSh`}
              type="text"
              value={data.shutheightActualSh || ''}
              onChange={(e) => handleFieldUpdate('shutheightActualSh', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor={`${type}-indicatorReading`} className="text-xs">
              {t('indicatorReading')}
            </Label>
            <Input
              id={`${type}-indicatorReading`}
              type="text"
              value={data.indicatorReading || ''}
              onChange={(e) => handleFieldUpdate('indicatorReading', e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SlideForm({
  data,
  updateFn,
  errors,
  handleBlur,
  onSectionTouched,
}: SlideFormProps) {
  const t = useTranslations('inspections.form.slide');

  const handleFieldUpdate = (
    side: 'outerData' | 'innerData',
    field: keyof SlideData,
    value: any,
  ) => {
    const newData = { ...data[side], [field]: value };
    updateFn(side, newData);
    onSectionTouched?.();
  };

  return (
    <div className="space-y-6">
      {/* Info Note */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">
          i
        </div>
        <p className="text-xs text-blue-900 dark:text-blue-100">{t('parallelismAppliesNote')}</p>
      </div>

      <Tabs defaultValue="outer" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="outer">{t('outer')}</TabsTrigger>
          <TabsTrigger value="inner">{t('inner')}</TabsTrigger>
        </TabsList>

        <TabsContent value="outer" className="space-y-6">
          <SlideDataFields
            type="outer"
            data={data.outerData}
            handleFieldUpdate={(field, value) => handleFieldUpdate('outerData', field, value)}
            errors={errors.outer}
            handleBlur={(field) => handleBlur('outer', field)}
          />
        </TabsContent>

        <TabsContent value="inner" className="space-y-6">
          <SlideDataFields
            type="inner"
            data={data.innerData}
            handleFieldUpdate={(field, value) => handleFieldUpdate('innerData', field, value)}
            errors={errors.inner}
            handleBlur={(field) => handleBlur('inner', field)}
          />
        </TabsContent>
      </Tabs>

      <div className="space-y-4 border-t pt-6">
        <div>
          <Label htmlFor="notes" className="text-xs">
            {t('notes')}
          </Label>
          <Textarea
            id="notes"
            value={data.notes}
            onChange={(e) => {
              updateFn('notes', e.target.value);
              onSectionTouched?.();
            }}
            className="mt-1"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}
