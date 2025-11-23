/**
 * Alert Status Utilities
 * Shared functions for determining machine and section alert statuses
 */

import type { MachineWithStatus } from '@/data/types/production-lines.types';

export type AlertStatus = 'ok' | 'warning' | 'critical' | 'unknown';
export type SectionStatus = 'ok' | 'warning' | 'alert' | 'unknown';

/**
 * Get the overall alert status for a machine based on bearing clearance alerts
 */
export const getAlertStatus = (machine: MachineWithStatus): AlertStatus => {
  if (!machine.services || machine.services.length === 0) {
    return 'unknown';
  }

  const latestService = machine.services[0];
  const alert = latestService?.alertBearingClearance;

  if (!alert) {
    return 'unknown';
  }

  const severity = alert.totalClearance_severity;

  if (severity === 'RED') {
    return 'critical';
  } else if (severity === 'YELLOW') {
    return 'warning';
  } else if (severity === 'GREEN') {
    return 'ok';
  }

  return 'unknown';
};

/**
 * Get the alert status for a specific section
 * Accepts any object with services array (more flexible than MachineWithStatus)
 */
export const getSectionStatus = (
  section: string,
  machine: { services?: MachineWithStatus['services'] },
): SectionStatus => {
  if (!machine.services || machine.services.length === 0) {
    return 'unknown';
  }

  const latestService = machine.services[0];

  switch (section) {
    case 'BEARING_CLEARANCE': {
      const alert = latestService?.alertBearingClearance;
      if (!alert) {
        return 'unknown';
      }

      const severity = alert.totalClearance_severity;

      if (severity === 'RED') {
        return 'alert';
      } else if (severity === 'YELLOW') {
        return 'warning';
      } else if (severity === 'GREEN') {
        return 'ok';
      }

      return 'unknown';
    }

    // TODO: Add other sections when their alert logic is implemented
    // case 'SLIDE':
    // case 'GIBS':
    // etc.

    default:
      return 'ok';
  }
};

/**
 * Status colors for the main status circle
 */
export const statusColors = {
  ok: 'bg-green-500 border-green-600',
  warning: 'bg-yellow-500 border-yellow-600',
  critical: 'bg-red-500 border-red-600',
  unknown: 'bg-gray-400 border-gray-500',
} as const;

/**
 * Status colors for section badges
 */
export const sectionStatusColors = {
  ok: 'text-green-500',
  warning: 'text-yellow-500',
  alert: 'text-red-500',
  unknown: 'text-muted-foreground',
} as const;

/**
 * Status labels (Portuguese)
 */
export const statusLabels = {
  ok: 'OK',
  warning: 'Atenção',
  critical: 'Crítico',
  unknown: 'Sem dados',
} as const;
