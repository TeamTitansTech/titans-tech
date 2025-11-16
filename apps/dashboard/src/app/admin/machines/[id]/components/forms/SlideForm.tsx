'use client';

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
import {
  type SlideData,
  ParallelismType,
  ServiceType,
  DncToBedToBolsterType,
  YesNoNaDncType,
  YesNoDncType,
} from '@/data/types/services.types';

interface SlideFormData {
  outerBeforeData: SlideData;
  outerAfterData: SlideData;
  innerBeforeData: SlideData;
  innerAfterData: SlideData;
  outerParallelism: ParallelismType;
  outerHasParallelismBeenAdjusted: YesNoNaDncType;
  innerParallelism: ParallelismType;
  innerHasParallelismBeenAdjusted: YesNoNaDncType;
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

  // Calculate max deviation: MAX - MIN of positions 1-6 if more than 1 value exists
  const calculateMaxDeviation = (): string => {
    const positions = [
      data.position1,
      data.position2,
      data.position3,
      data.position4,
      data.position5,
      data.position6,
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

        {/* Row 2: position4, position5, position6, deviation calc */}
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
        <div>
          <Input
            id={`position6-${title}`}
            type="number"
            value={0}
            disabled
            readOnly
            className="bg-muted text-center cursor-not-allowed"
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

        {/* Row 3: position5, position6 */}
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
        <div>
          <Input
            id={`position6-${title}-md`}
            type="number"
            value={0}
            disabled
            readOnly
            className="bg-muted text-center cursor-not-allowed"
          />
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

        {/* Row 3: position5, position6 */}
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
        <div>
          <Input
            id={`position6-${title}-sm`}
            type="number"
            value={0}
            disabled
            readOnly
            className="bg-muted text-center cursor-not-allowed"
          />
        </div>

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
    <div className="space-y-4 mt-6 pt-6 border-t">
      <h5 className="font-medium text-sm">{t('shutheightInformation')}</h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={indicatorsField} className="text-xs">
            {t('indicatorsChecked')}
          </Label>
          <Select
            value={indicatorsValue}
            onValueChange={(value: YesNoDncType) => handleFieldUpdate(indicatorsField, value)}
          >
            <SelectTrigger id={indicatorsField} className="mt-1">
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

export function SlideForm({
  data,
  updateFn,
  errors,
  handleBlur,
  serviceType,
  onSectionTouched,
  includeBeforeMeasurements,
  onIncludeBeforeMeasurementsChange,
}: SlideFormProps) {
  const t = useTranslations('inspections.form.slide');

  const handleFieldUpdate = (
    field: keyof SlideFormData,
    value: SlideData | DncToBedToBolsterType | YesNoNaDncType | YesNoDncType | string,
  ) => {
    updateFn(field, value);
    onSectionTouched?.();
  };

  return (
    <div className="space-y-6">
      {/* Parallelism Configuration Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold pb-2">{t('parallelismConfiguration')}</h3>
        {/* Info Note */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">
            i
          </div>
          <p className="text-xs text-blue-900 dark:text-blue-100">{t('parallelismAppliesNote')}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Outer/Externo Panel */}
        <div className="border border-border rounded-lg p-4 space-y-4 bg-card">
          <h4 className="font-semibold text-sm text-foreground">{t('outer')}</h4>
          <div className="space-y-3">
            <div>
              <Label htmlFor="outerParallelism" className="text-xs">
                {t('parallelism')}
              </Label>
              <Select
                value={data.outerParallelism}
                onValueChange={(value) =>
                  handleFieldUpdate('outerParallelism', value as ParallelismType)
                }
              >
                <SelectTrigger id="outerParallelism" className="mt-1">
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
              <Label htmlFor="outerHasParallelismBeenAdjusted" className="text-xs">
                {t('hasParallelismBeenAdjusted')}
              </Label>
              <Select
                value={data.outerHasParallelismBeenAdjusted}
                onValueChange={(value) =>
                  handleFieldUpdate('outerHasParallelismBeenAdjusted', value as YesNoNaDncType)
                }
              >
                <SelectTrigger id="outerHasParallelismBeenAdjusted" className="mt-1">
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

        {/* Inner/Interno Panel */}
        <div className="border border-border rounded-lg p-4 space-y-4 bg-card">
          <h4 className="font-semibold text-sm text-foreground">{t('inner')}</h4>
          <div className="space-y-3">
            <div>
              <Label htmlFor="innerParallelism" className="text-xs">
                {t('parallelism')}
              </Label>
              <Select
                value={data.innerParallelism}
                onValueChange={(value) =>
                  handleFieldUpdate('innerParallelism', value as ParallelismType)
                }
              >
                <SelectTrigger id="innerParallelism" className="mt-1">
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
              <Label htmlFor="innerHasParallelismBeenAdjusted" className="text-xs">
                {t('hasParallelismBeenAdjusted')}
              </Label>
              <Select
                value={data.innerHasParallelismBeenAdjusted}
                onValueChange={(value) =>
                  handleFieldUpdate('innerHasParallelismBeenAdjusted', value as YesNoNaDncType)
                }
              >
                <SelectTrigger id="innerHasParallelismBeenAdjusted" className="mt-1">
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
      </div>

      {serviceType === ServiceType.MAINTENANCE && (
        <div className="flex items-center space-x-2 p-4 bg-muted/30 rounded-lg">
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

      {includeBeforeMeasurements && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold pb-2">{t('beforeMaintenance')}</h3>

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

      <div className="space-y-4">
        <h3 className="text-lg font-bold pb-2">
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
              handleBlur={(field) => handleBlur('innerAfter', field)}
              title={t('positionMeasurements')}
            />
            <ShutheightFields type="inner" data={data} handleFieldUpdate={handleFieldUpdate} />
          </TabsContent>
        </Tabs>
      </div>

      <div className="space-y-4 border-t pt-6">
        <div>
          <Label htmlFor="notes" className="text-xs">
            {t('notes')}
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
    </div>
  );
}
