'use client';

import { ThresholdLineChart } from '@/components/charts/ThresholdLineChart';
import { MultiLineThresholdChart } from '@/components/charts/MultiLineThresholdChart';
import type {
  ThresholdConfig,
  MeasurementDataPoint,
  MultiLineMeasurementData,
} from '@/components/charts/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';

// Mock threshold configuration
const mockThreshold: ThresholdConfig = {
  greenMin: 0.0,
  yellowMin: 0.005,
  redMin: 0.0105,
  label: 'Connection Bearing Clearance',
};

// Mock single-line measurement data (simulating bearing clearance over time)
const mockSingleLineData: MeasurementDataPoint[] = [
  { date: '15/09/2020', value: 0.007, label: '15/09/2020' },
  { date: '16/09/2020', value: 0.0067, label: '16/09/2020' },
  { date: '20/12/2022', value: 0.005, label: '20/12/2022' },
  { date: '21/12/2022', value: 0.0059, label: '21/12/2022' },
  { date: '16/07/2023', value: 0.0052, label: '16/07/2023' },
  { date: '10/08/2023', value: 0.0074, label: '10/08/2023' },
  { date: '15/10/2023', value: 0.0089, label: '15/10/2023' },
  { date: '20/11/2023', value: 0.0112, label: '20/11/2023' }, // RED zone
];

// Mock multi-line measurement data (simulating RH vs LH comparison)
const mockMultiLineData: MultiLineMeasurementData[] = [
  { date: '15/09/2020', CB_RH: 0.0069, CB_LH: 0.007 },
  { date: '16/09/2020', CB_RH: 0.0067, CB_LH: 0.0067 },
  { date: '20/12/2022', CB_RH: 0.005, CB_LH: 0.0052 },
  { date: '21/12/2022', CB_RH: 0.0059, CB_LH: 0.0059 },
  { date: '16/07/2023', CB_RH: 0.0052, CB_LH: 0.0054 },
  { date: '10/08/2023', CB_RH: 0.0074, CB_LH: 0.0071 },
  { date: '15/10/2023', CB_RH: 0.0089, CB_LH: 0.0092 },
  { date: '20/11/2023', CB_RH: 0.0112, CB_LH: 0.0108 }, // Both in RED zone
];

// Mock piston clearance data (different thresholds)
const mockPistonThreshold: ThresholdConfig = {
  greenMin: 0.0,
  yellowMin: 0.0226,
  redMin: 0.028,
  label: 'Piston Clearance',
};

const mockPistonData: MultiLineMeasurementData[] = [
  { date: '15/09/2020', pistonClearance: 0.0255, totalClearance: 0.028 },
  { date: '16/09/2020', pistonClearance: 0.0206, totalClearance: 0.0226 },
  { date: '20/12/2022', pistonClearance: 0.0229, totalClearance: 0.0239 },
  { date: '21/12/2022', pistonClearance: 0.0243, totalClearance: 0.0243 },
  { date: '16/07/2023', pistonClearance: 0.019, totalClearance: 0.022 },
];

