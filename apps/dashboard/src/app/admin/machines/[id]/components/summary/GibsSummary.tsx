'use client';

import { useTranslations } from 'next-intl';
import type { GibsCheck, GibsStageData } from '@/data/types/services.types';
import { displayValue } from '../utils/fieldFormatters';

interface GibsSummaryProps {
  data: GibsCheck;
}

export function GibsSummary({ data }: GibsSummaryProps) {
  const tTable = useTranslations('table');
  const tGibsFields = useTranslations('machines.gibsFields');
  const tServicesSummary = useTranslations('services.modal.summary');

  const calculateGibsFields = (stageData: GibsStageData) => {
    const toNum = (val: number | undefined) => (typeof val === 'number' ? val : 0);
    const isNum = (val: number | undefined): boolean => typeof val === 'number' && !isNaN(val);

    const frontTop = toNum(stageData.point1) + toNum(stageData.point2);
    const frontBottom = toNum(stageData.point3) + toNum(stageData.point4);
    const backTop = toNum(stageData.point5) + toNum(stageData.point6);
    const backBottom = toNum(stageData.point7) + toNum(stageData.point8);
    const leftTop = toNum(stageData.point9) + toNum(stageData.point13);
    const leftBottom = toNum(stageData.point11) + toNum(stageData.point15);
    const rightTop = toNum(stageData.point10) + toNum(stageData.point14);
    const rightBottom = toNum(stageData.point12) + toNum(stageData.point16);

    const topPointsCount = [
      stageData.point9,
      stageData.point10,
      stageData.point13,
      stageData.point14,
    ].filter(isNum).length;

    const bottomPointsCount = [
      stageData.point11,
      stageData.point12,
      stageData.point15,
      stageData.point16,
    ].filter(isNum).length;

    let usable: number | undefined;

    if (topPointsCount === 4 && bottomPointsCount === 4) {
      const minLeft = Math.min(
        toNum(stageData.point9),
        toNum(stageData.point11),
        toNum(stageData.point13),
        toNum(stageData.point15),
      );
      const minRight = Math.min(
        toNum(stageData.point10),
        toNum(stageData.point12),
        toNum(stageData.point14),
        toNum(stageData.point16),
      );
      usable = minLeft + minRight;
    } else if (topPointsCount === 4) {
      const minTopLeft = Math.min(toNum(stageData.point9), toNum(stageData.point13));
      const minTopRight = Math.min(toNum(stageData.point10), toNum(stageData.point14));
      usable = minTopLeft + minTopRight;
    } else if (bottomPointsCount === 4) {
      const minBottomLeft = Math.min(toNum(stageData.point11), toNum(stageData.point15));
      const minBottomRight = Math.min(toNum(stageData.point12), toNum(stageData.point16));
      usable = minBottomLeft + minBottomRight;
    }

    return {
      frontTop,
      frontBottom,
      backTop,
      backBottom,
      leftTop,
      leftBottom,
      rightTop,
      rightBottom,
      usable,
    };
  };

  // Helper to render a stage with grouped measurements and calculations
  const renderStageTable = (
    stageData: GibsStageData | undefined,
    stageTitle: string,
    isOuter: boolean = false,
    isAfterToolInstall: boolean = false,
  ) => {
    if (!stageData) return null;

    // Group points by category
    const frontToBackPoints = [1, 2, 3, 4, 5, 6, 7, 8];
    const leftToRightPoints = [9, 10, 11, 12, 13, 14, 15, 16];

    const hasFrontToBack = frontToBackPoints.some(
      (i) =>
        (stageData as any)[`point${i}`] !== undefined && (stageData as any)[`point${i}`] !== null,
    );
    const hasLeftToRight = leftToRightPoints.some(
      (i) =>
        (stageData as any)[`point${i}`] !== undefined && (stageData as any)[`point${i}`] !== null,
    );

    if (!hasFrontToBack && !hasLeftToRight) return null;

    const calculated = calculateGibsFields(stageData);

    return (
      <div className="mb-2 border rounded-md p-2 bg-muted/10">
        <div className="font-medium text-muted-foreground mb-2 text-xs">{stageTitle}</div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {hasFrontToBack && (
            <div>
              <div className="text-[10px] font-semibold mb-1 text-muted-foreground">
                {tGibsFields('frontToBackTitle')}
              </div>
              <div className="grid grid-cols-2 gap-1 mb-2">
                {[1, 2, 5, 6].map((num) => {
                  const value = (stageData as any)[`point${num}`];
                  if (value === undefined || value === null) return null;
                  return (
                    <div
                      key={num}
                      className="flex flex-col p-1 bg-background border rounded text-[10px]"
                    >
                      <span className="text-muted-foreground text-[9px]">P{num}</span>
                      <span className="font-mono font-medium">{displayValue(value)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border rounded overflow-hidden text-[10px]">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border p-1"></th>
                      <th className="border p-1">{tGibsFields('left')}</th>
                      <th className="border p-1">{tGibsFields('right')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-1 bg-muted/50 font-medium">{tGibsFields('top')}</td>
                      <td className="border p-1 text-center font-mono">
                        {calculated.frontTop.toFixed(4)}
                      </td>
                      <td className="border p-1 text-center font-mono">
                        {calculated.backTop.toFixed(4)}
                      </td>
                    </tr>
                    {!isOuter && (
                      <tr>
                        <td className="border p-1 bg-muted/50 font-medium">
                          {tGibsFields('bottom')}
                        </td>
                        <td className="border p-1 text-center font-mono">
                          {calculated.frontBottom.toFixed(4)}
                        </td>
                        <td className="border p-1 text-center font-mono">
                          {calculated.backBottom.toFixed(4)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {hasLeftToRight && (
            <div>
              <div className="text-[10px] font-semibold mb-1 text-muted-foreground">
                {tGibsFields('leftToRightTitle')}
              </div>
              <div className="grid grid-cols-4 gap-1 mb-2">
                {leftToRightPoints.map((num) => {
                  const value = (stageData as any)[`point${num}`];
                  if (value === undefined || value === null) return null;
                  return (
                    <div
                      key={num}
                      className="flex flex-col p-1 bg-background border rounded text-[10px]"
                    >
                      <span className="text-muted-foreground text-[9px]">P{num}</span>
                      <span className="font-mono font-medium">{displayValue(value)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border rounded overflow-hidden text-[10px]">
                {isAfterToolInstall ? (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border p-1"></th>
                        <th className="border p-1">{tGibsFields('front')}</th>
                        <th className="border p-1">{tGibsFields('rear')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-1 bg-muted/50 font-medium">{tGibsFields('top')}</td>
                        <td className="border p-1 text-center font-mono">
                          {calculated.leftTop.toFixed(4)}
                        </td>
                        <td className="border p-1 text-center font-mono">
                          {calculated.rightTop.toFixed(4)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border p-1"></th>
                        <th className="border p-1">{tGibsFields('top')}</th>
                        <th className="border p-1">{tGibsFields('bottom')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-1 bg-muted/50 font-medium">
                          {tGibsFields('front')}
                        </td>
                        <td className="border p-1 text-center font-mono">
                          {calculated.leftTop.toFixed(4)}
                        </td>
                        <td className="border p-1 text-center font-mono">
                          {calculated.leftBottom.toFixed(4)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-1 bg-muted/50 font-medium">
                          {tGibsFields('back')}
                        </td>
                        <td className="border p-1 text-center font-mono">
                          {calculated.rightTop.toFixed(4)}
                        </td>
                        <td className="border p-1 text-center font-mono">
                          {calculated.rightBottom.toFixed(4)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-1 bg-muted/50 font-medium">
                          {tGibsFields('usable')}
                        </td>
                        <td className="border p-1 text-center font-mono" colSpan={2}>
                          {calculated.usable !== undefined ? calculated.usable.toFixed(4) : '-'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 text-xs">
      {(data.outerBeforeAdjustment ||
        data.outerAfterAdjustment ||
        data.outerFreeHangingAfterInstall) && (
        <div className="border-t pt-3">
          <div className="font-semibold mb-2 text-sm flex items-center gap-2">
            <div className="w-1 h-5 bg-primary rounded" />
            {tTable('outer')} {tGibsFields('directionalTitle')}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
            {renderStageTable(data.outerBeforeAdjustment, tGibsFields('beforeAdjustment'), true)}
            {renderStageTable(data.outerAfterAdjustment, tGibsFields('afterAdjustment'), true)}
            {renderStageTable(
              data.outerFreeHangingAfterInstall,
              tGibsFields('freeHangingAfterInstall'),
              true,
            )}
          </div>
        </div>
      )}

      {(data.innerBeforeAdjustment ||
        data.innerAfterAdjustment ||
        data.innerBeforeToolInstallation ||
        data.innerAfterToolInstallation) && (
        <div className="border-t pt-3">
          <div className="font-semibold mb-2 text-sm flex items-center gap-2">
            <div className="w-1 h-5 bg-secondary rounded" />
            {tTable('inner')} {tGibsFields('directionalTitle')}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {renderStageTable(data.innerBeforeAdjustment, tGibsFields('beforeAdjustment'))}
            {renderStageTable(data.innerAfterAdjustment, tGibsFields('afterAdjustment'))}
            {renderStageTable(
              data.innerBeforeToolInstallation,
              tGibsFields('beforeToolInstallation'),
            )}
            {renderStageTable(
              data.innerAfterToolInstallation,
              tGibsFields('afterToolInstallation'),
              false,
              true,
            )}
          </div>
        </div>
      )}

      {data.notes && (
        <div className="border-t pt-2">
          <div className="font-semibold text-muted-foreground mb-2 text-xs">
            {tServicesSummary('notes')}
          </div>
          <div className="text-[11px] p-2 bg-muted/20 rounded-md">{data.notes}</div>
        </div>
      )}
    </div>
  );
}
