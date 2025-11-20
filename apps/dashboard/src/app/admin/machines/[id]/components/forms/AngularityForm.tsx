'use client';

import { useTranslations } from 'next-intl';
import { forwardRef, useImperativeHandle, useState } from 'react';
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
import { MeasurementInput } from '../shared/MeasurementInput';

export interface AngularityFormData {
  // Metadata
  sizeTonnage?: string;
  serialNumber?: string;
  stroke?: string;
  spm?: string;

  // Setup
  distanceIndicatorTipFromSlide?: string;
  locationOfIndicator?: string;
  counterbalancePressure?: string;

  // Configuration
  partOfStrokeBeingRead?: string;
  shutheightSetAt?: string;
  whatWasUsedAsSquare?: string;
  whereWasSquarePlaced?: string;

  // Indicator details
  whatIndicatorWasUsed?: string;
  whatKindOfTipWasOnIndicator?: string;
  totalLiftCheck?: string;

  // Perpendicularity
  hasPerpendicularityBeenAdjusted?: 'YES' | 'NO' | 'DNC';

  // Before/After measurements
  beforeFr?: number;
  beforeLr?: number;
  afterFr?: number;
  afterLr?: number;

  // Notes
  notes?: string;
}

export interface AngularityFormHandle {
  getData: () => AngularityFormData;
  validate: () => string[];
  reset: () => void;
  isTouched: () => boolean;
  validateAndGetData: () => { data: AngularityFormData | null; errors: string[] };
}

interface AngularityFormProps {
  data?: AngularityFormData;
  readOnly?: boolean;
}

