'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { ParallelismType, YesNoNaDncType, YesNoDncType } from '@/data/types/services.types';
import { LengthInput } from '@/components/ui/forms/LengthInput';
import { useUnitManager } from '@/contexts/UnitManagerContext';
import { Bell } from 'lucide-react';
import { type SlideFormData } from '../sections/SlideSingleHammerSection';

interface SlideSingleHammerFormWrapperData {
  slideData: SlideFormData;
  notes: string;
}

export interface SlideSingleHammerFormProps {
  data: SlideSingleHammerFormWrapperData;
  updateFn: <K extends keyof SlideSingleHammerFormWrapperData>(
    field: K,
    value: SlideSingleHammerFormWrapperData[K],
  ) => void;
  errors: Record<string, string>;
  handleBlur: (field: keyof SlideFormData) => void;
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
  const tCommon = useTranslations('inspections.form.common');
  const { convertLengthFromDefault, getLengthUnitLabel } = useUnitManager();
  const showAlertIndicator = fieldPrefix === 'after';

  // Build the actual field names based on prefix
  const pos1Field = `${fieldPrefix}Position1` as keyof SlideFormData;
  const pos2Field = `${fieldPrefix}Position2` as keyof SlideFormData;
  const pos3Field = `${fieldPrefix}Position3` as keyof SlideFormData;
  const pos4Field = `${fieldPrefix}Position4` as keyof SlideFormData;
  const pos5Field = `${fieldPrefix}Position5` as keyof SlideFormData;

