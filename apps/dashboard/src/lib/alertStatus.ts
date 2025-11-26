/**
 * Alert Status Utilities
 * Shared functions for determining machine and section alert statuses
 */

import type { MachineWithStatus } from '@/data/types/production-lines.types';
import type { LatestReport } from '@/data/types/services.types';

export type AlertStatus = 'ok' | 'warning' | 'critical' | 'unknown';
export type SectionStatus = 'ok' | 'warning' | 'alert' | 'unknown';
export type AlertSeverity = 'NONE' | 'GREEN' | 'YELLOW' | 'RED';

/**
 * Calculate machine alert status from latest report
 * This aggregates alerts from all sections to determine the overall machine status
 */
export const calculateStatusFromLatestReport = (latestReport: LatestReport | null): AlertStatus => {
  if (!latestReport) {
    return 'unknown';
  }

  const allSeverities: AlertSeverity[] = [];

  // Collect severities from BEARING_CLEARANCE section
  if (latestReport.sections.BEARING_CLEARANCE?.alert) {
    const alert = latestReport.sections.BEARING_CLEARANCE.alert;
    allSeverities.push(
      alert.totalClearance_severity,
      alert.mainBearings_severity,
      alert.upperConnectionBearings_severity,
      alert.wristPinToMatingPart_severity,
      alert.wristPinToBushing_severity,
      alert.slideAdjNutToScrewSleeve_severity,
    );
  }

  // Collect severities from CLUTCH section
  if (latestReport.sections.CLUTCH?.alert) {
    const alert = latestReport.sections.CLUTCH.alert;
    allSeverities.push(
      alert.hydClutchClearanceTotal_severity,
      alert.hydClutchClearanceRear_severity,
      alert.fb_severity,
      alert.fTB_severity,
      alert.rTB_severity,
    );
  }

  // TODO: Add other sections when their alert logic is implemented
  // if (latestReport.sections.SLIDE?.alert) { ... }

  // Return the most critical severity
  if (allSeverities.includes('RED')) return 'critical';
  if (allSeverities.includes('YELLOW')) return 'warning';
  if (allSeverities.includes('GREEN')) return 'ok';

  return 'unknown';
};

/**
 * @deprecated Use calculateStatusFromLatestReport instead
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
 * Get the alert status for a specific section from latest report
 */
export const getSectionStatusFromReport = (
  section: string,
  latestReport: LatestReport | null,
): SectionStatus => {
  if (!latestReport) {
    return 'unknown';
  }

  switch (section) {
    case 'BEARING_CLEARANCE': {
      const bearingData = latestReport.sections.BEARING_CLEARANCE;
      if (!bearingData?.alert) {
        return 'unknown';
      }

      const alert = bearingData.alert;

      // Check all bearing fields for worst severity
      const severities = [
        alert.totalClearance_severity,
        alert.mainBearings_severity,
        alert.upperConnectionBearings_severity,
        alert.wristPinToMatingPart_severity,
        alert.wristPinToBushing_severity,
        alert.slideAdjNutToScrewSleeve_severity,
      ];

      if (severities.includes('RED')) {
        return 'alert';
      } else if (severities.includes('YELLOW')) {
        return 'warning';
      } else if (severities.includes('GREEN')) {
        return 'ok';
      }

      return 'unknown';
    }

    case 'CLUTCH': {
      const clutchData = latestReport.sections.CLUTCH;
      if (!clutchData?.alert) {
        return 'unknown';
      }

      const alert = clutchData.alert;

      // Check all clutch fields for worst severity
      const severities = [
        alert.hydClutchClearanceTotal_severity,
        alert.hydClutchClearanceRear_severity,
        alert.fb_severity,
        alert.fTB_severity,
        alert.rTB_severity,
      ];

      if (severities.includes('RED')) {
        return 'alert';
      } else if (severities.includes('YELLOW')) {
        return 'warning';
      } else if (severities.includes('GREEN')) {
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
 * @deprecated Use getSectionStatusFromReport instead
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

    case 'CLUTCH': {
      const alert = latestService?.alertClutch;
      if (!alert) {
        return 'unknown';
      }

      const severities = [
        alert.hydClutchClearanceTotal_severity,
        alert.hydClutchClearanceRear_severity,
        alert.fb_severity,
        alert.fTB_severity,
        alert.rTB_severity,
      ];

      if (severities.includes('RED')) {
        return 'alert';
      } else if (severities.includes('YELLOW')) {
        return 'warning';
      } else if (severities.includes('GREEN')) {
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

/**
 * Get the overall status for a production line based on all its machines
 * Returns the worst status among all machines (critical > warning > ok > unknown)
 * Optimized with early returns for better performance
 */
export const getProductionLineStatus = (machines: MachineWithStatus[]): AlertStatus => {
  if (!machines || machines.length === 0) {
    return 'unknown';
  }

  let hasWarning = false;
  let hasOk = false;

  for (const machine of machines) {
    const status = getAlertStatus(machine);

    // Early return for critical - no need to check other machines
    if (status === 'critical') {
      return 'critical';
    } else if (status === 'warning') {
      hasWarning = true;
    } else if (status === 'ok') {
      hasOk = true;
    }
  }

  // Return worst status found
  if (hasWarning) return 'warning';
  if (hasOk) return 'ok';

  return 'unknown';
};