export const AngularityForm = forwardRef<AngularityFormHandle, AngularityFormProps>(
  ({ data: initialData, readOnly = false }, ref) => {
    const t = useTranslations('inspections.form.angularity');
    const tCommon = useTranslations('common');

    const [data, setData] = useState<AngularityFormData>(
      initialData || {
        hasPerpendicularityBeenAdjusted: 'DNC',
      },
    );
    const [touched, setTouched] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const updateField = <K extends keyof AngularityFormData>(
      field: K,
      value: AngularityFormData[K],
    ) => {
      setData((prev) => ({ ...prev, [field]: value }));
      setTouched(true);
      // Clear error for this field
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    };

    const updateMeasurement = (field: keyof AngularityFormData, value: number) => {
      updateField(field, value as any);
    };

    const handleBlur = (field: keyof AngularityFormData) => {
      setTouched(true);
    };

    const validate = (): string[] => {
      const validationErrors: string[] = [];
      // Add validation logic if needed
      // For now, no required fields
      return validationErrors;
    };

    const validateAndGetData = () => {
      const validationErrors = validate();
      if (validationErrors.length > 0) {
        return { data: null, errors: validationErrors };
      }
      return { data, errors: [] };
    };

    const reset = () => {
      setData({ hasPerpendicularityBeenAdjusted: 'DNC' });
      setTouched(false);
      setErrors({});
    };

    useImperativeHandle(ref, () => ({
      getData: () => data,
      validate,
      reset,
      isTouched: () => touched,
      validateAndGetData,
    }));

    return (
      <div className="space-y-6">
        {/* Metadata Section */}
        <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">{t('metadata')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sizeTonnage" className="text-xs">
                {t('sizeTonnage')}
              </Label>
              <Input
                id="sizeTonnage"
                value={data.sizeTonnage || ''}
                onChange={(e) => updateField('sizeTonnage', e.target.value)}
                onBlur={() => handleBlur('sizeTonnage')}
                disabled={readOnly}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="serialNumber" className="text-xs">
                {t('serialNumber')}
              </Label>
              <Input
                id="serialNumber"
                value={data.serialNumber || ''}
                onChange={(e) => updateField('serialNumber', e.target.value)}
                onBlur={() => handleBlur('serialNumber')}
                disabled={readOnly}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="stroke" className="text-xs">
                {t('stroke')}
              </Label>
              <Input
                id="stroke"
                value={data.stroke || ''}
                onChange={(e) => updateField('stroke', e.target.value)}
                onBlur={() => handleBlur('stroke')}
                disabled={readOnly}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="spm" className="text-xs">
                {t('spm')}
              </Label>
              <Input
                id="spm"
                value={data.spm || ''}
                onChange={(e) => updateField('spm', e.target.value)}
                onBlur={() => handleBlur('spm')}
                disabled={readOnly}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Setup Section */}
        <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">{t('setup')}</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="distanceIndicatorTipFromSlide" className="text-xs">
                {t('distanceIndicatorTipFromSlide')}
              </Label>
              <Input
                id="distanceIndicatorTipFromSlide"
                value={data.distanceIndicatorTipFromSlide || ''}
                onChange={(e) => updateField('distanceIndicatorTipFromSlide', e.target.value)}
                onBlur={() => handleBlur('distanceIndicatorTipFromSlide')}
                disabled={readOnly}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="locationOfIndicator" className="text-xs">
                {t('locationOfIndicator')}
              </Label>
              <Input
                id="locationOfIndicator"
                value={data.locationOfIndicator || ''}
                onChange={(e) => updateField('locationOfIndicator', e.target.value)}
                onBlur={() => handleBlur('locationOfIndicator')}
                disabled={readOnly}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="counterbalancePressure" className="text-xs">
                {t('counterbalancePressure')}
              </Label>
              <Input
                id="counterbalancePressure"
                value={data.counterbalancePressure || ''}
                onChange={(e) => updateField('counterbalancePressure', e.target.value)}
                onBlur={() => handleBlur('counterbalancePressure')}
                disabled={readOnly}
                className="mt-1"
                placeholder="PSI"
              />
            </div>
          </div>
        </div>

        {/* Configuration Section */}
        <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">{t('configuration')}</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="partOfStrokeBeingRead" className="text-xs">
                {t('partOfStrokeBeingRead')}
              </Label>
              <Input
                id="partOfStrokeBeingRead"
                value={data.partOfStrokeBeingRead || ''}
                onChange={(e) => updateField('partOfStrokeBeingRead', e.target.value)}
                onBlur={() => handleBlur('partOfStrokeBeingRead')}
                disabled={readOnly}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="shutheightSetAt" className="text-xs">
                {t('shutheightSetAt')}
              </Label>
              <Input
                id="shutheightSetAt"
                value={data.shutheightSetAt || ''}
                onChange={(e) => updateField('shutheightSetAt', e.target.value)}
                onBlur={() => handleBlur('shutheightSetAt')}
                disabled={readOnly}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="whatWasUsedAsSquare" className="text-xs">
                {t('whatWasUsedAsSquare')}
              </Label>
              <Input
                id="whatWasUsedAsSquare"
                value={data.whatWasUsedAsSquare || ''}
                onChange={(e) => updateField('whatWasUsedAsSquare', e.target.value)}
                onBlur={() => handleBlur('whatWasUsedAsSquare')}
                disabled={readOnly}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="whereWasSquarePlaced" className="text-xs">
                {t('whereWasSquarePlaced')}
              </Label>
              <Input
                id="whereWasSquarePlaced"
                value={data.whereWasSquarePlaced || ''}
                onChange={(e) => updateField('whereWasSquarePlaced', e.target.value)}
                onBlur={() => handleBlur('whereWasSquarePlaced')}
                disabled={readOnly}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Indicator Details Section */}
        <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">{t('indicatorDetails')}</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="whatIndicatorWasUsed" className="text-xs">
                {t('whatIndicatorWasUsed')}
              </Label>
              <Input
                id="whatIndicatorWasUsed"
                value={data.whatIndicatorWasUsed || ''}
                onChange={(e) => updateField('whatIndicatorWasUsed', e.target.value)}
                onBlur={() => handleBlur('whatIndicatorWasUsed')}
                disabled={readOnly}
                className="mt-1"
                placeholder={t('graduationPlaceholder')}
              />
            </div>
            <div>
              <Label htmlFor="whatKindOfTipWasOnIndicator" className="text-xs">
                {t('whatKindOfTipWasOnIndicator')}
              </Label>
              <Input
                id="whatKindOfTipWasOnIndicator"
                value={data.whatKindOfTipWasOnIndicator || ''}
                onChange={(e) => updateField('whatKindOfTipWasOnIndicator', e.target.value)}
                onBlur={() => handleBlur('whatKindOfTipWasOnIndicator')}
                disabled={readOnly}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="totalLiftCheck" className="text-xs">
                {t('totalLiftCheck')}
              </Label>
              <Input
                id="totalLiftCheck"
                value={data.totalLiftCheck || ''}
                onChange={(e) => updateField('totalLiftCheck', e.target.value)}
                onBlur={() => handleBlur('totalLiftCheck')}
                disabled={readOnly}
                className="mt-1"
                placeholder="IN"
              />
            </div>
          </div>
        </div>

        {/* Perpendicularity Section */}
        <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">{t('perpendicularity')}</h3>
          <div>
            <Label htmlFor="hasPerpendicularityBeenAdjusted" className="text-xs">
              {t('hasPerpendicularityBeenAdjusted')}
            </Label>
            <Select
              value={data.hasPerpendicularityBeenAdjusted || 'DNC'}
              onValueChange={(value: 'YES' | 'NO' | 'DNC') =>
                updateField('hasPerpendicularityBeenAdjusted', value)
              }
              disabled={readOnly}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="YES">{tCommon('yes')}</SelectItem>
                <SelectItem value="NO">{tCommon('no')}</SelectItem>
                <SelectItem value="DNC">{tCommon('dnc')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Before/After Adjustment Measurements */}
        <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">{t('measurements')}</h3>

          {/* Before Adjustment */}
          <div className="mb-4">
            <h4 className="text-xs font-medium mb-2 text-muted-foreground">
              {t('beforeAdjustment')}
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="beforeFr" className="text-xs">
                  {t('fr')} (F-R)
                </Label>
                <MeasurementInput
                  field="beforeFr"
                  value={data.beforeFr}
                  onChange={updateMeasurement}
                  onBlur={handleBlur}
                  error={errors.beforeFr}
                  readOnly={readOnly}
                />
              </div>
              <div>
                <Label htmlFor="beforeLr" className="text-xs">
                  {t('lr')} (L-R)
                </Label>
                <MeasurementInput
                  field="beforeLr"
                  value={data.beforeLr}
                  onChange={updateMeasurement}
                  onBlur={handleBlur}
                  error={errors.beforeLr}
                  readOnly={readOnly}
                />
              </div>
            </div>
          </div>

          {/* After Adjustment */}
          <div>
            <h4 className="text-xs font-medium mb-2 text-muted-foreground">
              {t('afterAdjustment')}
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="afterFr" className="text-xs">
                  {t('fr')} (F-R)
                </Label>
                <MeasurementInput
                  field="afterFr"
                  value={data.afterFr}
                  onChange={updateMeasurement}
                  onBlur={handleBlur}
                  error={errors.afterFr}
                  readOnly={readOnly}
                />
              </div>
              <div>
                <Label htmlFor="afterLr" className="text-xs">
                  {t('lr')} (L-R)
                </Label>
                <MeasurementInput
                  field="afterLr"
                  value={data.afterLr}
                  onChange={updateMeasurement}
                  onBlur={handleBlur}
                  error={errors.afterLr}
                  readOnly={readOnly}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-4">
          <Label htmlFor="notes" className="text-xs font-semibold">
            {t('notes')}
          </Label>
          <Textarea
            id="notes"
            value={data.notes || ''}
            onChange={(e) => updateField('notes', e.target.value)}
            onBlur={() => handleBlur('notes')}
            disabled={readOnly}
            className="mt-2 min-h-[80px]"
            placeholder={t('notesPlaceholder')}
          />
        </div>
      </div>
    );
  },
);

AngularityForm.displayName = 'AngularityForm';