  // Calculate max deviation: MAX - MIN of positions 1-5 if more than 1 value exists
  // Zero is a valid measurement and should be included in the calculation
  const calculateMaxDeviation = (): string => {
    const positions = [
      data[pos1Field] as number | undefined,
      data[pos2Field] as number | undefined,
      data[pos3Field] as number | undefined,
      data[pos4Field] as number | undefined,
      data[pos5Field] as number | undefined,
    ];
    const validValues = positions.filter(
      (val): val is number => val !== undefined && val !== null && !isNaN(Number(val)),
    );

    if (validValues.length > 1) {
      const max = Math.max(...validValues);
      const min = Math.min(...validValues);
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
      <div className="hidden lg:grid lg:grid-cols-4 gap-2">
        {/* Row 1: position1, position2, position3, deviation label */}
        <LengthInput
          id={`position1-${title}`}
          value={data[pos1Field]}
          onChange={(val) => updateFn(pos1Field, val)}
          onBlur={() => handleBlur(pos1Field)}
          error={errors[pos1Field]}
          showLabel={false}
        />
        <LengthInput
          id={`position2-${title}`}
          value={data[pos2Field]}
          onChange={(val) => updateFn(pos2Field, val)}
          onBlur={() => handleBlur(pos2Field)}
          error={errors[pos2Field]}
          showLabel={false}
        />
        <LengthInput
          id={`position3-${title}`}
          value={data[pos3Field]}
          onChange={(val) => updateFn(pos3Field, val)}
          onBlur={() => handleBlur(pos3Field)}
          error={errors[pos3Field]}
          showLabel={false}
        />
        <div className="flex items-center justify-center gap-1">
          <span className="text-sm font-medium">{t('maxDeviation')}</span>
          {showAlertIndicator && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Bell className="h-3 w-3 text-amber-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{tCommon('generatesAlert')}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Row 2: position4, position5, empty, deviation calc */}
        <LengthInput
          id={`position4-${title}`}
          value={data[pos4Field]}
          onChange={(val) => updateFn(pos4Field, val)}
          onBlur={() => handleBlur(pos4Field)}
          error={errors[pos4Field]}
          showLabel={false}
        />
        <LengthInput
          id={`position5-${title}`}
          value={data[pos5Field]}
          onChange={(val) => updateFn(pos5Field, val)}
          onBlur={() => handleBlur(pos5Field)}
          error={errors[pos5Field]}
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
      <div className="grid lg:hidden grid-cols-2 gap-2">
        <LengthInput
          id={`position1-${title}-sm`}
          label="Pos 1"
          value={data[pos1Field]}
          onChange={(val) => updateFn(pos1Field, val)}
          onBlur={() => handleBlur(pos1Field)}
          error={errors[pos1Field]}
        />
        <LengthInput
          id={`position2-${title}-sm`}
          label="Pos 2"
          value={data[pos2Field]}
          onChange={(val) => updateFn(pos2Field, val)}
          onBlur={() => handleBlur(pos2Field)}
          error={errors[pos2Field]}
        />
        <LengthInput
          id={`position3-${title}-sm`}
          label="Pos 3"
          value={data[pos3Field]}
          onChange={(val) => updateFn(pos3Field, val)}
          onBlur={() => handleBlur(pos3Field)}
          error={errors[pos3Field]}
        />
        <LengthInput
          id={`position4-${title}-sm`}
          label="Pos 4"
          value={data[pos4Field]}
          onChange={(val) => updateFn(pos4Field, val)}
          onBlur={() => handleBlur(pos4Field)}
          error={errors[pos4Field]}
        />
        <LengthInput
          id={`position5-${title}-sm`}
          label="Pos 5"
          value={data[pos5Field]}
          onChange={(val) => updateFn(pos5Field, val)}
          onBlur={() => handleBlur(pos5Field)}
          error={errors[pos5Field]}
        />

        {/* Deviation display */}
        <div className="col-span-1 space-y-1">
          <Label className="text-xs flex items-center gap-1">
            {t('maxDeviation')}
            {showAlertIndicator && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Bell className="h-3 w-3 text-amber-500 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{tCommon('generatesAlert')}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </Label>
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
  data,
  handleFieldUpdate,
  errors,
  handleBlur,
}: {
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
            <Label htmlFor="parallelism" className="text-xs">
              {t('parallelism')}
            </Label>
            <Select
              value={data.parallelism}
              onValueChange={(value: ParallelismType) => handleFieldUpdate('parallelism', value)}
            >
              <SelectTrigger id="parallelism" className="mt-1">
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
            <Label htmlFor="hasParallelismBeenAdjusted" className="text-xs">
              {t('hasParallelismBeenAdjusted')}
            </Label>
            <Select
              value={data.hasParallelismBeenAdjusted}
              onValueChange={(value: YesNoNaDncType) =>
                handleFieldUpdate('hasParallelismBeenAdjusted', value)
              }
            >
              <SelectTrigger id="hasParallelismBeenAdjusted" className="mt-1">
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
            <Label htmlFor="shutheightIndicatorsChecked" className="text-xs">
              {t('indicatorsChecked')}
            </Label>
            <Select
              value={data.shutheightIndicatorsChecked}
              onValueChange={(value: YesNoDncType) =>
                handleFieldUpdate('shutheightIndicatorsChecked', value)
              }
            >
              <SelectTrigger id="shutheightIndicatorsChecked" className="mt-1">
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
            <Label htmlFor="overloadsOnTonnageMonitor" className="text-xs">
              {t('overloadsOnTonnageMonitor')}
            </Label>
            <Input
              id="overloadsOnTonnageMonitor"
              type="text"
              value={data.overloadsOnTonnageMonitor || ''}
              onChange={(e) => handleFieldUpdate('overloadsOnTonnageMonitor', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="shutheightActualSh" className="text-xs">
              {t('actualSH')}
            </Label>
            <Input
              id="shutheightActualSh"
              type="text"
              value={data.shutheightActualSh || ''}
              onChange={(e) => handleFieldUpdate('shutheightActualSh', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="indicatorReading" className="text-xs">
              {t('indicatorReading')}
            </Label>
            <Input
              id="indicatorReading"
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

export function SlideSingleHammerForm({
  data,
  updateFn,
  errors,
  handleBlur,
  onSectionTouched,
}: SlideSingleHammerFormProps) {
  const t = useTranslations('inspections.form.slide');

  const handleFieldUpdate = (field: keyof SlideFormData, value: any) => {
    const newData = { ...data.slideData, [field]: value };
    updateFn('slideData', newData);
    onSectionTouched?.();
  };

  return (
    <div className="space-y-6">
      <SlideDataFields
        data={data.slideData}
        handleFieldUpdate={handleFieldUpdate}
        errors={errors}
        handleBlur={handleBlur}
      />

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
