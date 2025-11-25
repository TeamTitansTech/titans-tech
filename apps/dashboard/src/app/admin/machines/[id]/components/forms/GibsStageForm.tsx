'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type GibsStageData, type GibsFormProps } from '@/data/types/services.types';
import { calculateGibsFields } from './gibsCalculations';
import { useMemo } from 'react';

// Point field names organized by measurement type and position in diagram
// Front to Back: arranged as they appear in the diagram (top to bottom, left to right)
const FRONT_TO_BACK_POINTS_LEFT = ['point2', 'point1', 'point4', 'point3'] as const;
const FRONT_TO_BACK_POINTS_RIGHT = ['point6', 'point5', 'point8', 'point7'] as const;

// Left to Right: arranged as they appear in the diagram (top to bottom, left to right)
const LEFT_TO_RIGHT_POINTS_LEFT = ['point13', 'point9', 'point15', 'point11'] as const;
const LEFT_TO_RIGHT_POINTS_RIGHT = ['point14', 'point10', 'point16', 'point12'] as const;

export function GibsStageForm({
  data,
  updateFn,
  errors,
  handleBlur,
  title,
  showDiagram = true,
  diagramType = 'frontToBack',
}: GibsFormProps) {
  const t = useTranslations('inspections');

  // Calculate fields automatically
  const calculated = useMemo(() => calculateGibsFields(data), [data]);

  // Determine which diagram to show based on the diagram type
  const diagramPath = useMemo(() => {
    if (!showDiagram) return null;

    // Use the appropriate diagram based on measurement type
    return diagramType === 'frontToBack'
      ? '/assets/gibs/front-to-back.png'
      : '/assets/gibs/left-to-right.png';
  }, [showDiagram, diagramType]);

  // Determine which points to show based on diagram type
  const relevantPointsLeft =
    diagramType === 'frontToBack' ? FRONT_TO_BACK_POINTS_LEFT : LEFT_TO_RIGHT_POINTS_LEFT;
  const relevantPointsRight =
    diagramType === 'frontToBack' ? FRONT_TO_BACK_POINTS_RIGHT : LEFT_TO_RIGHT_POINTS_RIGHT;

  return (
    <div className="space-y-6">
      <h4 className="font-semibold text-sm">{title}</h4>

      {/* Diagram and Measurement Points in one Card */}
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
            <div className="space-y-3">
              {relevantPointsLeft.map((field) => {
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
                      onChange={(e) =>
                        updateFn(field as keyof GibsStageData, Number(e.target.value))
                      }
                      onBlur={() => handleBlur(field as keyof GibsStageData)}
                      className={`mt-1 ${errors[field] ? 'border-destructive' : ''}`}
                      required
                    />
                    {errors[field] && (
                      <p className="text-xs text-destructive mt-1">{errors[field]}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Center - Diagram */}
            {showDiagram && diagramPath && (
              <div className="flex justify-center items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={diagramPath}
                  alt={`GIBS measurement diagram for ${title}`}
                  className="max-w-full h-auto"
                  style={{ maxHeight: '300px' }}
                />
              </div>
            )}

            {/* Right side - Last 4 points */}
            <div className="space-y-3">
              {relevantPointsRight.map((field) => {
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
                      onChange={(e) =>
                        updateFn(field as keyof GibsStageData, Number(e.target.value))
                      }
                      onBlur={() => handleBlur(field as keyof GibsStageData)}
                      className={`mt-1 ${errors[field] ? 'border-destructive' : ''}`}
                      required
                    />
                    {errors[field] && (
                      <p className="text-xs text-destructive mt-1">{errors[field]}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculated Fields Display - Show BOTH tables (calculated from all 16 points) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t('form.gibs.calculatedFields')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left/Right Table */}
            <div>
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
                  </tbody>
                </table>
              </div>
            </div>

            {/* Front/Back Table with Usable */}
            <div>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
