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
import { ParallelismType, YesNoNaDncType, YesNoDncType } from '@/data/types/services.types';
import { LengthInput } from '@/components/ui/forms/LengthInput';
import { useUnitManager } from '@/contexts/UnitManagerContext';
import { type SlideFormData } from '../sections/SlideSection';

interface SlideFormWrapperData {
  outerData: SlideFormData;
  innerData: SlideFormData;
  notes: string;
}

export interface SlideFormProps {
  data: SlideFormWrapperData;
  updateFn: <K extends keyof SlideFormWrapperData>(
    field: K,
    value: SlideFormWrapperData[K],
  ) => void;
  errors: {
    outer: Record<string, string>;
    inner: Record<string, string>;
  };
  handleBlur: (section: 'outer' | 'inner', field: keyof SlideFormData) => void;
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
  data: SlideFormData;
  updateFn: (field: keyof SlideFormData, value: number | undefined) => void;
  errors: Record<string, string>;
  handleBlur: (field: keyof SlideFormData) => void;
  title: string;
  fieldPrefix: 'before' | 'after';
}) {
  const t = useTranslations('inspections.form.slide');
  const { convertLengthFromDefault, getLengthUnitLabel } = useUnitManager();

  // Build the actual field names based on prefix
  const pos1Field = `${fieldPrefix}Position1` as keyof SlideFormData;
  const pos2Field = `${fieldPrefix}Position2` as keyof SlideFormData;
  const pos3Field = `${fieldPrefix}Position3` as keyof SlideFormData;
  const pos4Field = `${fieldPrefix}Position4` as keyof SlideFormData;
  const pos5Field = `${fieldPrefix}Position5` as keyof SlideFormData;

  // Calculate max deviation: MAX - MIN of positions 1-5 if more than 1 value exists
  // Values are stored in mm, so we calculate diff in mm then convert for display
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
      const diffInMm = max - min;
      const diffInDisplayUnit = convertLengthFromDefault(diffInMm);
      return diffInDisplayUnit.toFixed(4);
    }
    return '';
  };

  return (
    <div className="space-y-4">
      <h5 className="font-medium text-sm">{title}</h5>

      {/* Big screens: 3 columns + deviation */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-2 p-0.5">
        {/* Row 1: position1, position2, position3, deviation label */}
        <LengthInput
          id={`position1-${title}`}
          value={data[pos1Field] ?? 0}
          onChange={(val) => updateFn(pos1Field, val)}
          onBlur={() => handleBlur(pos1Field)}
          error={errors[pos1Field]}
          required={fieldPrefix === 'after'}
          showLabel={false}
        />
        <LengthInput
          id={`position2-${title}`}
          value={data[pos2Field] ?? 0}
          onChange={(val) => updateFn(pos2Field, val)}
          onBlur={() => handleBlur(pos2Field)}
          error={errors[pos2Field]}
          required={fieldPrefix === 'after'}
          showLabel={false}
        />
        <LengthInput
          id={`position3-${title}`}
          value={data[pos3Field] ?? 0}
          onChange={(val) => updateFn(pos3Field, val)}
          onBlur={() => handleBlur(pos3Field)}
          error={errors[pos3Field]}
          required={fieldPrefix === 'after'}
          showLabel={false}
        />
        <div>
          <Input
            type="text"
            value={t('maxDeviation')}
            disabled
            className="bg-muted text-center font-medium h-9"
            readOnly
          />
        </div>

        {/* Row 2: position4, position5, empty, deviation calc */}
        <LengthInput
          id={`position4-${title}`}
          value={data[pos4Field] ?? 0}
          onChange={(val) => updateFn(pos4Field, val)}
          onBlur={() => handleBlur(pos4Field)}
          error={errors[pos4Field]}
          required={fieldPrefix === 'after'}
          showLabel={false}
        />
        <LengthInput
          id={`position5-${title}`}
          value={data[pos5Field] ?? 0}
          onChange={(val) => updateFn(pos5Field, val)}
          onBlur={() => handleBlur(pos5Field)}
          error={errors[pos5Field]}
          required={fieldPrefix === 'after'}
          showLabel={false}
        />
        <div></div>
        <div className="relative">
          <Input
            type="text"
            value={calculateMaxDeviation()}
            disabled
            className="bg-muted text-center font-medium h-9 pr-10"
            readOnly
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
            {getLengthUnitLabel()}
          </span>
        </div>
      </div>

      {/* Medium and Small screens: 2 columns */}
      <div className="grid lg:hidden grid-cols-2 gap-2 p-0.5">
        <LengthInput
          id={`position1-${title}-sm`}
          label="Pos 1"
          value={data[pos1Field] ?? 0}
          onChange={(val) => updateFn(pos1Field, val)}
          onBlur={() => handleBlur(pos1Field)}
          error={errors[pos1Field]}
          required={fieldPrefix === 'after'}
        />
        <LengthInput
          id={`position2-${title}-sm`}
          label="Pos 2"
          value={data[pos2Field] ?? 0}
          onChange={(val) => updateFn(pos2Field, val)}
          onBlur={() => handleBlur(pos2Field)}
          error={errors[pos2Field]}
          required={fieldPrefix === 'after'}
        />
        <LengthInput
          id={`position3-${title}-sm`}
          label="Pos 3"
          value={data[pos3Field] ?? 0}
          onChange={(val) => updateFn(pos3Field, val)}
          onBlur={() => handleBlur(pos3Field)}
          error={errors[pos3Field]}
          required={fieldPrefix === 'after'}
        />
        <LengthInput
          id={`position4-${title}-sm`}
          label="Pos 4"
          value={data[pos4Field] ?? 0}
          onChange={(val) => updateFn(pos4Field, val)}
          onBlur={() => handleBlur(pos4Field)}
          error={errors[pos4Field]}
          required={fieldPrefix === 'after'}
        />
        <LengthInput
          id={`position5-${title}-sm`}
          label="Pos 5"
          value={data[pos5Field] ?? 0}
          onChange={(val) => updateFn(pos5Field, val)}
          onBlur={() => handleBlur(pos5Field)}
          error={errors[pos5Field]}
          required={fieldPrefix === 'after'}
        />

        {/* Deviation display */}
        <div className="col-span-1 space-y-1">
          <Label className="text-xs">{t('maxDeviation')}</Label>
          <div className="relative">
            <Input
              type="text"
              value={calculateMaxDeviation()}
              disabled
              className="bg-muted text-center font-medium h-9 pr-10"
              readOnly
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              {getLengthUnitLabel()}
            </span>
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
  data: SlideFormData;
  handleFieldUpdate: (field: keyof SlideFormData, value: any) => void;
  errors: Record<string, string>;
  handleBlur: (field: keyof SlideFormData) => void;
}) {
  const t = useTranslations('inspections.form.slide');

  const showBeforeMeasurements = data.hasParallelismBeenAdjusted === YesNoNaDncType.YES;

  return (
    <div className="space-y-6">
      {/* Parallelism Configuration */}
      <div className="space-y-4">
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
          <h4 className="text-sm font-semibold text-muted-foreground">{t('beforeAdjustment')}</h4>
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
        <h4 className="text-sm font-semibold text-muted-foreground">
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
      <div className="space-y-4 mt-2">
        <h4 className="text-sm font-semibold text-muted-foreground">
          {t('shutheightInformation')}
        </h4>
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
    field: keyof SlideFormData,
    value: any,
  ) => {
    const newData = { ...data[side], [field]: value };
    updateFn(side, newData);
    onSectionTouched?.();
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="outer" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-transparent p-0 gap-2">
          <TabsTrigger
            value="outer"
            className="border border-border data-[state=active]:border-primary"
          >
            {t('outer')}
          </TabsTrigger>
          <TabsTrigger
            value="inner"
            className="border border-border data-[state=active]:border-primary"
          >
            {t('inner')}
          </TabsTrigger>
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

      <div className="space-y-4 pt-2">
        <div>
          <Label htmlFor="notes" className="text-sm font-semibold text-muted-foreground">
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
