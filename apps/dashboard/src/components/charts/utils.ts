/**
 * Chart Utility Functions
 * Helper functions for threshold calculations and formatting
 */

import type { ThresholdConfig, AlertSeverity } from './types';

/**
 * Calculate the severity level based on a measurement value and threshold config
 */
export function calculateSeverity(
  value: number | null | undefined,
  threshold: ThresholdConfig | null,
): AlertSeverity {
  if (value === null || value === undefined || !threshold) return 'NONE';

  if (value >= threshold.redMin) return 'RED';
  if (value >= threshold.yellowMin) return 'YELLOW';
  if (value >= threshold.greenMin) return 'GREEN';

  return 'NONE';
}

/**
 * Format a measurement value with specified decimal places and optional unit
 */
export function formatMeasurementValue(
  value: number | null | undefined,
  decimals: number = 4,
  unit?: string,
): string {
  if (value === null || value === undefined) return '-';

  const formatted = value.toFixed(decimals);
  return unit ? `${formatted} ${unit}` : formatted;
}

/**
 * Get color classes for severity level
 */
export function getSeverityColor(severity: AlertSeverity): {
  bg: string;
  text: string;
  border: string;
} {
  switch (severity) {
    case 'GREEN':
      return {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-300',
        border: 'border-green-500',
      };
    case 'YELLOW':
      return {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-800 dark:text-yellow-300',
        border: 'border-yellow-500',
      };
    case 'RED':
      return {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-300',
        border: 'border-red-500',
      };
    default:
      return {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-800 dark:text-gray-300',
        border: 'border-gray-500',
      };
  }
}

/**
 * Get a human-readable label for severity
 */
export function getSeverityLabel(severity: AlertSeverity): string {
  switch (severity) {
    case 'GREEN':
      return 'Within Specification';
    case 'YELLOW':
      return 'Caution';
    case 'RED':
      return 'Critical';
    default:
      return 'No Data';
  }
}

/**
 * Get color for threshold lines
 */
export function getThresholdColor(level: 'green' | 'yellow' | 'red'): string {
  switch (level) {
    case 'green':
      return 'hsl(var(--success))';
    case 'yellow':
      return 'hsl(var(--warning))';
    case 'red':
      return 'hsl(var(--destructive))';
  }
}
