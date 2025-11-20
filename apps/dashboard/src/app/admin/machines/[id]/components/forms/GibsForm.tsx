'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown } from 'lucide-react';
import { type GibsStageData, type GibsFormProps } from '@/data/types/services.types';
import { calculateGibsFields } from './gibsCalculations';

// Point field names organized by measurement type and position in diagram
// Front to Back: arranged as they appear in the diagram (top to bottom, left to right)
const FRONT_TO_BACK_POINTS_LEFT = ['point2', 'point1', 'point4', 'point3'] as const;
const FRONT_TO_BACK_POINTS_RIGHT = ['point6', 'point5', 'point8', 'point7'] as const;

// Top view (for After Install on Outer Slide): only top surface points
const TOP_VIEW_POINTS_LEFT = ['point2', 'point1'] as const;
const TOP_VIEW_POINTS_RIGHT = ['point6', 'point5'] as const;

// Left to Right: arranged as they appear in the diagram (top to bottom, left to right)
const LEFT_TO_RIGHT_POINTS_LEFT = ['point13', 'point9', 'point15', 'point11'] as const;
const LEFT_TO_RIGHT_POINTS_RIGHT = ['point14', 'point10', 'point16', 'point12'] as const;

interface GibsFormExtendedProps extends GibsFormProps {
  slideType: 'outer' | 'inner';
  beforeAdjustmentData?: GibsStageData;
  afterAdjustmentData?: GibsStageData;
  afterInstallData?: GibsStageData;
  onBeforeAdjustmentUpdate?: (field: keyof GibsStageData, value: number) => void;
  onAfterAdjustmentUpdate?: (field: keyof GibsStageData, value: number) => void;
  onAfterInstallUpdate?: (field: keyof GibsStageData, value: number) => void;
  beforeAdjustmentErrors?: Record<string, string>;
  afterAdjustmentErrors?: Record<string, string>;
  afterInstallErrors?: Record<string, string>;
  handleBeforeBlur?: (field: keyof GibsStageData) => void;
  handleAfterBlur?: (field: keyof GibsStageData) => void;
  handleAfterInstallBlur?: (field: keyof GibsStageData) => void;
}

interface MeasurementInputsProps {
  points: readonly string[];
  data: GibsStageData;
  updateFn: (field: keyof GibsStageData, value: number) => void;
  handleBlur: (field: keyof GibsStageData) => void;
  errors: Record<string, string>;
  title: string;
  t: any;
}

function MeasurementInputs({
  points,
  data,
  updateFn,
  handleBlur,
  errors,
  title,
  t,
}: MeasurementInputsProps) {
  return (
    <div className="space-y-3">
      {points.map((field) => {
        const pointNumber = field.replace('point', '');
        return (
          <div key={field}>
            <Label htmlFor={`${field}-${title}`} className="text-xs">
              {t('form.gibs.point', { number: pointNumber })}
            </Label>
            <Input
              id={`${field}-${title}`}
              type="number"
              step="0.0001"
              min="0"
              max="999999.9999"
              value={Number(data[field as keyof GibsStageData])}
              onChange={(e) => updateFn(field as keyof GibsStageData, Number(e.target.value))}
              onBlur={() => handleBlur(field as keyof GibsStageData)}
              className={`mt-1 ${errors[field] ? 'border-destructive' : ''}`}
              required
            />
            {errors[field] && <p className="text-xs text-destructive mt-1">{errors[field]}</p>}
          </div>
        );
      })}
    </div>
  );
}

interface MeasurementSectionProps {
  title: string;
  data: GibsStageData;
  updateFn: (field: keyof GibsStageData, value: number) => void;
  handleBlur: (field: keyof GibsStageData) => void;
  errors: Record<string, string>;
  diagramType: 'frontToBack' | 'leftToRight' | 'topView';
  t: any;
}

