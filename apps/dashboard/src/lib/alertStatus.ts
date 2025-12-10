/**
 * Alert Status Utilities
 * Shared functions for determining machine and section alert statuses
 */

import type { MachineWithStatus } from '@/data/types/production-lines.types';
import type { LatestReport } from '@/data/types/services.types';

export type AlertStatus = 'ok' | 'warning' | 'critical';
export type SectionStatus = 'ok' | 'warning' | 'alert';
export type AlertSeverity = 'NONE' | 'GREEN' | 'YELLOW' | 'RED';

/**
 * Calculate machine alert status from latest report
 * This aggregates alerts from all sections to determine the overall machine status
 */
export const calculateStatusFromLatestReport = (latestReport: LatestReport | null): AlertStatus => {
  if (!latestReport) {
    return 'ok';
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

  // Collect severities from SLIDE_SINGLE_HAMMER section
  if (latestReport.sections.SLIDE_SINGLE_HAMMER?.alert) {
    const alert = latestReport.sections.SLIDE_SINGLE_HAMMER.alert;
    allSeverities.push(alert.maxDeviation_severity);
  }

  // Collect severities from SLIDE_DOUBLE_HAMMER section
  if (latestReport.sections.SLIDE_DOUBLE_HAMMER?.alert) {
    const alert = latestReport.sections.SLIDE_DOUBLE_HAMMER.alert;
    allSeverities.push(alert.maxDeviationOuter_severity, alert.maxDeviationInner_severity);
  }

  // Collect severities from GIBS section
  if (latestReport.sections.GIBS?.alert) {
    const alert = latestReport.sections.GIBS.alert;
    allSeverities.push(alert.usable_severity);
  }

  // Collect severities from PISTONS section
  if (latestReport.sections.PISTONS?.alert) {
    const alert = latestReport.sections.PISTONS.alert;
    // Only difference severities exist in the database
    allSeverities.push(
      // Outer difference severities
      alert.outer_lhLeftRight_severity,
      alert.outer_lhTopBottom_severity,
      alert.outer_rhLeftRight_severity,
      alert.outer_rhTopBottom_severity,
      // Inner difference severities
      alert.inner_lhLeftRight_severity,
      alert.inner_lhTopBottom_severity,
      alert.inner_rhLeftRight_severity,
      alert.inner_rhTopBottom_severity,
    );
  }

  // Collect severities from TRAMMING section
  if (latestReport.sections.TRAMMING?.alert) {
    const alert = latestReport.sections.TRAMMING.alert;
    allSeverities.push(
      // Outer severities (4 positions × 2 directions = 8)
      alert.outer_top_verticalSeverity,
      alert.outer_top_horizontalSeverity,
      alert.outer_bottom_verticalSeverity,
      alert.outer_bottom_horizontalSeverity,
      alert.outer_left_verticalSeverity,
      alert.outer_left_horizontalSeverity,
      alert.outer_right_verticalSeverity,
      alert.outer_right_horizontalSeverity,
      // Inner severities (4 positions × 2 directions = 8)
      alert.inner_top_verticalSeverity,
      alert.inner_top_horizontalSeverity,
      alert.inner_bottom_verticalSeverity,
      alert.inner_bottom_horizontalSeverity,
      alert.inner_left_verticalSeverity,
      alert.inner_left_horizontalSeverity,
      alert.inner_right_verticalSeverity,
      alert.inner_right_horizontalSeverity,
    );
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

  return 'ok';
};

/**
 * Get the overall alert status for a machine based on all alert types
 */
export const getAlertStatus = (machine: MachineWithStatus): AlertStatus => {
  if (!machine.services || machine.services.length === 0) {
    return 'ok';
  }

  const latestService = machine.services[0];
  const allSeverities: AlertSeverity[] = [];

  // Check alertBearingClearance
  const bearingAlerts = latestService?.alertBearingClearance;
  const bearingAlert = Array.isArray(bearingAlerts) ? bearingAlerts[0] : bearingAlerts;
  if (bearingAlert) {
    allSeverities.push(
      bearingAlert.outer_totalClearance_severity,
      bearingAlert.outer_mainBearings_severity,
      bearingAlert.outer_upperConnectionBearings_severity,
      bearingAlert.outer_wristPinToMatingPart_severity,
      bearingAlert.outer_wristPinToBushing_severity,
      bearingAlert.outer_slideAdjNutToScrewSleeve_severity,
      bearingAlert.inner_totalClearance_severity,
      bearingAlert.inner_mainBearings_severity,
      bearingAlert.inner_upperConnectionBearings_severity,
      bearingAlert.inner_wristPinToMatingPart_severity,
      bearingAlert.inner_wristPinToBushing_severity,
      bearingAlert.inner_slideAdjNutToScrewSleeve_severity,
    );
  }

  // Check alertClutch
  const clutchAlerts = latestService?.alertClutch;
  const clutchAlert = Array.isArray(clutchAlerts) ? clutchAlerts[0] : clutchAlerts;
  if (clutchAlert) {
    allSeverities.push(
      clutchAlert.hydClutchClearanceTotal_severity,
      clutchAlert.hydClutchClearanceRear_severity,
      clutchAlert.fb_severity,
      clutchAlert.fTB_severity,
      clutchAlert.rTB_severity,
    );
  }

  // Check alertSlideDoubleHammer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const slideDoubleAlerts = (latestService as any)?.alertSlideDoubleHammer;
  const slideDoubleAlert = Array.isArray(slideDoubleAlerts)
    ? slideDoubleAlerts[0]
    : slideDoubleAlerts;
  if (slideDoubleAlert) {
    allSeverities.push(
      slideDoubleAlert.maxDeviationOuter_severity,
      slideDoubleAlert.maxDeviationInner_severity,
    );
  }

  // Check alertSlideSingleHammer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const slideSingleAlerts = (latestService as any)?.alertSlideSingleHammer;
  const slideSingleAlert = Array.isArray(slideSingleAlerts)
    ? slideSingleAlerts[0]
    : slideSingleAlerts;
  if (slideSingleAlert) {
    allSeverities.push(slideSingleAlert.maxDeviation_severity);
  }

  // Check alertGibs
  const gibsAlerts = latestService?.alertGibs;
  const gibsAlert = Array.isArray(gibsAlerts) ? gibsAlerts[0] : gibsAlerts;
  if (gibsAlert) {
    allSeverities.push(gibsAlert.usable_severity);
  }

  // Check alertCounterbalanceCylinderAirbag (any alert = RED)
  const counterbalanceAlerts = latestService?.alertCounterbalanceCylinderAirbag;
  if (counterbalanceAlerts && counterbalanceAlerts.length > 0) {
    allSeverities.push('RED');
  }

  // Check alertPistons
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pistonsAlerts = (latestService as any)?.alertPistons;
  const pistonsAlert = Array.isArray(pistonsAlerts) ? pistonsAlerts[0] : pistonsAlerts;
  if (pistonsAlert) {
    allSeverities.push(
      pistonsAlert.outer_lhLeftRight_severity,
      pistonsAlert.outer_lhTopBottom_severity,
      pistonsAlert.outer_rhLeftRight_severity,
      pistonsAlert.outer_rhTopBottom_severity,
      pistonsAlert.inner_lhLeftRight_severity,
      pistonsAlert.inner_lhTopBottom_severity,
      pistonsAlert.inner_rhLeftRight_severity,
      pistonsAlert.inner_rhTopBottom_severity,
    );
  }

  // Check alertTramming
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const trammingAlerts = (latestService as any)?.alertTramming;
  const trammingAlert = Array.isArray(trammingAlerts) ? trammingAlerts[0] : trammingAlerts;
  if (trammingAlert) {
    allSeverities.push(
      trammingAlert.outer_top_verticalSeverity,
      trammingAlert.outer_top_horizontalSeverity,
      trammingAlert.outer_bottom_verticalSeverity,
      trammingAlert.outer_bottom_horizontalSeverity,
      trammingAlert.outer_left_verticalSeverity,
      trammingAlert.outer_left_horizontalSeverity,
      trammingAlert.outer_right_verticalSeverity,
      trammingAlert.outer_right_horizontalSeverity,
      trammingAlert.inner_top_verticalSeverity,
      trammingAlert.inner_top_horizontalSeverity,
      trammingAlert.inner_bottom_verticalSeverity,
      trammingAlert.inner_bottom_horizontalSeverity,
      trammingAlert.inner_left_verticalSeverity,
      trammingAlert.inner_left_horizontalSeverity,
      trammingAlert.inner_right_verticalSeverity,
      trammingAlert.inner_right_horizontalSeverity,
    );
  }

  // Return the most critical severity
  if (allSeverities.includes('RED')) return 'critical';
  if (allSeverities.includes('YELLOW')) return 'warning';

  return 'ok';
};

/**
 * Get the alert status for a specific section from latest report
 */
export const getSectionStatusFromReport = (
  section: string,
  latestReport: LatestReport | null,
): SectionStatus => {
  if (!latestReport) {
    return 'ok';
  }

  switch (section) {
    case 'BEARING_CLEARANCE': {
      const bearingData = latestReport.sections.BEARING_CLEARANCE;
      if (!bearingData?.alert) {
        return 'ok';
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
      }

      return 'ok';
    }

    case 'CLUTCH': {
      const clutchData = latestReport.sections.CLUTCH;
      if (!clutchData?.alert) {
        return 'ok';
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
      }

      return 'ok';
    }

    case 'SLIDE_SINGLE_HAMMER': {
      const slideData = latestReport.sections.SLIDE_SINGLE_HAMMER;
      if (!slideData?.alert) {
        return 'ok';
      }

      const alert = slideData.alert;
      const severity = alert.maxDeviation_severity;

      if (severity === 'RED') {
        return 'alert';
      } else if (severity === 'YELLOW') {
        return 'warning';
      } else if (severity === 'GREEN') {
        return 'ok';
      }

      return 'ok';
    }

    case 'SLIDE_DOUBLE_HAMMER': {
      const slideData = latestReport.sections.SLIDE_DOUBLE_HAMMER;
      if (!slideData?.alert) {
        return 'ok';
      }

      const alert = slideData.alert;

      // Check all slide fields for worst severity
      const severities = [alert.maxDeviationOuter_severity, alert.maxDeviationInner_severity];

      if (severities.includes('RED')) {
        return 'alert';
      } else if (severities.includes('YELLOW')) {
        return 'warning';
      }

      return 'ok';
    }

    case 'GIBS': {
      const gibsData = latestReport.sections.GIBS;
      if (!gibsData?.alert) {
        return 'ok';
      }

      const alert = gibsData.alert;
      const severity = alert.usable_severity;

      if (severity === 'RED') {
        return 'alert';
      } else if (severity === 'YELLOW') {
        return 'warning';
      }

      return 'ok';
    }

    case 'PISTONS': {
      const pistonsData = latestReport.sections.PISTONS;
      if (!pistonsData?.alert) {
        return 'ok';
      }

      const alert = pistonsData.alert;

      // Check all pistons difference fields for worst severity
      // Only difference severities exist in the database
      const severities: AlertSeverity[] = [
        // Outer difference severities
        alert.outer_lhLeftRight_severity,
        alert.outer_lhTopBottom_severity,
        alert.outer_rhLeftRight_severity,
        alert.outer_rhTopBottom_severity,
        // Inner difference severities
        alert.inner_lhLeftRight_severity,
        alert.inner_lhTopBottom_severity,
        alert.inner_rhLeftRight_severity,
        alert.inner_rhTopBottom_severity,
      ];

      if (severities.includes('RED')) {
        return 'alert';
      } else if (severities.includes('YELLOW')) {
        return 'warning';
      }

      return 'ok';
    }

    case 'COUNTERBALANCE_CYLINDER_AIRBAG': {
      const counterbalanceData = latestReport.sections.COUNTERBALANCE_CYLINDER_AIRBAG;
      // If there are any custom alerts, return 'alert' (red)
      if (counterbalanceData?.alerts && counterbalanceData.alerts.length > 0) {
        return 'alert';
      }
      // No alerts means ok status
      return 'ok';
    }

    case 'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER': {
      const lubricationData =
        latestReport.sections.LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER;
      if (!lubricationData?.alert) {
        // No alert means either no oil change tracked or within normal range
        return 'ok';
      }

      const severity = lubricationData.alert.severity;
      if (severity === 'RED') {
        return 'alert';
      } else if (severity === 'YELLOW') {
        return 'warning';
      }

      return 'ok';
    }

    case 'TRAMMING': {
      const trammingData = latestReport.sections.TRAMMING;
      if (!trammingData?.alert) {
        return 'ok';
      }

      const alert = trammingData.alert;

      // Check all tramming fields for worst severity
      const severities: AlertSeverity[] = [
        // Outer severities (4 positions × 2 directions = 8)
        alert.outer_top_verticalSeverity,
        alert.outer_top_horizontalSeverity,
        alert.outer_bottom_verticalSeverity,
        alert.outer_bottom_horizontalSeverity,
        alert.outer_left_verticalSeverity,
        alert.outer_left_horizontalSeverity,
        alert.outer_right_verticalSeverity,
        alert.outer_right_horizontalSeverity,
        // Inner severities (4 positions × 2 directions = 8)
        alert.inner_top_verticalSeverity,
        alert.inner_top_horizontalSeverity,
        alert.inner_bottom_verticalSeverity,
        alert.inner_bottom_horizontalSeverity,
        alert.inner_left_verticalSeverity,
        alert.inner_left_horizontalSeverity,
        alert.inner_right_verticalSeverity,
        alert.inner_right_horizontalSeverity,
      ];

      if (severities.includes('RED')) {
        return 'alert';
      } else if (severities.includes('YELLOW')) {
        return 'warning';
      }

      return 'ok';
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
    return 'ok';
  }

  const latestService = machine.services[0];

  switch (section) {
    case 'BEARING_CLEARANCE': {
      // alertBearingClearance is an array - get the first (most recent) one
      const alerts = latestService?.alertBearingClearance;
      const alert = Array.isArray(alerts) ? alerts[0] : alerts;
      if (!alert) {
        return 'ok';
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
      }

      return 'ok';
    }

    case 'CLUTCH': {
      // alertClutch is an array - get the first (most recent) one
      const alerts = latestService?.alertClutch;
      const alert = Array.isArray(alerts) ? alerts[0] : alerts;
      if (!alert) {
        return 'ok';
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
      }

      return 'ok';
    }

    case 'SLIDE_SINGLE_HAMMER': {
      // alertSlideSingleHammer is an array - get the first (most recent) one
      const alerts = (latestService as any)?.alertSlideSingleHammer;
      const alert = Array.isArray(alerts) ? alerts[0] : alerts;
      if (!alert) {
        return 'ok';
      }

      const severity = alert.maxDeviation_severity;

      if (severity === 'RED') {
        return 'alert';
      } else if (severity === 'YELLOW') {
        return 'warning';
      } else if (severity === 'GREEN') {
        return 'ok';
      }

      return 'ok';
    }

    case 'SLIDE_DOUBLE_HAMMER': {
      // alertSlideDoubleHammer is an array - get the first (most recent) one
      const alerts = (latestService as any)?.alertSlideDoubleHammer;
      const alert = Array.isArray(alerts) ? alerts[0] : alerts;
      if (!alert) {
        return 'ok';
      }

      const severities = [alert.maxDeviationOuter_severity, alert.maxDeviationInner_severity];

      if (severities.includes('RED')) {
        return 'alert';
      } else if (severities.includes('YELLOW')) {
        return 'warning';
      }

      return 'ok';
    }

    case 'GIBS': {
      // alertGibs is an array - get the first (most recent) one
      const alerts = latestService?.alertGibs;
      const alert = Array.isArray(alerts) ? alerts[0] : alerts;
      if (!alert) {
        return 'ok';
      }

      const severity = alert.usable_severity;

      if (severity === 'RED') {
        return 'alert';
      } else if (severity === 'YELLOW') {
        return 'warning';
      }

      return 'ok';
    }

    case 'PISTONS': {
      // Using type assertion since alertPistons may not be in the shared MachineService type yet
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const alerts = (latestService as any)?.alertPistons;
      const alert = Array.isArray(alerts) ? alerts[0] : alerts;
      if (!alert) {
        return 'ok';
      }

      // Only difference severities exist in the database
      const severities = [
        // Outer difference severities
        alert.outer_lhLeftRight_severity,
        alert.outer_lhTopBottom_severity,
        alert.outer_rhLeftRight_severity,
        alert.outer_rhTopBottom_severity,
        // Inner difference severities
        alert.inner_lhLeftRight_severity,
        alert.inner_lhTopBottom_severity,
        alert.inner_rhLeftRight_severity,
        alert.inner_rhTopBottom_severity,
      ];

      if (severities.includes('RED')) {
        return 'alert';
      } else if (severities.includes('YELLOW')) {
        return 'warning';
      }

      return 'ok';
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

    case 'TRAMMING': {
      // Using type assertion since alertTramming may not be in the shared MachineService type yet
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const alerts = (latestService as any)?.alertTramming;
      const alert = Array.isArray(alerts) ? alerts[0] : alerts;
      if (!alert) {
        return 'ok';
      }

      const severities = [
        // Outer severities (4 positions × 2 directions = 8)
        alert.outer_top_verticalSeverity,
        alert.outer_top_horizontalSeverity,
        alert.outer_bottom_verticalSeverity,
        alert.outer_bottom_horizontalSeverity,
        alert.outer_left_verticalSeverity,
        alert.outer_left_horizontalSeverity,
        alert.outer_right_verticalSeverity,
        alert.outer_right_horizontalSeverity,
        // Inner severities (4 positions × 2 directions = 8)
        alert.inner_top_verticalSeverity,
        alert.inner_top_horizontalSeverity,
        alert.inner_bottom_verticalSeverity,
        alert.inner_bottom_horizontalSeverity,
        alert.inner_left_verticalSeverity,
        alert.inner_left_horizontalSeverity,
        alert.inner_right_verticalSeverity,
        alert.inner_right_horizontalSeverity,
      ];

      if (severities.includes('RED')) {
        return 'alert';
      } else if (severities.includes('YELLOW')) {
        return 'warning';
      }

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
} as const;

/**
 * Status colors for section badges
 */
export const sectionStatusColors = {
  ok: 'text-green-500',
  warning: 'text-yellow-500',
  alert: 'text-red-500',
} as const;

/**
 * Status labels (Portuguese)
 */
export const statusLabels = {
  ok: 'OK',
  warning: 'Atenção',
  critical: 'Crítico',
} as const;

/**
 * Get the overall status for a production line based on all its machines
 * Returns the worst status among all machines (critical > warning > ok)
 * Optimized with early returns for better performance
 */
export const getProductionLineStatus = (machines: MachineWithStatus[]): AlertStatus => {
  if (!machines || machines.length === 0) {
    return 'ok';
  }

  let hasWarning = false;

  for (const machine of machines) {
    const status = getAlertStatus(machine);

    // Early return for critical - no need to check other machines
    if (status === 'critical') {
      return 'critical';
    } else if (status === 'warning') {
      hasWarning = true;
    }
  }

  // Return worst status found
  if (hasWarning) return 'warning';

  return 'ok';
};
