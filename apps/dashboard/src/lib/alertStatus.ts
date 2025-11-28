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

  // Collect severities from BEARING_CLEARANCE section (outer and inner)
  if (latestReport.sections.BEARING_CLEARANCE?.alert) {
    const alert = latestReport.sections.BEARING_CLEARANCE.alert;
    // Outer severities
    allSeverities.push(
      alert.outer_totalClearance_severity,
      alert.outer_mainBearings_severity,
      alert.outer_upperConnectionBearings_severity,
      alert.outer_wristPinToMatingPart_severity,
      alert.outer_wristPinToBushing_severity,
      alert.outer_slideAdjNutToScrewSleeve_severity,
    );
    // Inner severities
    allSeverities.push(
      alert.inner_totalClearance_severity,
      alert.inner_mainBearings_severity,
      alert.inner_upperConnectionBearings_severity,
      alert.inner_wristPinToMatingPart_severity,
      alert.inner_wristPinToBushing_severity,
      alert.inner_slideAdjNutToScrewSleeve_severity,
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

  // Collect severities from SLIDE section
  if (latestReport.sections.SLIDE?.alert) {
    const alert = latestReport.sections.SLIDE.alert;
    allSeverities.push(alert.maxDeviationOuter_severity, alert.maxDeviationInner_severity);
  }

  // Collect severities from GIBS section
  if (latestReport.sections.GIBS?.alert) {
    const alert = latestReport.sections.GIBS.alert;
    allSeverities.push(alert.usable_severity);
  }

  // Check for COUNTERBALANCE custom alerts (any alert = RED severity)
  if (
    latestReport.sections.COUNTERBALANCE_CYLINDER_AIRBAG?.alerts &&
    latestReport.sections.COUNTERBALANCE_CYLINDER_AIRBAG.alerts.length > 0
  ) {
    allSeverities.push('RED');
  }

  // Check for LUBRICATION oil change alert
  if (latestReport.sections.LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER?.alert) {
    const alert = latestReport.sections.LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER.alert;
    allSeverities.push(alert.severity);
  }

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

  // Check all bearing fields for worst severity (outer and inner)
  const severities = [
    // Outer
    alert.outer_totalClearance_severity,
    alert.outer_mainBearings_severity,
    alert.outer_upperConnectionBearings_severity,
    alert.outer_wristPinToMatingPart_severity,
    alert.outer_wristPinToBushing_severity,
    alert.outer_slideAdjNutToScrewSleeve_severity,
    // Inner
    alert.inner_totalClearance_severity,
    alert.inner_mainBearings_severity,
    alert.inner_upperConnectionBearings_severity,
    alert.inner_wristPinToMatingPart_severity,
    alert.inner_wristPinToBushing_severity,
    alert.inner_slideAdjNutToScrewSleeve_severity,
  ];

  if (severities.includes('RED')) {
    return 'critical';
  } else if (severities.includes('YELLOW')) {
    return 'warning';
  } else if (severities.includes('GREEN')) {
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

      // Check all bearing fields for worst severity (outer and inner)
      const severities = [
        // Outer
        alert.outer_totalClearance_severity,
        alert.outer_mainBearings_severity,
        alert.outer_upperConnectionBearings_severity,
        alert.outer_wristPinToMatingPart_severity,
        alert.outer_wristPinToBushing_severity,
        alert.outer_slideAdjNutToScrewSleeve_severity,
        // Inner
        alert.inner_totalClearance_severity,
        alert.inner_mainBearings_severity,
        alert.inner_upperConnectionBearings_severity,
        alert.inner_wristPinToMatingPart_severity,
        alert.inner_wristPinToBushing_severity,
        alert.inner_slideAdjNutToScrewSleeve_severity,
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

    case 'SLIDE': {
      const slideData = latestReport.sections.SLIDE;
      if (!slideData?.alert) {
        return 'unknown';
      }

      const alert = slideData.alert;

      // Check all slide fields for worst severity
      const severities = [alert.maxDeviationOuter_severity, alert.maxDeviationInner_severity];

      if (severities.includes('RED')) {
        return 'alert';
      } else if (severities.includes('YELLOW')) {
        return 'warning';
      } else if (severities.includes('GREEN')) {
        return 'ok';
      }

      return 'unknown';
    }

    case 'GIBS': {
      const gibsData = latestReport.sections.GIBS;
      if (!gibsData?.alert) {
        return 'unknown';
      }

      const alert = gibsData.alert;
      const severity = alert.usable_severity;

      if (severity === 'RED') {
        return 'alert';
      } else if (severity === 'YELLOW') {
        return 'warning';
      } else if (severity === 'GREEN') {
        return 'ok';
      }

      return 'unknown';
    }

    case 'COUNTERBALANCE_CYLINDER_AIRBAG': {
      const counterbalanceData = latestReport.sections.COUNTERBALANCE_CYLINDER_AIRBAG;
      // If there are any custom alerts, return 'alert' (red)
      if (counterbalanceData?.alerts && counterbalanceData.alerts.length > 0) {
        return 'alert';
      }
      // If there's data but no alerts, return 'ok'
      if (counterbalanceData?.data) {
        return 'ok';
      }
      return 'unknown';
    }

    case 'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER': {
      const lubricationData =
        latestReport.sections.LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER;
      if (!lubricationData?.alert) {
        // No alert means either no oil change tracked or within normal range
        if (lubricationData?.data) {
          return 'ok';
        }
        return 'unknown';
      }

      const severity = lubricationData.alert.severity;
      if (severity === 'RED') {
        return 'alert';
      } else if (severity === 'YELLOW') {
        return 'warning';
      } else if (severity === 'GREEN') {
        return 'ok';
      }

      return 'unknown';
    }

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

      // Check all bearing fields for worst severity (outer and inner)
      const severities = [
        // Outer
        alert.outer_totalClearance_severity,
        alert.outer_mainBearings_severity,
        alert.outer_upperConnectionBearings_severity,
        alert.outer_wristPinToMatingPart_severity,
        alert.outer_wristPinToBushing_severity,
        alert.outer_slideAdjNutToScrewSleeve_severity,
        // Inner
        alert.inner_totalClearance_severity,
        alert.inner_mainBearings_severity,
        alert.inner_upperConnectionBearings_severity,
        alert.inner_wristPinToMatingPart_severity,
        alert.inner_wristPinToBushing_severity,
        alert.inner_slideAdjNutToScrewSleeve_severity,
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

    case 'SLIDE': {
      const alert = latestService?.alertSlide;
      if (!alert) {
        return 'unknown';
      }

      const severities = [alert.maxDeviationOuter_severity, alert.maxDeviationInner_severity];

      if (severities.includes('RED')) {
        return 'alert';
      } else if (severities.includes('YELLOW')) {
        return 'warning';
      } else if (severities.includes('GREEN')) {
        return 'ok';
      }

      return 'unknown';
    }

    case 'GIBS': {
      const alert = latestService?.alertGibs;
      if (!alert) {
        return 'unknown';
      }

      const severity = alert.usable_severity;

      if (severity === 'RED') {
        return 'alert';
      } else if (severity === 'YELLOW') {
        return 'warning';
      } else if (severity === 'GREEN') {
        return 'ok';
      }

      return 'unknown';
    }

    case 'COUNTERBALANCE_CYLINDER_AIRBAG': {
      const alerts = latestService?.alertCounterbalanceCylinderAirbag;
      // If there are any custom alerts, return 'alert' (red)
      if (alerts && alerts.length > 0) {
        return 'alert';
      }
      // No alerts means ok status
      return 'ok';
    }

    case 'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER': {
      // Oil change alert requires looking at all services to find last oil change
      // This is calculated in the LatestReport - use getSectionStatusFromReport instead
      // For this deprecated function, return 'ok' as default
      return 'ok';
    }

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
