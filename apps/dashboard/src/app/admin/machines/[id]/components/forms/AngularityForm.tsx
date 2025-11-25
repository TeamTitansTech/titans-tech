'use client';

import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  type AngularityData,
  AngularityPerpendicularityType,
  AngularityUnitType,
} from '@/data/types/services.types';
import { MeasurementInput } from '../shared/MeasurementInput';

interface AngularityFormProps {
  data: AngularityData;
  errors: Record<string, string>;
  updateField: (field: keyof AngularityData, value: string | number) => void;
  handleBlur: (field: keyof AngularityData) => void;
  title: string;
  readOnly?: boolean;
}

export function AngularityForm({
  data,
  errors,
  updateField,
  handleBlur,
  title,
  readOnly = false,
}: AngularityFormProps) {
  const t = useTranslations('inspections.form.angularity');

  return (
    <div className="space-y-6">
      <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-4">
        <h4 className="text-sm font-semibold mb-4">{title}</h4>

        {/* Setup Information Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="spm">{t('spm')}</Label>
            <Input
              id="spm"
              type="text"
              value={data.spm || ''}
              onChange={(e) => updateField('spm', e.target.value)}
              onBlur={() => handleBlur('spm')}
              readOnly={readOnly}
              className={errors.spm ? 'border-red-500' : ''}
            />
            {errors.spm && <p className="text-xs text-red-500">{errors.spm}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="distanceIndicatorTip">{t('distanceIndicatorTip')}</Label>
            <Input
              id="distanceIndicatorTip"
              type="text"
              value={data.distanceIndicatorTip || ''}
              onChange={(e) => updateField('distanceIndicatorTip', e.target.value)}
              onBlur={() => handleBlur('distanceIndicatorTip')}
              readOnly={readOnly}
              className={errors.distanceIndicatorTip ? 'border-red-500' : ''}
            />
            {errors.distanceIndicatorTip && (
              <p className="text-xs text-red-500">{errors.distanceIndicatorTip}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="locationIndicator">{t('locationIndicator')}</Label>
            <Input
              id="locationIndicator"
              type="text"
              value={data.locationIndicator || ''}
              onChange={(e) => updateField('locationIndicator', e.target.value)}
              onBlur={() => handleBlur('locationIndicator')}
              readOnly={readOnly}
              className={errors.locationIndicator ? 'border-red-500' : ''}
            />
            {errors.locationIndicator && (
              <p className="text-xs text-red-500">{errors.locationIndicator}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="counterbalancePressure">{t('counterbalancePressure')}</Label>
            <Input
              id="counterbalancePressure"
              type="text"
              value={data.counterbalancePressure || ''}
              onChange={(e) => updateField('counterbalancePressure', e.target.value)}
              onBlur={() => handleBlur('counterbalancePressure')}
              readOnly={readOnly}
              className={errors.counterbalancePressure ? 'border-red-500' : ''}
            />
            {errors.counterbalancePressure && (
              <p className="text-xs text-red-500">{errors.counterbalancePressure}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="strokePartBeingRead">{t('strokePartBeingRead')}</Label>
            <Input
              id="strokePartBeingRead"
              type="text"
              value={data.strokePartBeingRead || ''}
              onChange={(e) => updateField('strokePartBeingRead', e.target.value)}
              onBlur={() => handleBlur('strokePartBeingRead')}
              readOnly={readOnly}
              className={errors.strokePartBeingRead ? 'border-red-500' : ''}
            />
            {errors.strokePartBeingRead && (
              <p className="text-xs text-red-500">{errors.strokePartBeingRead}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shutheightSetAt">{t('shutheightSetAt')}</Label>
            <Input
              id="shutheightSetAt"
              type="text"
              value={data.shutheightSetAt || ''}
              onChange={(e) => updateField('shutheightSetAt', e.target.value)}
              onBlur={() => handleBlur('shutheightSetAt')}
              readOnly={readOnly}
              className={errors.shutheightSetAt ? 'border-red-500' : ''}
            />
            {errors.shutheightSetAt && (
              <p className="text-xs text-red-500">{errors.shutheightSetAt}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="squareUsed">{t('squareUsed')}</Label>
            <Input
              id="squareUsed"
              type="text"
              value={data.squareUsed || ''}
              onChange={(e) => updateField('squareUsed', e.target.value)}
              onBlur={() => handleBlur('squareUsed')}
              readOnly={readOnly}
              className={errors.squareUsed ? 'border-red-500' : ''}
            />
            {errors.squareUsed && <p className="text-xs text-red-500">{errors.squareUsed}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="squarePlacedLocation">{t('squarePlacedLocation')}</Label>
            <Input
              id="squarePlacedLocation"
              type="text"
              value={data.squarePlacedLocation || ''}
              onChange={(e) => updateField('squarePlacedLocation', e.target.value)}
              onBlur={() => handleBlur('squarePlacedLocation')}
              readOnly={readOnly}
              className={errors.squarePlacedLocation ? 'border-red-500' : ''}
            />
            {errors.squarePlacedLocation && (
              <p className="text-xs text-red-500">{errors.squarePlacedLocation}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="indicatorUsedGraduation">{t('indicatorUsedGraduation')}</Label>
            <Input
              id="indicatorUsedGraduation"
              type="text"
              value={data.indicatorUsedGraduation || ''}
              onChange={(e) => updateField('indicatorUsedGraduation', e.target.value)}
              onBlur={() => handleBlur('indicatorUsedGraduation')}
              readOnly={readOnly}
              className={errors.indicatorUsedGraduation ? 'border-red-500' : ''}
            />
            {errors.indicatorUsedGraduation && (
              <p className="text-xs text-red-500">{errors.indicatorUsedGraduation}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipKindOnIndicator">{t('tipKindOnIndicator')}</Label>
            <Input
              id="tipKindOnIndicator"
              type="text"
              value={data.tipKindOnIndicator || ''}
              onChange={(e) => updateField('tipKindOnIndicator', e.target.value)}
              onBlur={() => handleBlur('tipKindOnIndicator')}
              readOnly={readOnly}
              className={errors.tipKindOnIndicator ? 'border-red-500' : ''}
            />
            {errors.tipKindOnIndicator && (
              <p className="text-xs text-red-500">{errors.tipKindOnIndicator}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalLiftCheck">{t('totalLiftCheck')}</Label>
            <Input
              id="totalLiftCheck"
              type="text"
              value={data.totalLiftCheck || ''}
              onChange={(e) => updateField('totalLiftCheck', e.target.value)}
              onBlur={() => handleBlur('totalLiftCheck')}
              readOnly={readOnly}
              className={errors.totalLiftCheck ? 'border-red-500' : ''}
            />
            {errors.totalLiftCheck && (
              <p className="text-xs text-red-500">{errors.totalLiftCheck}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hasPerpendicularityAdjusted">{t('hasPerpendicularityAdjusted')}</Label>
            <Select
              value={data.hasPerpendicularityAdjusted || AngularityPerpendicularityType.DNC}
              onValueChange={(value) =>
                updateField('hasPerpendicularityAdjusted', value as AngularityPerpendicularityType)
              }
              disabled={readOnly}
            >
              <SelectTrigger className={errors.hasPerpendicularityAdjusted ? 'border-red-500' : ''}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AngularityPerpendicularityType.YES}>{t('yes')}</SelectItem>
                <SelectItem value={AngularityPerpendicularityType.NO}>{t('no')}</SelectItem>
                <SelectItem value={AngularityPerpendicularityType.DNC}>{t('dnc')}</SelectItem>
              </SelectContent>
            </Select>
            {errors.hasPerpendicularityAdjusted && (
              <p className="text-xs text-red-500">{errors.hasPerpendicularityAdjusted}</p>
            )}
          </div>
        </div>

        {/* Unit Selector */}
        <div className="mb-6">
          <Label htmlFor="unit">{t('unit')}</Label>
          <Select
            value={data.unit || AngularityUnitType.INCHES}
            onValueChange={(value) => updateField('unit', value as AngularityUnitType)}
            disabled={readOnly}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={AngularityUnitType.INCHES}>{t('inches')}</SelectItem>
              <SelectItem value={AngularityUnitType.CM}>{t('cm')}</SelectItem>
              <SelectItem value={AngularityUnitType.MM}>{t('mm')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Measurements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('measurementFR')}</Label>
            <MeasurementInput
              field="measurementFR"
              value={data.measurementFR || 0}
              onChange={(field, value) => updateField(field, value)}
              onBlur={handleBlur}
              error={errors.measurementFR}
              readOnly={readOnly}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('measurementLR')}</Label>
            <MeasurementInput
              field="measurementLR"
              value={data.measurementLR || 0}
              onChange={(field, value) => updateField(field, value)}
              onBlur={handleBlur}
              error={errors.measurementLR}
              readOnly={readOnly}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
