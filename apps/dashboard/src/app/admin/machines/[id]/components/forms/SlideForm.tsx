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
  ServiceType,
  YesNoNaDncType,
  YesNoDncType,
} from '@/data/types/services.types';

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
  serviceType: ServiceType;
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

  const getFieldName = (position: number): keyof SlideData => {
    return `${fieldPrefix}Position${position}` as keyof SlideData;
  };

  const getValue = (position: number): number | undefined => {
    const fieldName = getFieldName(position);
    return data[fieldName] as number | undefined;
  };

  // Calculate max deviation: MAX - MIN of positions 1-5 if more than 1 value exists
  const calculateMaxDeviation = (): string => {
    const positions = [getValue(1), getValue(2), getValue(3), getValue(4), getValue(5)];
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

  const isRequired = fieldPrefix === 'after';

  return (
    <div className="space-y-4">
      <h5 className="font-medium text-sm">{title}</h5>

      {/* Big screens: 3 columns + deviation */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-2">
        {/* Row 1: position1, position2, position3, deviation label */}
        {[1, 2, 3].map((pos) => {
          const fieldName = getFieldName(pos);
          const value = getValue(pos);
          return (
            <div key={pos}>
              <Input
                id={`${fieldName}-${title}`}
                type="number"
                step="0.0001"
                min="0"
                max="999999.9999"
                value={value ?? ''}
                onChange={(e) =>
                  updateFn(fieldName, e.target.value === '' ? undefined : Number(e.target.value))
                }
                onBlur={() => handleBlur(fieldName)}
                className={errors[fieldName] ? 'border-destructive' : ''}
                required={isRequired}
              />
              {errors[fieldName] && (
                <p className="text-xs text-destructive mt-1">{errors[fieldName]}</p>
              )}
            </div>
          );
        })}
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
        {[4, 5].map((pos) => {
          const fieldName = getFieldName(pos);
          const value = getValue(pos);
          return (
            <div key={pos}>
              <Input
                id={`${fieldName}-${title}`}
                type="number"
                step="0.0001"
                min="0"
                max="999999.9999"
                value={value ?? ''}
                onChange={(e) =>
                  updateFn(fieldName, e.target.value === '' ? undefined : Number(e.target.value))
                }
                onBlur={() => handleBlur(fieldName)}
                className={errors[fieldName] ? 'border-destructive' : ''}
                required={isRequired}
              />
              {errors[fieldName] && (
                <p className="text-xs text-destructive mt-1">{errors[fieldName]}</p>
              )}
            </div>
          );
        })}
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
        {[1, 2, 3, 4, 5].map((pos) => {
          const fieldName = getFieldName(pos);
          const value = getValue(pos);
          return (
            <div key={pos}>
              <Label htmlFor={`${fieldName}-${title}-sm`} className="text-xs">
                Pos {pos}
              </Label>
              <Input
                id={`${fieldName}-${title}-sm`}
                type="number"
                step="0.0001"
                min="0"
                max="999999.9999"
                value={value ?? ''}
                onChange={(e) =>
                  updateFn(fieldName, e.target.value === '' ? undefined : Number(e.target.value))
                }
                onBlur={() => handleBlur(fieldName)}
                className={errors[fieldName] ? 'border-destructive' : ''}
                required={isRequired}
              />
              {errors[fieldName] && (
                <p className="text-xs text-destructive mt-1">{errors[fieldName]}</p>
              )}
            </div>
          );
        })}

        {/* Deviation display */}
        <div className="col-span-2 grid grid-cols-2 gap-2">
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
  serviceType,
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
