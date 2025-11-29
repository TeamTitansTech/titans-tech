'use client';

/**
 * Multi-Line Threshold Chart Component
 * Displays multiple measurement lines over time with shared threshold configuration
 */

import { useState } from 'react';
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
  getSeverityLabel,
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
    <div className="bg-card border rounded-lg shadow-lg p-3 min-w-[220px]">
      <Typography variant="small" className="font-medium mb-2">
        {label}
      </Typography>
      <div className="space-y-2">
        {payload.map((entry: any, index: number) => {
          const value = entry.value as number;
          const lineConfig = lines.find((l) => l.dataKey === entry.dataKey);
          const threshold = lineConfig?.threshold || sharedThreshold || null;
          const severity = calculateSeverity(value, threshold);
          const severityColors = getSeverityColor(severity);

          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <Typography variant="small" className="font-medium">
                  {entry.name}
                </Typography>
              </div>
              <div className="pl-5">
                <Typography variant="large" className="font-semibold">
                  {formatMeasurementValue(value, 4, valueUnit)}
                </Typography>
                {threshold && (
                  <div
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${severityColors.bg} ${severityColors.text}`}
                  >
                    {getSeverityLabel(severity)}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {sharedThreshold && !hideThresholdValues && (
          <div className="text-xs space-y-1 pt-2 mt-2 border-t">
            <Typography variant="small" className="text-muted-foreground font-medium">
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
