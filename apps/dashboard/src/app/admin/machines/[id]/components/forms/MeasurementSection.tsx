'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface MeasurementInputsProps {
  points: readonly string[];
  data: GibsStageData;
  updateFn: (field: keyof GibsStageData, value: number) => void;
  handleBlur: (field: keyof GibsStageData) => void;
  errors: Record<string, string>;
  t: TranslationFunction;
}

function MeasurementInputs({
  points,
  data,
  updateFn,
  handleBlur,
  errors,
  t,
}: MeasurementInputsProps) {
  return (
    <div className="space-y-3">
      {points.map((field) => {
        const pointNumber = field.replace('point', '');
        return (
          <div key={field}>
            <Label htmlFor={field} className="text-xs">
              {t('form.gibs.point', { number: pointNumber })}
            </Label>
            <Input
              id={field}
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

interface CalculatedTableProps {
  data: GibsStageData;
  t: TranslationFunction;
}

// Tabela para Top View (outer after install)
function TopViewTable({ data, t }: CalculatedTableProps) {
  const addPoints = (a: number | undefined, b: number | undefined): string => {
    const numA = typeof a === 'number' ? a : 0;
    const numB = typeof b === 'number' ? b : 0;
    return (numA + numB).toFixed(4);
  };

  return (
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
  );
}

// Tabela para Front to Back (outer before/after adjustment)
function FrontToBackTable({ data, t }: CalculatedTableProps) {
  const calculated = useMemo(() => calculateGibsFields(data), [data]);

  return (
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
              <td className="border p-2 text-center font-mono">{calculated.frontTop.toFixed(4)}</td>
              <td className="border p-2 text-center font-mono">{calculated.backTop.toFixed(4)}</td>
            </tr>
            <tr>
              <td className="border p-2 font-medium bg-muted">{t('form.gibs.bottom')}</td>
              <td className="border p-2 text-center font-mono">
                {calculated.frontBottom.toFixed(4)}
              </td>
              <td className="border p-2 text-center font-mono">
                {calculated.backBottom.toFixed(4)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Tabela para Before Tool Installation
function BeforeToolTable({
  data,
  t,
  hideUsable = false,
}: CalculatedTableProps & { hideUsable?: boolean }) {
  const calculated = useMemo(() => calculateGibsFields(data), [data]);

  return (
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
              <td className="border p-2 text-center font-mono">{calculated.frontTop.toFixed(4)}</td>
              <td className="border p-2 text-center font-mono">{calculated.backTop.toFixed(4)}</td>
            </tr>
            <tr>
              <td className="border p-2 font-medium bg-muted">{t('form.gibs.bottom')}</td>
              <td className="border p-2 text-center font-mono">
                {calculated.frontBottom.toFixed(4)}
              </td>
              <td className="border p-2 text-center font-mono">
                {calculated.backBottom.toFixed(4)}
              </td>
            </tr>
            {!hideUsable && (
              <tr>
                <td className="border p-2 font-medium bg-muted">{t('form.gibs.usable')}</td>
                <td className="border p-2 text-center font-mono" colSpan={2}>
                  {calculated.usable?.toFixed(4) ?? '0.0000'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Tabela para After Tool Installation
function AfterToolTable({
  data,
  t,
  hideUsable = false,
}: CalculatedTableProps & { hideUsable?: boolean }) {
  const addPoints = (a: number | undefined, b: number | undefined): string => {
    const numA = typeof a === 'number' ? a : 0;
    const numB = typeof b === 'number' ? b : 0;
    return (numA + numB).toFixed(4);
  };

  return (
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
  );
}

// Tabela para Left to Right (inner adjustment e outer after install)
function LeftToRightTable({
  data,
  t,
  hideUsable = false,
}: CalculatedTableProps & { hideUsable?: boolean }) {
  const calculated = useMemo(() => calculateGibsFields(data), [data]);

  return (
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
              <td className="border p-2 text-center font-mono">{calculated.leftTop.toFixed(4)}</td>
              <td className="border p-2 text-center font-mono">
                {calculated.leftBottom.toFixed(4)}
              </td>
            </tr>
            <tr>
              <td className="border p-2 font-medium bg-muted">{t('form.gibs.back')}</td>
              <td className="border p-2 text-center font-mono">{calculated.rightTop.toFixed(4)}</td>
              <td className="border p-2 text-center font-mono">
                {calculated.rightBottom.toFixed(4)}
              </td>
            </tr>
            {!hideUsable && calculated.usable !== undefined && (
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
  );
}

interface MeasurementSectionProps {
  data: GibsStageData;
  updateFn: (field: keyof GibsStageData, value: number) => void;
  handleBlur: (field: keyof GibsStageData) => void;
  errors: Record<string, string>;
  diagramType: 'frontToBack' | 'leftToRight' | 'topView' | 'beforeTool' | 'afterTool';
  t: TranslationFunction;
  hideUsable?: boolean;
}

export function MeasurementSection({
  data,
  updateFn,
  handleBlur,
  errors,
  diagramType,
  t,
  hideUsable = false,
}: MeasurementSectionProps) {
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

  const getTitle = () => {
    switch (diagramType) {
      case 'frontToBack':
        return t('form.gibs.frontToBackTitle');
      case 'leftToRight':
        return t('form.gibs.leftToRightTitle');
      case 'topView':
        return t('form.gibs.freeHangingAfterInstall');
      case 'beforeTool':
        return t('form.gibs.beforeToolInstallation');
      case 'afterTool':
        return t('form.gibs.afterToolInstallation');
      default:
        return '';
    }
  };

  const renderTable = () => {
    switch (diagramType) {
      case 'topView':
        return <TopViewTable data={data} t={t} />;
      case 'frontToBack':
        return <FrontToBackTable data={data} t={t} />;
      case 'beforeTool':
        return <BeforeToolTable data={data} t={t} hideUsable={hideUsable} />;
      case 'afterTool':
        return <AfterToolTable data={data} t={t} hideUsable={hideUsable} />;
      case 'leftToRight':
        return <LeftToRightTable data={data} t={t} hideUsable={hideUsable} />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{getTitle()}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
          <MeasurementInputs
            points={relevantPointsLeft}
            data={data}
            updateFn={updateFn}
            handleBlur={handleBlur}
            errors={errors}
            t={t}
          />
          <div className="flex justify-center items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={diagramPath}
              alt={`GIBS measurement diagram`}
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
            t={t}
          />
        </div>

        <div className="mt-6 flex justify-center">{renderTable()}</div>
      </CardContent>
    </Card>
  );
}
