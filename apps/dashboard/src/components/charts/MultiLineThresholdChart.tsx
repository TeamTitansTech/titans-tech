'use client';

/**
 * Multi-Line Threshold Chart Component
 * Displays multiple measurement lines over time with shared threshold configuration
 */

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import type { MultiLineThresholdChartProps } from './types';
import {
  calculateSeverity,
  formatMeasurementValue,
  getSeverityColor,
  getThresholdColor,
} from './utils';

const DEFAULT_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

// Custom tooltip component - defined outside to avoid recreation on each render
interface MultiLineTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  lines: MultiLineThresholdChartProps['lines'];
  sharedThreshold: MultiLineThresholdChartProps['sharedThreshold'];
  valueUnit?: string;
  hideThresholdValues?: boolean;
}

function CustomTooltip({
  active,
  payload,
  label,
  lines,
  sharedThreshold,
  valueUnit,
  hideThresholdValues,
}: MultiLineTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-card border rounded-lg shadow-lg p-3 max-w-[280px] sm:min-w-[280px]">
      <Typography variant="small" className="font-medium mb-2">
        {label}
      </Typography>

      {/* Compact measurements display */}
      <div className="space-y-1.5">
        {payload.map((entry: any, index: number) => {
          const value = entry.value as number;
          const lineConfig = lines.find((l) => l.dataKey === entry.dataKey);
          const threshold = lineConfig?.threshold || sharedThreshold || null;
          const severity = calculateSeverity(value, threshold);
          const severityColors = getSeverityColor(severity);

          return (
            <div key={index} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium">{entry.name}:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold">
                  {formatMeasurementValue(value, 4, valueUnit)}
                </span>
                {threshold && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-xs font-medium ${severityColors.bg} ${severityColors.text}`}
                  >
                    {severity === 'GREEN' ? '✓' : severity === 'YELLOW' ? '⚠' : '✗'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Thresholds section at bottom */}
      {sharedThreshold && !hideThresholdValues && (
        <div className="text-xs space-y-0.5 pt-2 mt-2 border-t">
          <Typography variant="small" className="text-muted-foreground font-medium mb-1">
            Thresholds:
          </Typography>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Green:</span>
            <span className="font-mono">
              &lt; {formatMeasurementValue(sharedThreshold.yellowMin, 4, valueUnit)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Yellow:</span>
            <span className="font-mono">
              {formatMeasurementValue(sharedThreshold.yellowMin, 4, valueUnit)} -{' '}
              {formatMeasurementValue(sharedThreshold.redMin, 4, valueUnit)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Red:</span>
            <span className="font-mono">
              ≥ {formatMeasurementValue(sharedThreshold.redMin, 4, valueUnit)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function MultiLineThresholdChart(props: MultiLineThresholdChartProps) {
  const {
    data,
    lines,
    sharedThreshold,
    title,
    dateKey = 'date',
    valueUnit,
    showGreenLine = true,
    showYellowLine = true,
    showRedLine = true,
    allowToggle = true,
    hideThresholdValues = false,
    height = 300,
    onDataPointClick,
  } = props;

  const [showGreen, setShowGreen] = useState(showGreenLine);
  const [showYellow, setShowYellow] = useState(showYellowLine);
  const [showRed, setShowRed] = useState(showRedLine);

  // Calculate Y-axis domain to include threshold values
  const yAxisDomain = useMemo(() => {
    if (!sharedThreshold || hideThresholdValues) return undefined;

    // Get all data values
    const dataValues: number[] = [];
    data.forEach((point) => {
      lines.forEach((line) => {
        const value = point[line.dataKey];
        if (typeof value === 'number' && !isNaN(value)) {
          dataValues.push(value);
        }
      });
    });

    if (dataValues.length === 0) return undefined;

    const dataMin = Math.min(...dataValues);
    const dataMax = Math.max(...dataValues);

    // Include threshold values in the range
    const thresholdMax = Math.max(
      sharedThreshold.greenMin || 0,
      sharedThreshold.yellowMin || 0,
      sharedThreshold.redMin || 0,
    );

    // Expand domain to include thresholds with some padding
    const minValue = Math.min(dataMin, 0);
    const maxValue = Math.max(dataMax, thresholdMax) * 1.1; // 10% padding above max

    return [minValue, maxValue];
  }, [data, lines, sharedThreshold, hideThresholdValues]);

  // No data fallback
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="flex items-center justify-center bg-muted rounded"
            style={{ height: `${height}px` }}
          >
            <Typography variant="muted">No data available</Typography>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle>{title}</CardTitle>
          {allowToggle && sharedThreshold && !hideThresholdValues && (
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGreen(!showGreen)}
                className={cn(
                  'border-green-500',
                  showGreen
                    ? 'bg-green-500 text-white hover:bg-green-600 hover:text-white'
                    : 'text-green-600 hover:bg-green-500 hover:text-white',
                )}
              >
                Green
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowYellow(!showYellow)}
                className={cn(
                  'border-yellow-500',
                  showYellow
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600 hover:text-white'
                    : 'text-yellow-600 hover:bg-yellow-500 hover:text-white',
                )}
              >
                Yellow
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRed(!showRed)}
                className={cn(
                  'border-red-500',
                  showRed
                    ? 'bg-red-500 text-white hover:bg-red-600 hover:text-white'
                    : 'text-red-600 hover:bg-red-500 hover:text-white',
                )}
              >
                Red
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={data}
            onClick={(e) => {
              if (e && e.activePayload?.[0] && onDataPointClick) {
                onDataPointClick(e.activePayload[0].payload);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey={dateKey} tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <YAxis
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              domain={yAxisDomain}
              label={{
                value: valueUnit || '',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 12 },
              }}
            />
            <Tooltip
              content={(props) => (
                <CustomTooltip
                  {...props}
                  lines={lines}
                  sharedThreshold={sharedThreshold}
                  valueUnit={valueUnit}
                  hideThresholdValues={hideThresholdValues}
                />
              )}
              wrapperStyle={{ zIndex: 50, pointerEvents: 'none' }}
              allowEscapeViewBox={{ x: false, y: false }}
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: 10 }}
            />

            {/* Threshold lines - hidden when hideThresholdValues is true */}
            {sharedThreshold && showGreen && !hideThresholdValues && (
              <ReferenceLine
                y={sharedThreshold.greenMin}
                stroke={getThresholdColor('green')}
                strokeDasharray="5 5"
                strokeWidth={1.5}
                label={{
                  value: `Green (${sharedThreshold.greenMin.toFixed(4)})`,
                  position: 'right',
                  fill: getThresholdColor('green'),
                  fontSize: 11,
                }}
              />
            )}
            {sharedThreshold && showYellow && !hideThresholdValues && (
              <ReferenceLine
                y={sharedThreshold.yellowMin}
                stroke={getThresholdColor('yellow')}
                strokeDasharray="5 5"
                strokeWidth={1.5}
                label={{
                  value: `Yellow (${sharedThreshold.yellowMin.toFixed(4)})`,
                  position: 'right',
                  fill: getThresholdColor('yellow'),
                  fontSize: 11,
                }}
              />
            )}
            {sharedThreshold && showRed && !hideThresholdValues && (
              <ReferenceLine
                y={sharedThreshold.redMin}
                stroke={getThresholdColor('red')}
                strokeDasharray="5 5"
                strokeWidth={1.5}
                label={{
                  value: `Red (${sharedThreshold.redMin.toFixed(4)})`,
                  position: 'right',
                  fill: getThresholdColor('red'),
                  fontSize: 11,
                }}
              />
            )}

            {/* Data lines */}
            {lines.map((line, index) => (
              <Line
                key={line.dataKey}
                type="linear"
                dataKey={line.dataKey}
                stroke={line.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name={line.label}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
