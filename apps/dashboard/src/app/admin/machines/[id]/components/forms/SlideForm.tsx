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
  const t = useTranslations('inspections');

  return (
    <div className="space-y-4">
      <h5 className="font-medium text-sm">{title}</h5>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(
          ['position1', 'position2', 'position3', 'position4', 'position5', 'position6'] as const
        ).map((field) => (
          <div key={field}>
            <Label htmlFor={`${field}-${title}`} className="text-xs">
              {t(`form.slide.${field}`)}
            </Label>
            <Input
              id={`${field}-${title}`}
              type="number"
              step="0.0001"
              min="0"
              max="999999.9999"
              value={data[field]}
              onChange={(e) => updateFn(field, Number(e.target.value))}
              onBlur={() => handleBlur(field)}
              className={`mt-1 ${errors[field] ? 'border-destructive' : ''}`}
              required
            />
            {errors[field] && <p className="text-xs text-destructive mt-1">{errors[field]}</p>}
          </div>
        ))}
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
      <h5 className="font-medium text-sm">Shutheight Information</h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={indicatorsField} className="text-xs">
            Indicators Checked?
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
            Overloads on Tonnage Monitor
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
            Actual SH
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
            Indicator Reading
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
}: SlideFormProps) {
  const [includeBeforeMeasurements, setIncludeBeforeMeasurements] = useState(false);

  const handleFieldUpdate = (
    field: keyof SlideFormData,
    value: SlideData | ParallelismType | YesNoNaDncType | YesNoDncType | string,
  ) => {
    updateFn(field, value);
    onSectionTouched?.();
  };

  console.log({ serviceType });

  return (
    <div className="space-y-6">
      {serviceType === ServiceType.MAINTENANCE && (
        <div className="flex items-center space-x-2 p-4 bg-muted/30 rounded-lg">
          <Checkbox
            id="include-before-measurements"
            checked={includeBeforeMeasurements}
            onCheckedChange={(checked) => {
              setIncludeBeforeMeasurements(checked === true);
              onSectionTouched?.();
            }}
          />
          <Label
            htmlFor="include-before-measurements"
            className="text-sm font-medium leading-none cursor-pointer"
          >
            Include measurements before maintenance
          </Label>
        </div>
      )}

      {includeBeforeMeasurements && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold border-b pb-2">Before Maintenance</h3>

          <Tabs defaultValue="outer" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="outer">Outer</TabsTrigger>
              <TabsTrigger value="inner">Inner</TabsTrigger>
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
                title="Position Measurements"
              />

              <ShutheightFields type="outer" data={data} handleFieldUpdate={handleFieldUpdate} />
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
                title="Position Measurements"
              />

              <ShutheightFields type="inner" data={data} handleFieldUpdate={handleFieldUpdate} />
            </TabsContent>
          </Tabs>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-bold border-b pb-2">
          {includeBeforeMeasurements ? 'After Maintenance' : 'Measurements'}
        </h3>

        <Tabs defaultValue="outer" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="outer">Outer</TabsTrigger>
            <TabsTrigger value="inner">Inner</TabsTrigger>
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
              title="Position Measurements"
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
              title="Position Measurements"
            />

            <ShutheightFields type="inner" data={data} handleFieldUpdate={handleFieldUpdate} />
          </TabsContent>
        </Tabs>
      </div>

      <div className="space-y-6 border-t pt-6">
        <h4 className="font-semibold text-sm">Additional Information</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              Has Parallelism Been Adjusted?
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
    </div>
  );
}
