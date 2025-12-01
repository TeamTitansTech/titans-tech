/**
 * Chart Component Types
 * Type definitions for threshold-based line charts
 */

export interface ThresholdConfig {
  greenMin: number;
  yellowMin: number;
  redMin: number;
  label?: string;
}

export interface MeasurementDataPoint {
  date: string | Date;
  value: number;
  label?: string;
}

export interface ThresholdLineChartProps {
  // Data
  data: MeasurementDataPoint[];
  threshold: ThresholdConfig | null;

  // Chart configuration
  title?: string;
  dataKey?: string; // Default: "value"
  dateKey?: string; // Default: "date"
  valueUnit?: string; // e.g., "mm", "inches"

  // Threshold display options
  showGreenLine?: boolean; // Default: true
  showYellowLine?: boolean; // Default: true
  showRedLine?: boolean; // Default: true
  allowToggle?: boolean; // Default: true (show toggle controls)

  // Chart styling
  height?: number; // Default: 300
  lineColor?: string; // Default: from theme
  lineStrokeWidth?: number; // Default: 2

  // Callbacks
  onDataPointClick?: (point: MeasurementDataPoint) => void;
}

export interface MultiLineMeasurementData {
  date: string | Date;
  [key: string]: string | Date | number; // Dynamic measurement keys
}

export interface MultiLineConfig {
  dataKey: string;
  label: string;
  color?: string;
  threshold?: ThresholdConfig; // Optional individual threshold
}

export interface MultiLineThresholdChartProps {
  // Data
  data: MultiLineMeasurementData[];
  lines: MultiLineConfig[];
  sharedThreshold?: ThresholdConfig | null; // Shared across all lines

  // Chart configuration
  title?: string;
  dateKey?: string; // Default: "date"
  valueUnit?: string;

  // Threshold display options
  showGreenLine?: boolean;
  showYellowLine?: boolean;
  showRedLine?: boolean;
  allowToggle?: boolean;
  hideThresholdValues?: boolean; // Hide numeric threshold values in tooltips and reference lines

  // Chart styling
  height?: number;

  // Callbacks
  onDataPointClick?: (point: MultiLineMeasurementData) => void;
}

export type AlertSeverity = 'GREEN' | 'YELLOW' | 'RED' | 'NONE';
