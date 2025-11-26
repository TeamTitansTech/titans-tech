'use client';

/**
 * Threshold Line Chart Component
 * Displays measurement data over time with configurable threshold lines and zones
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
  ReferenceArea,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import type { ThresholdLineChartProps } from './types';
import {
  calculateSeverity,
  formatMeasurementValue,
  getSeverityColor,
  getSeverityLabel,
  getThresholdColor,
} from './utils';

export function ThresholdLineChart(props: ThresholdLineChartProps) {
  const {
    data,
    threshold,
    title,
    dataKey = 'value',
    dateKey = 'date',
    valueUnit,
    showGreenLine = true,
    showYellowLine = true,
    showRedLine = true,
    showZones = false,
    allowToggle = true,
    height = 300,
    lineColor = 'hsl(var(--chart-1))',
    lineStrokeWidth = 2,
    onDataPointClick,
  } = props;

  const [showGreen, setShowGreen] = useState(showGreenLine);
  const [showYellow, setShowYellow] = useState(showYellowLine);
  const [showRed, setShowRed] = useState(showRedLine);
  const [showThresholdZones, setShowThresholdZones] = useState(showZones);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.[0]) return null;

    const value = payload[0].value as number;
    const severity = calculateSeverity(value, threshold);
    const severityColors = getSeverityColor(severity);

    return (
      <div className="bg-card border rounded-lg shadow-lg p-3 min-w-[200px]">
        <Typography variant="small" className="font-medium mb-2">
          {label}
        </Typography>
        <div className="space-y-2">
          <div>
            <Typography variant="small" className="text-muted-foreground">
              Value
            </Typography>
            <Typography variant="large" className="font-semibold">
              {formatMeasurementValue(value, 4, valueUnit)}
            </Typography>
          </div>

          {threshold && (
            <>
              <div
                className={`px-2 py-1 rounded text-xs font-medium ${severityColors.bg} ${severityColors.text}`}
              >
                {getSeverityLabel(severity)}
              </div>

              <div className="text-xs space-y-1 pt-1 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Green:</span>
                  <span className="font-mono">
                    &lt; {formatMeasurementValue(threshold.yellowMin, 4, valueUnit)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Yellow:</span>
                  <span className="font-mono">
                    {formatMeasurementValue(threshold.yellowMin, 4, valueUnit)} -{' '}
                    {formatMeasurementValue(threshold.redMin, 4, valueUnit)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Red:</span>
                  <span className="font-mono">
                    ≥ {formatMeasurementValue(threshold.redMin, 4, valueUnit)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

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
          {allowToggle && threshold && (
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={showThresholdZones ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowThresholdZones(!showThresholdZones)}
              >
                Zones
              </Button>
              <Button
                variant={showGreen ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowGreen(!showGreen)}
                className="text-green-700 border-green-600 hover:bg-green-50 dark:text-green-400 dark:border-green-500 dark:hover:bg-green-950"
              >
                Green
              </Button>
              <Button
                variant={showYellow ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowYellow(!showYellow)}
                className="text-yellow-700 border-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:border-yellow-500 dark:hover:bg-yellow-950"
              >
                Yellow
              </Button>
              <Button
                variant={showRed ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowRed(!showRed)}
                className="text-red-700 border-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-500 dark:hover:bg-red-950"
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
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {/* Threshold zones (background shading) */}
            {threshold && showThresholdZones && (
              <>
                <ReferenceArea
                  y1={0}
                  y2={threshold.yellowMin}
                  fill={getThresholdColor('green')}
                  fillOpacity={0.1}
                  ifOverflow="extendDomain"
                />
                <ReferenceArea
                  y1={threshold.yellowMin}
                  y2={threshold.redMin}
                  fill={getThresholdColor('yellow')}
                  fillOpacity={0.1}
                  ifOverflow="extendDomain"
                />
                <ReferenceArea
                  y1={threshold.redMin}
                  y2="dataMax"
                  fill={getThresholdColor('red')}
                  fillOpacity={0.1}
                  ifOverflow="extendDomain"
                />
              </>
            )}

            {/* Threshold lines */}
            {threshold && showGreen && (
              <ReferenceLine
                y={threshold.greenMin}
                stroke={getThresholdColor('green')}
                strokeDasharray="5 5"
                strokeWidth={1.5}
                label={{
                  value: `Green (${threshold.greenMin.toFixed(4)})`,
                  position: 'right',
                  fill: getThresholdColor('green'),
                  fontSize: 11,
                }}
              />
            )}
            {threshold && showYellow && (
              <ReferenceLine
                y={threshold.yellowMin}
                stroke={getThresholdColor('yellow')}
                strokeDasharray="5 5"
                strokeWidth={1.5}
                label={{
                  value: `Yellow (${threshold.yellowMin.toFixed(4)})`,
                  position: 'right',
                  fill: getThresholdColor('yellow'),
                  fontSize: 11,
                }}
              />
            )}
            {threshold && showRed && (
              <ReferenceLine
                y={threshold.redMin}
                stroke={getThresholdColor('red')}
                strokeDasharray="5 5"
                strokeWidth={1.5}
                label={{
                  value: `Red (${threshold.redMin.toFixed(4)})`,
                  position: 'right',
                  fill: getThresholdColor('red'),
                  fontSize: 11,
                }}
              />
            )}

            {/* Data line */}
            <Line
              type="linear"
              dataKey={dataKey}
              stroke={lineColor}
              strokeWidth={lineStrokeWidth}
              dot={{ r: 4, fill: lineColor }}
              activeDot={{ r: 6 }}
              name="Measurement"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
