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
import { type GibsStageData } from '@/data/types/services.types';
import { calculateGibsFields } from './gibsCalculations';

type TranslationFunction = ReturnType<typeof useTranslations>;

const FRONT_TO_BACK_POINTS_LEFT = ['point2', 'point1', 'point4', 'point3'] as const;
const FRONT_TO_BACK_POINTS_RIGHT = ['point6', 'point5', 'point8', 'point7'] as const;

const TOP_VIEW_POINTS_LEFT = ['point2', 'point1'] as const;
const TOP_VIEW_POINTS_RIGHT = ['point6', 'point5'] as const;

const LEFT_TO_RIGHT_POINTS_LEFT = ['point13', 'point9', 'point15', 'point11'] as const;
const LEFT_TO_RIGHT_POINTS_RIGHT = ['point14', 'point10', 'point16', 'point12'] as const;

const BEFORE_TOOL_POINTS_LEFT = ['point2', 'point1', 'point4', 'point3'] as const;
const BEFORE_TOOL_POINTS_RIGHT = ['point6', 'point5', 'point8', 'point7'] as const;

const AFTER_TOOL_POINTS_LEFT = ['point13', 'point9'] as const;
const AFTER_TOOL_POINTS_RIGHT = ['point14', 'point10'] as const;

interface StageConfig {
  data?: GibsStageData;
  onUpdate?: (field: keyof GibsStageData, value: number) => void;
  errors?: Record<string, string>;
  handleBlur?: (field: keyof GibsStageData) => void;
}

interface GibsFormProps {
  slideType: 'outer' | 'inner';
  beforeAdjustment?: StageConfig;
  afterAdjustment?: StageConfig;
  afterInstall?: StageConfig;
  beforeToolInstall?: StageConfig;
  afterToolInstall?: StageConfig;
}

interface MeasurementInputsProps {
  points: readonly string[];
  data: GibsStageData;
  updateFn: (field: keyof GibsStageData, value: number) => void;
  handleBlur: (field: keyof GibsStageData) => void;
  errors: Record<string, string>;
  title: string;
  t: TranslationFunction;
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
  diagramType: 'frontToBack' | 'leftToRight' | 'topView' | 'beforeTool' | 'afterTool';
  t: TranslationFunction;
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
  // Helper to safely add two point values
  const addPoints = (a: number | undefined, b: number | undefined): string => {
    const numA = typeof a === 'number' ? a : 0;
    const numB = typeof b === 'number' ? b : 0;
    return (numA + numB).toFixed(4);
  };

  const calculated = useMemo(() => calculateGibsFields(data), [data]);

  const diagramPath = useMemo(() => {
    if (diagramType === 'topView') return '/assets/gibs/top.png';
    if (diagramType === 'beforeTool') return '/assets/gibs/before-tool-instalation.png';
    if (diagramType === 'afterTool') return '/assets/gibs/after-tool-instalation.png';
    return diagramType === 'frontToBack'
      ? '/assets/gibs/front-to-back.png'
      : '/assets/gibs/left-to-right.png';
  }, [diagramType]);

  const relevantPointsLeft = useMemo(() => {
    if (diagramType === 'topView') return TOP_VIEW_POINTS_LEFT;
    if (diagramType === 'beforeTool') return BEFORE_TOOL_POINTS_LEFT;
    if (diagramType === 'afterTool') return AFTER_TOOL_POINTS_LEFT;
    return diagramType === 'frontToBack' ? FRONT_TO_BACK_POINTS_LEFT : LEFT_TO_RIGHT_POINTS_LEFT;
  }, [diagramType]);