function MeasurementSection({
  title,
  data,
  updateFn,
  handleBlur,
  errors,
  diagramType,
  t,
}: MeasurementSectionProps) {
  const calculated = useMemo(() => calculateGibsFields(data), [data]);

  const diagramPath = useMemo(() => {
    if (diagramType === 'topView') return '/assets/gibs/top.png';
    return diagramType === 'frontToBack'
      ? '/assets/gibs/front-to-back.png'
      : '/assets/gibs/left-to-right.png';
  }, [diagramType]);

  const relevantPointsLeft = useMemo(() => {
    if (diagramType === 'topView') return TOP_VIEW_POINTS_LEFT;
    return diagramType === 'frontToBack' ? FRONT_TO_BACK_POINTS_LEFT : LEFT_TO_RIGHT_POINTS_LEFT;
  }, [diagramType]);

  const relevantPointsRight = useMemo(() => {
    if (diagramType === 'topView') return TOP_VIEW_POINTS_RIGHT;
    return diagramType === 'frontToBack' ? FRONT_TO_BACK_POINTS_RIGHT : LEFT_TO_RIGHT_POINTS_RIGHT;
  }, [diagramType]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">
          {diagramType === 'frontToBack'
            ? t('form.gibs.frontToBackTitle')
            : t('form.gibs.leftToRightTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
          {/* Left side - First 4 points */}
          <MeasurementInputs
            points={relevantPointsLeft}
            data={data}
            updateFn={updateFn}
            handleBlur={handleBlur}
            errors={errors}
            title={title}
            t={t}
          />

          {/* Center - Diagram */}
          <div className="flex justify-center items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={diagramPath}
              alt={`GIBS measurement diagram for ${title}`}
              className="max-w-full h-auto"
              style={{ maxHeight: '300px' }}
            />
          </div>

          {/* Right side - Last 4 points */}
          <MeasurementInputs
            points={relevantPointsRight}
            data={data}
            updateFn={updateFn}
            handleBlur={handleBlur}
            errors={errors}
            title={title}
            t={t}
          />
        </div>

        {/* Calculated Fields Display - Show only relevant table based on diagram type */}
        <div className="mt-6 flex justify-center">
          {diagramType === 'topView' ? (
            /* Top View Table - only Top row with Left/Right */
            <div className="w-full max-w-md">
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border p-2 font-medium"></th>
                      <th className="border p-2 font-medium">{t('form.gibs.left')}</th>
                      <th className="border p-2 font-medium">{t('form.gibs.right')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2 font-medium bg-muted">{t('form.gibs.top')}</td>
                      <td className="border p-2 text-center font-mono">
                        {(data.point1 + data.point2).toFixed(4)}
                      </td>
                      <td className="border p-2 text-center font-mono">
                        {(data.point5 + data.point6).toFixed(4)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : diagramType === 'frontToBack' ? (
            /* Front/Back Table - for Front to Back measurements */
            <div className="w-full max-w-md">
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border p-2 font-medium"></th>
                      <th className="border p-2 font-medium">{t('form.gibs.top')}</th>
                      <th className="border p-2 font-medium">{t('form.gibs.bottom')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2 font-medium bg-muted">{t('form.gibs.front')}</td>
                      <td className="border p-2 text-center font-mono">
                        {calculated.frontTop.toFixed(4)}
                      </td>
                      <td className="border p-2 text-center font-mono">
                        {calculated.frontBottom.toFixed(4)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-medium bg-muted">{t('form.gibs.back')}</td>
                      <td className="border p-2 text-center font-mono">
                        {calculated.backTop.toFixed(4)}
                      </td>
                      <td className="border p-2 text-center font-mono">
                        {calculated.backBottom.toFixed(4)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Left/Right Table with Usable - for Left to Right measurements */
            <div className="w-full max-w-md">
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border p-2 font-medium"></th>
                      <th className="border p-2 font-medium">{t('form.gibs.left')}</th>
                      <th className="border p-2 font-medium">{t('form.gibs.right')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2 font-medium bg-muted">{t('form.gibs.top')}</td>
                      <td className="border p-2 text-center font-mono">
                        {calculated.leftTop.toFixed(4)}
                      </td>
                      <td className="border p-2 text-center font-mono">
                        {calculated.rightTop.toFixed(4)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-medium bg-muted">{t('form.gibs.bottom')}</td>
                      <td className="border p-2 text-center font-mono">
                        {calculated.leftBottom.toFixed(4)}
                      </td>
                      <td className="border p-2 text-center font-mono">
                        {calculated.rightBottom.toFixed(4)}
                      </td>
                    </tr>
                    {calculated.usable !== undefined && (
                      <tr>
                        <td className="border p-2 font-medium bg-muted">
                          {t('form.gibs.usable')}
                        </td>
                        <td className="border p-2 text-center font-mono" colSpan={2}>
                          {calculated.usable.toFixed(4)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function GibsForm({
  slideType,
  beforeAdjustmentData,
  afterAdjustmentData,
  afterInstallData,
  onBeforeAdjustmentUpdate,
  onAfterAdjustmentUpdate,
  onAfterInstallUpdate,
  beforeAdjustmentErrors = {},
  afterAdjustmentErrors = {},
  afterInstallErrors = {},
  handleBeforeBlur = () => {},
  handleAfterBlur = () => {},
  handleAfterInstallBlur = () => {},
}: GibsFormExtendedProps) {
  const t = useTranslations('inspections');
  const [includePreviousMeasurements, setIncludePreviousMeasurements] = useState(false);
  const [beforeAdjustmentOpen, setBeforeAdjustmentOpen] = useState(false);
  const [afterAdjustmentOpen, setAfterAdjustmentOpen] = useState(false);
  const [afterInstallOpen, setAfterInstallOpen] = useState(false);

  // For Outer slide: show collapsible sections when checkbox is checked
  // For Inner slide: always show all sections without collapsible
  if (slideType === 'outer') {
    return (
      <div className="space-y-6">
        {/* Checkbox to include previous measurements */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="include-previous-measurements"
            checked={includePreviousMeasurements}
            onCheckedChange={(checked) => setIncludePreviousMeasurements(checked as boolean)}
          />
          <Label
            htmlFor="include-previous-measurements"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t('form.gibs.includePreviousMeasurements')}
          </Label>
        </div>

        {includePreviousMeasurements ? (
          <>
            {/* Before Adjustment - Collapsible */}
            {beforeAdjustmentData && onBeforeAdjustmentUpdate && (
              <Collapsible open={beforeAdjustmentOpen} onOpenChange={setBeforeAdjustmentOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <span className="font-medium">{t('form.gibs.beforeAdjustment')}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${beforeAdjustmentOpen ? 'rotate-180' : ''}`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <MeasurementSection
                      title="Before Adjustment - Front to Back"
                      data={beforeAdjustmentData}
                      updateFn={onBeforeAdjustmentUpdate}
                      handleBlur={handleBeforeBlur}
                      errors={beforeAdjustmentErrors}
                      diagramType="frontToBack"
                      t={t}
                    />
                    <MeasurementSection
                      title="Before Adjustment - Left to Right"
                      data={beforeAdjustmentData}
                      updateFn={onBeforeAdjustmentUpdate}
                      handleBlur={handleBeforeBlur}
                      errors={beforeAdjustmentErrors}
                      diagramType="leftToRight"
                      t={t}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* After Adjustment - Collapsible */}
            {afterAdjustmentData && onAfterAdjustmentUpdate && (
              <Collapsible open={afterAdjustmentOpen} onOpenChange={setAfterAdjustmentOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <span className="font-medium">{t('form.gibs.afterAdjustment')}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${afterAdjustmentOpen ? 'rotate-180' : ''}`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <MeasurementSection
                      title="After Adjustment - Front to Back"
                      data={afterAdjustmentData}
                      updateFn={onAfterAdjustmentUpdate}
                      handleBlur={handleAfterBlur}
                      errors={afterAdjustmentErrors}
                      diagramType="frontToBack"
                      t={t}
                    />
                    <MeasurementSection
                      title="After Adjustment - Left to Right"
                      data={afterAdjustmentData}
                      updateFn={onAfterAdjustmentUpdate}
                      handleBlur={handleAfterBlur}
                      errors={afterAdjustmentErrors}
                      diagramType="leftToRight"
                      t={t}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Free Hanging (After Install) - Collapsible when checkbox is checked */}
            {afterInstallData && onAfterInstallUpdate && (
              <Collapsible open={afterInstallOpen} onOpenChange={setAfterInstallOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <span className="font-medium">{t('form.gibs.freeHangingAfterInstall')}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${afterInstallOpen ? 'rotate-180' : ''}`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <MeasurementSection
                      title="Free Hanging - Top View"
                      data={afterInstallData}
                      updateFn={onAfterInstallUpdate}
                      handleBlur={handleAfterInstallBlur}
                      errors={afterInstallErrors}
                      diagramType="topView"
                      t={t}
                    />
                    <MeasurementSection
                      title="Free Hanging - Left to Right"
                      data={afterInstallData}
                      updateFn={onAfterInstallUpdate}
                      handleBlur={handleAfterInstallBlur}
                      errors={afterInstallErrors}
                      diagramType="leftToRight"
                      t={t}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </>
        ) : (
          /* When checkbox is not checked, show only Free Hanging as non-collapsible */
          afterInstallData &&
          onAfterInstallUpdate && (
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">{t('form.gibs.freeHangingAfterInstall')}</h4>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <MeasurementSection
                  title="Free Hanging - Top View"
                  data={afterInstallData}
                  updateFn={onAfterInstallUpdate}
                  handleBlur={handleAfterInstallBlur}
                  errors={afterInstallErrors}
                  diagramType="topView"
                  t={t}
                />
                <MeasurementSection
                  title="Free Hanging - Left to Right"
                  data={afterInstallData}
                  updateFn={onAfterInstallUpdate}
                  handleBlur={handleAfterInstallBlur}
                  errors={afterInstallErrors}
                  diagramType="leftToRight"
                  t={t}
                />
              </div>
            </div>
          )
        )}
      </div>
    );
  }

  // Inner slide - no collapsible, just tabs
  return (
    <div className="space-y-6">
      <Tabs defaultValue="beforeAdjustment" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="beforeAdjustment">{t('form.gibs.beforeAdjustment')}</TabsTrigger>
          <TabsTrigger value="afterAdjustment">{t('form.gibs.afterAdjustment')}</TabsTrigger>
        </TabsList>

        {beforeAdjustmentData && onBeforeAdjustmentUpdate && (
          <TabsContent value="beforeAdjustment" className="mt-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <MeasurementSection
                title="Before Adjustment - Front to Back"
                data={beforeAdjustmentData}
                updateFn={onBeforeAdjustmentUpdate}
                handleBlur={handleBeforeBlur}
                errors={beforeAdjustmentErrors}
                diagramType="frontToBack"
                t={t}
              />
              <MeasurementSection
                title="Before Adjustment - Left to Right"
                data={beforeAdjustmentData}
                updateFn={onBeforeAdjustmentUpdate}
                handleBlur={handleBeforeBlur}
                errors={beforeAdjustmentErrors}
                diagramType="leftToRight"
                t={t}
              />
            </div>
          </TabsContent>
        )}

        {afterAdjustmentData && onAfterAdjustmentUpdate && (
          <TabsContent value="afterAdjustment" className="mt-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <MeasurementSection
                title="After Adjustment - Front to Back"
                data={afterAdjustmentData}
                updateFn={onAfterAdjustmentUpdate}
                handleBlur={handleAfterBlur}
                errors={afterAdjustmentErrors}
                diagramType="frontToBack"
                t={t}
              />
              <MeasurementSection
                title="After Adjustment - Left to Right"
                data={afterAdjustmentData}
                updateFn={onAfterAdjustmentUpdate}
                handleBlur={handleAfterBlur}
                errors={afterAdjustmentErrors}
                diagramType="leftToRight"
                t={t}
              />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