export default function ChartsDemoPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <Typography variant="h1" className="mb-2">
          📊 Threshold Charts Demo
        </Typography>
        <Typography variant="muted">
          Interactive demonstration of threshold-based line charts with green/yellow/red zones
        </Typography>
      </div>

      {/* Introduction Card */}
      <Card>
        <CardHeader>
          <CardTitle>Chart Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Typography variant="small" className="font-semibold mb-2">
                ✅ Interactive Controls
              </Typography>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Toggle threshold lines (Green/Yellow/Red)</li>
                <li>• Show/hide threshold zones (shaded regions)</li>
                <li>• Hover tooltips with severity information</li>
              </ul>
            </div>
            <div>
              <Typography variant="small" className="font-semibold mb-2">
                ✅ Visual Indicators
              </Typography>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Green: Within specification</li>
                <li>• Yellow: Caution range</li>
                <li>• Red: Critical range</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Single Line Chart Example */}
      <div className="space-y-4">
        <div>
          <Typography variant="h2" className="mb-1">
            Single-Line Chart
          </Typography>
          <Typography variant="muted">
            Displays one measurement series with threshold visualization
          </Typography>
        </div>
        <ThresholdLineChart
          title="Connection Bearing Clearance (CB)"
          data={mockSingleLineData}
          threshold={mockThreshold}
          valueUnit="mm"
          showZones={true}
          allowToggle={true}
          height={350}
        />
        <Card>
          <CardContent className="pt-6">
            <Typography variant="small" className="text-muted-foreground">
              <strong>Note:</strong> The last measurement (20/11/2023) exceeds the red threshold
              (0.0105 mm), indicating a critical condition that requires attention.
            </Typography>
          </CardContent>
        </Card>
      </div>

      {/* Multi-Line Chart Example */}
      <div className="space-y-4">
        <div>
          <Typography variant="h2" className="mb-1">
            Multi-Line Chart (RH vs LH Comparison)
          </Typography>
          <Typography variant="muted">
            Compares multiple measurement series against shared thresholds
          </Typography>
        </div>
        <MultiLineThresholdChart
          title="Connection Bearing - Right Hand vs Left Hand"
          data={mockMultiLineData}
          lines={[
            {
              dataKey: 'CB_RH',
              label: 'CB RH (Right Hand)',
              color: '#8884d8',
            },
            {
              dataKey: 'CB_LH',
              label: 'CB LH (Left Hand)',
              color: '#82ca9d',
            },
          ]}
          sharedThreshold={mockThreshold}
          valueUnit="mm"
          showZones={true}
          allowToggle={true}
          height={350}
        />
        <Card>
          <CardContent className="pt-6">
            <Typography variant="small" className="text-muted-foreground">
              <strong>Comparison Analysis:</strong> Both RH and LH measurements track closely
              together. The most recent readings show both sides in the red zone, suggesting a
              systemic issue rather than imbalance.
            </Typography>
          </CardContent>
        </Card>
      </div>

      {/* Different Threshold Example */}
      <div className="space-y-4">
        <div>
          <Typography variant="h2" className="mb-1">
            Piston Clearance Example
          </Typography>
          <Typography variant="muted">
            Different measurement type with different threshold ranges
          </Typography>
        </div>
        <MultiLineThresholdChart
          title="Piston Clearance (PC) × Total Clearance (TC)"
          data={mockPistonData}
          lines={[
            {
              dataKey: 'pistonClearance',
              label: 'Piston Clearance',
              color: '#333333',
            },
            {
              dataKey: 'totalClearance',
              label: 'Total Clearance',
              color: '#0066cc',
            },
          ]}
          sharedThreshold={mockPistonThreshold}
          valueUnit="mm"
          showZones={true}
          allowToggle={true}
          height={350}
        />
        <Card>
          <CardContent className="pt-6">
            <Typography variant="small" className="text-muted-foreground">
              <strong>Higher Thresholds:</strong> Piston clearance typically has higher acceptable
              ranges (Yellow: 0.0226mm, Red: 0.0280mm) compared to connection bearings.
            </Typography>
          </CardContent>
        </Card>
      </div>

      {/* Usage Instructions */}
      <Card className="bg-muted">
        <CardHeader>
          <CardTitle>💡 Try the Interactive Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Typography variant="small" className="font-semibold mb-2">
              1. Toggle Threshold Visibility
            </Typography>
            <Typography variant="small" className="text-muted-foreground">
              Click the colored buttons (Zones, Green, Yellow, Red) to show/hide specific threshold
              indicators.
            </Typography>
          </div>
          <div>
            <Typography variant="small" className="font-semibold mb-2">
              2. Hover for Details
            </Typography>
            <Typography variant="small" className="text-muted-foreground">
              Hover over any data point to see the exact value, severity level, and threshold ranges
              in a tooltip.
            </Typography>
          </div>
          <div>
            <Typography variant="small" className="font-semibold mb-2">
              3. Visual Analysis
            </Typography>
            <Typography variant="small" className="text-muted-foreground">
              Enable &rdquo;Zones&rdquo; to see shaded background regions that make it easy to
              identify which measurements fall into green (safe), yellow (caution), or red
              (critical) ranges.
            </Typography>
          </div>
        </CardContent>
      </Card>

      {/* Integration Guide */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Using in Your Application</CardTitle>
        </CardHeader>
        <CardContent>
          <Typography variant="small" className="mb-4">
            These charts are now integrated into the Bearing Clearance section. To use them in other
            sections:
          </Typography>
          <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
            {`import { ThresholdLineChart } from '@/components/charts/ThresholdLineChart';
import { getSlideThresholdByBlueprint } from '@/actions/alerts';

// Fetch threshold from API
const threshold = await getSlideThresholdByBlueprint(blueprintId);

// Use the chart
<ThresholdLineChart
  title="Slide Max Deviation"
  data={chartData}
  threshold={threshold}
  valueUnit="mm"
  showZones={true}
  height={300}
/>`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