  const relevantPointsRight = useMemo(() => {
    if (diagramType === 'topView') return TOP_VIEW_POINTS_RIGHT;
    if (diagramType === 'beforeTool') return BEFORE_TOOL_POINTS_RIGHT;
    if (diagramType === 'afterTool') return AFTER_TOOL_POINTS_RIGHT;
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
          <MeasurementInputs
            points={relevantPointsLeft}
            data={data}
            updateFn={updateFn}
            handleBlur={handleBlur}
            errors={errors}
            title={title}
            t={t}
          />

          <div className="flex justify-center items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={diagramPath}
              alt={`GIBS measurement diagram for ${title}`}
              className="max-w-full h-auto"
              style={{ maxHeight: '300px' }}
            />
          </div>

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

        <div className="mt-6 flex justify-center">
          {diagramType === 'topView' ? (
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
                        {addPoints(data.point1, data.point2)}
                      </td>
                      <td className="border p-2 text-center font-mono">
                        {addPoints(data.point5, data.point6)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : diagramType === 'frontToBack' ? (
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
          ) : diagramType === 'beforeTool' ? (
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
                        {addPoints(data.point1, data.point2)}
                      </td>
                      <td className="border p-2 text-center font-mono">
                        {addPoints(data.point5, data.point6)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-medium bg-muted">{t('form.gibs.bottom')}</td>
                      <td className="border p-2 text-center font-mono">
                        {addPoints(data.point3, data.point4)}
                      </td>
                      <td className="border p-2 text-center font-mono">
                        {addPoints(data.point7, data.point8)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : diagramType === 'afterTool' ? (
            <div className="w-full max-w-md">
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border p-2 font-medium"></th>
                      <th className="border p-2 font-medium">{t('form.gibs.front')}</th>
                      <th className="border p-2 font-medium">{t('form.gibs.rear')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2 font-medium bg-muted">{t('form.gibs.top')}</td>
                      <td className="border p-2 text-center font-mono">
                        {addPoints(data.point9, data.point13)}
                      </td>
                      <td className="border p-2 text-center font-mono">
                        {addPoints(data.point10, data.point14)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
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
                        <td className="border p-2 font-medium bg-muted">{t('form.gibs.usable')}</td>
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
  beforeAdjustment,
  afterAdjustment,
  afterInstall,
  beforeToolInstall,
  afterToolInstall,
}: GibsFormProps) {
  const t = useTranslations('inspections');
  const [includePreviousMeasurements, setIncludePreviousMeasurements] = useState(false);
  const [beforeAdjustmentOpen, setBeforeAdjustmentOpen] = useState(false);
  const [afterAdjustmentOpen, setAfterAdjustmentOpen] = useState(false);
  const [afterInstallOpen, setAfterInstallOpen] = useState(false);
  const [includeAdjustmentPrevious, setIncludeAdjustmentPrevious] = useState(false);
  const [adjustmentBeforeOpen, setAdjustmentBeforeOpen] = useState(false);
  const [adjustmentAfterOpen, setAdjustmentAfterOpen] = useState(false);

  if (slideType === 'outer') {
    return (
      <div className="space-y-4">
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
            {beforeAdjustment?.data && beforeAdjustment?.onUpdate && (
              <Collapsible open={beforeAdjustmentOpen} onOpenChange={setBeforeAdjustmentOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <span className="text-sm font-medium">{t('form.gibs.beforeAdjustment')}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${beforeAdjustmentOpen ? 'rotate-180' : ''}`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <MeasurementSection
                      title="Before Adjustment - Front to Back"
                      data={beforeAdjustment.data!}
                      updateFn={beforeAdjustment.onUpdate!}
                      handleBlur={beforeAdjustment.handleBlur || (() => {})}
                      errors={beforeAdjustment.errors || {}}
                      diagramType="frontToBack"
                      t={t}
                    />
                    <MeasurementSection
                      title="Before Adjustment - Left to Right"
                      data={beforeAdjustment.data!}
                      updateFn={beforeAdjustment.onUpdate!}
                      handleBlur={beforeAdjustment.handleBlur || (() => {})}
                      errors={beforeAdjustment.errors || {}}
                      diagramType="leftToRight"
                      t={t}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {afterAdjustment?.data && afterAdjustment?.onUpdate && (
              <Collapsible open={afterAdjustmentOpen} onOpenChange={setAfterAdjustmentOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <span className="text-sm font-medium">{t('form.gibs.afterAdjustment')}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${afterAdjustmentOpen ? 'rotate-180' : ''}`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <MeasurementSection
                      title="After Adjustment - Front to Back"
                      data={afterAdjustment.data!}
                      updateFn={afterAdjustment.onUpdate!}
                      handleBlur={afterAdjustment.handleBlur || (() => {})}
                      errors={afterAdjustment.errors || {}}
                      diagramType="frontToBack"
                      t={t}
                    />
                    <MeasurementSection
                      title="After Adjustment - Left to Right"
                      data={afterAdjustment.data!}
                      updateFn={afterAdjustment.onUpdate!}
                      handleBlur={afterAdjustment.handleBlur || (() => {})}
                      errors={afterAdjustment.errors || {}}
                      diagramType="leftToRight"
                      t={t}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {afterInstall?.data && afterInstall?.onUpdate && (
              <Collapsible open={afterInstallOpen} onOpenChange={setAfterInstallOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <span className="text-sm font-medium">
                    {t('form.gibs.freeHangingAfterInstall')}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${afterInstallOpen ? 'rotate-180' : ''}`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <MeasurementSection
                      title="Free Hanging - Top View"
                      data={afterInstall.data!}
                      updateFn={afterInstall.onUpdate!}
                      handleBlur={afterInstall.handleBlur || (() => {})}
                      errors={afterInstall.errors || {}}
                      diagramType="topView"
                      t={t}
                    />
                    <MeasurementSection
                      title="Free Hanging - Left to Right"
                      data={afterInstall.data!}
                      updateFn={afterInstall.onUpdate!}
                      handleBlur={afterInstall.handleBlur || (() => {})}
                      errors={afterInstall.errors || {}}
                      diagramType="leftToRight"
                      t={t}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </>
        ) : (
          afterInstall?.data &&
          afterInstall?.onUpdate && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">{t('form.gibs.freeHangingAfterInstall')}</h4>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <MeasurementSection
                  title="Free Hanging - Top View"
                  data={afterInstall.data!}
                  updateFn={afterInstall.onUpdate!}
                  handleBlur={afterInstall.handleBlur || (() => {})}
                  errors={afterInstall.errors || {}}
                  diagramType="topView"
                  t={t}
                />
                <MeasurementSection
                  title="Free Hanging - Left to Right"
                  data={afterInstall.data!}
                  updateFn={afterInstall.onUpdate!}
                  handleBlur={afterInstall.handleBlur || (() => {})}
                  errors={afterInstall.errors || {}}
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

  return (
    <div className="space-y-4">
      <Tabs defaultValue="adjustment" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="adjustment">Adjustment</TabsTrigger>
          <TabsTrigger value="installation">Installation</TabsTrigger>
        </TabsList>

        <TabsContent value="adjustment" className="space-y-4 mt-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-adjustment-previous"
              checked={includeAdjustmentPrevious}
              onCheckedChange={(checked) => setIncludeAdjustmentPrevious(checked as boolean)}
            />
            <Label
              htmlFor="include-adjustment-previous"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t('form.gibs.includePreviousMeasurements')}
            </Label>
          </div>

          {includeAdjustmentPrevious ? (
            <>
              {beforeAdjustment?.data && beforeAdjustment?.onUpdate && (
                <Collapsible open={adjustmentBeforeOpen} onOpenChange={setAdjustmentBeforeOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                    <span className="text-sm font-medium">{t('form.gibs.beforeAdjustment')}</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${adjustmentBeforeOpen ? 'rotate-180' : ''}`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 space-y-4">
                    <MeasurementSection
                      title="Before Adjustment - Left to Right"
                      data={beforeAdjustment.data!}
                      updateFn={beforeAdjustment.onUpdate!}
                      handleBlur={beforeAdjustment.handleBlur || (() => {})}
                      errors={beforeAdjustment.errors || {}}
                      diagramType="leftToRight"
                      t={t}
                    />
                  </CollapsibleContent>
                </Collapsible>
              )}

              {afterAdjustment?.data && afterAdjustment?.onUpdate && (
                <Collapsible open={adjustmentAfterOpen} onOpenChange={setAdjustmentAfterOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                    <span className="text-sm font-medium">{t('form.gibs.afterAdjustment')}</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${adjustmentAfterOpen ? 'rotate-180' : ''}`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 space-y-4">
                    <MeasurementSection
                      title="After Adjustment - Left to Right"
                      data={afterAdjustment.data!}
                      updateFn={afterAdjustment.onUpdate!}
                      handleBlur={afterAdjustment.handleBlur || (() => {})}
                      errors={afterAdjustment.errors || {}}
                      diagramType="leftToRight"
                      t={t}
                    />
                  </CollapsibleContent>
                </Collapsible>
              )}
            </>
          ) : (
            afterAdjustment?.data &&
            afterAdjustment?.onUpdate && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold">{t('form.gibs.afterAdjustment')}</h4>
                <MeasurementSection
                  title="After Adjustment - Left to Right"
                  data={afterAdjustment.data!}
                  updateFn={afterAdjustment.onUpdate!}
                  handleBlur={afterAdjustment.handleBlur || (() => {})}
                  errors={afterAdjustment.errors || {}}
                  diagramType="leftToRight"
                  t={t}
                />
              </div>
            )
          )}
        </TabsContent>

        <TabsContent value="installation" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {beforeToolInstall?.data && beforeToolInstall?.onUpdate && (
              <MeasurementSection
                title={t('form.gibs.beforeToolInstallation')}
                data={beforeToolInstall.data!}
                updateFn={beforeToolInstall.onUpdate!}
                handleBlur={beforeToolInstall.handleBlur || (() => {})}
                errors={beforeToolInstall.errors || {}}
                diagramType="beforeTool"
                t={t}
              />
            )}

            {afterToolInstall?.data && afterToolInstall?.onUpdate && (
              <MeasurementSection
                title={t('form.gibs.afterToolInstallation')}
                data={afterToolInstall.data!}
                updateFn={afterToolInstall.onUpdate!}
                handleBlur={afterToolInstall.handleBlur || (() => {})}
                errors={afterToolInstall.errors || {}}
                diagramType="afterTool"
                t={t}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
