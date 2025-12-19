import { PrismaClient } from '@prisma/client';
import {
  AlertDetailDto,
  AlertSeverityDto,
  AlertsSummaryResponseDto,
  SectionAlertDto,
} from '@titans-tech/shared/backend-dtos';

export type GetAlertsSummaryResult =
  | { error: { code: 'NOT_FOUND'; message: string } }
  | AlertsSummaryResponseDto;

export async function getAlertsSummary(
  prisma: PrismaClient,
  serviceId: string,
): Promise<GetAlertsSummaryResult> {
  const service = await (prisma as any).machineService.findUnique({
    where: { id: serviceId },
    include: {
      alertBearingClearance: { orderBy: { createdAt: 'desc' }, take: 1 },
      alertClutch: { orderBy: { createdAt: 'desc' }, take: 1 },
      alertSlide: { orderBy: { createdAt: 'desc' }, take: 1 },
      alertSlideSingleHammer: { orderBy: { createdAt: 'desc' }, take: 1 },
      alertSlideDoubleHammer: { orderBy: { createdAt: 'desc' }, take: 1 },
      alertGibs: { orderBy: { createdAt: 'desc' }, take: 1 },
      alertPistons: { orderBy: { createdAt: 'desc' }, take: 1 },
      alertCounterbalanceCylinderAirbag: { orderBy: { createdAt: 'desc' }, take: 1 },
      alertTramming: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  if (!service) {
    return { error: { code: 'NOT_FOUND', message: `Service with ID ${serviceId} not found` } };
  }

  const sections: SectionAlertDto[] = [];
  let highestSeverity: AlertSeverityDto = 'NONE';
  let alertCount = 0;

  const updateHighestSeverity = (severity: AlertSeverityDto) => {
    if (severity === 'RED') highestSeverity = 'RED';
    else if (severity === 'YELLOW' && highestSeverity !== 'RED') highestSeverity = 'YELLOW';
    else if (severity === 'GREEN' && highestSeverity === 'NONE') highestSeverity = 'GREEN';
  };

  if (service.alertBearingClearance && service.alertBearingClearance.length > 0) {
    const alert = service.alertBearingClearance[0];
    const alerts: AlertDetailDto[] = [];
    let sectionSeverity: AlertSeverityDto = 'NONE';

    const bcFields = [
      {
        field: 'outer_totalClearance',
        label: 'Total Clearance (Outer)',
        severity: alert.outer_totalClearance_severity as AlertSeverityDto,
        value: alert.outer_totalClearance_differential?.toString() || '0',
      },
      {
        field: 'outer_mainBearings',
        label: 'Main Bearings (Outer)',
        severity: alert.outer_mainBearings_severity as AlertSeverityDto,
        value: alert.outer_mainBearings_differential?.toString() || '0',
      },
      {
        field: 'outer_upperConnectionBearings',
        label: 'Upper Connection Bearings (Outer)',
        severity: alert.outer_upperConnectionBearings_severity as AlertSeverityDto,
        value: alert.outer_upperConnectionBearings_differential?.toString() || '0',
      },
      {
        field: 'outer_wristPinToMatingPart',
        label: 'Wrist Pin to Mating Part (Outer)',
        severity: alert.outer_wristPinToMatingPart_severity as AlertSeverityDto,
        value: alert.outer_wristPinToMatingPart_differential?.toString() || '0',
      },
      {
        field: 'outer_wristPinToBushing',
        label: 'Wrist Pin to Bushing (Outer)',
        severity: alert.outer_wristPinToBushing_severity as AlertSeverityDto,
        value: alert.outer_wristPinToBushing_differential?.toString() || '0',
      },
      {
        field: 'outer_slideAdjNutToScrewSleeve',
        label: 'Slide Adj Nut to Screw Sleeve (Outer)',
        severity: alert.outer_slideAdjNutToScrewSleeve_severity as AlertSeverityDto,
        value: alert.outer_slideAdjNutToScrewSleeve_differential?.toString() || '0',
      },
      {
        field: 'inner_totalClearance',
        label: 'Total Clearance (Inner)',
        severity: alert.inner_totalClearance_severity as AlertSeverityDto,
        value: alert.inner_totalClearance_differential?.toString() || '0',
      },
      {
        field: 'inner_mainBearings',
        label: 'Main Bearings (Inner)',
        severity: alert.inner_mainBearings_severity as AlertSeverityDto,
        value: alert.inner_mainBearings_differential?.toString() || '0',
      },
      {
        field: 'inner_upperConnectionBearings',
        label: 'Upper Connection Bearings (Inner)',
        severity: alert.inner_upperConnectionBearings_severity as AlertSeverityDto,
        value: alert.inner_upperConnectionBearings_differential?.toString() || '0',
      },
      {
        field: 'inner_wristPinToMatingPart',
        label: 'Wrist Pin to Mating Part (Inner)',
        severity: alert.inner_wristPinToMatingPart_severity as AlertSeverityDto,
        value: alert.inner_wristPinToMatingPart_differential?.toString() || '0',
      },
      {
        field: 'inner_wristPinToBushing',
        label: 'Wrist Pin to Bushing (Inner)',
        severity: alert.inner_wristPinToBushing_severity as AlertSeverityDto,
        value: alert.inner_wristPinToBushing_differential?.toString() || '0',
      },
      {
        field: 'inner_slideAdjNutToScrewSleeve',
        label: 'Slide Adj Nut to Screw Sleeve (Inner)',
        severity: alert.inner_slideAdjNutToScrewSleeve_severity as AlertSeverityDto,
        value: alert.inner_slideAdjNutToScrewSleeve_differential?.toString() || '0',
      },
    ];

    for (const f of bcFields) {
      if (f.severity === 'YELLOW' || f.severity === 'RED') {
        alerts.push({ field: f.field, fieldLabel: f.label, value: f.value, severity: f.severity });
        alertCount++;
        if (f.severity === 'RED') sectionSeverity = 'RED';
        else if (f.severity === 'YELLOW' && sectionSeverity !== 'RED') sectionSeverity = 'YELLOW';
      }
    }

    if (alerts.length > 0) {
      sections.push({
        sectionKey: 'BEARING_CLEARANCE',
        sectionName: 'Bearing Clearance',
        severity: sectionSeverity,
        alerts,
      });
      updateHighestSeverity(sectionSeverity);
    }
  }

  if (service.alertClutch && service.alertClutch.length > 0) {
    const alert = service.alertClutch[0];
    const alerts: AlertDetailDto[] = [];
    let sectionSeverity: AlertSeverityDto = 'NONE';

    const clutchFields = [
      {
        field: 'hydClutchClearanceTotal',
        label: 'Hyd Clutch Clearance Total',
        severity: alert.hydClutchClearanceTotal_severity as AlertSeverityDto,
        value: alert.hydClutchClearanceTotal_value?.toString() || '0',
      },
      {
        field: 'hydClutchClearanceRear',
        label: 'Hyd Clutch Clearance Rear',
        severity: alert.hydClutchClearanceRear_severity as AlertSeverityDto,
        value: alert.hydClutchClearanceRear_value?.toString() || '0',
      },
      {
        field: 'fb',
        label: 'F-B (Front-Back)',
        severity: alert.fb_severity as AlertSeverityDto,
        value: alert.fb_value?.toString() || '0',
      },
      {
        field: 'fTB',
        label: 'F-TB (Front Top-Bottom)',
        severity: alert.fTB_severity as AlertSeverityDto,
        value: alert.fTB_value?.toString() || '0',
      },
      {
        field: 'rTB',
        label: 'Rear Top-Bottom',
        severity: alert.rTB_severity as AlertSeverityDto,
        value: alert.rTB_value?.toString() || '0',
      },
    ];

    for (const f of clutchFields) {
      if (f.severity === 'YELLOW' || f.severity === 'RED') {
        alerts.push({ field: f.field, fieldLabel: f.label, value: f.value, severity: f.severity });
        alertCount++;
        if (f.severity === 'RED') sectionSeverity = 'RED';
        else if (f.severity === 'YELLOW' && sectionSeverity !== 'RED') sectionSeverity = 'YELLOW';
      }
    }

    if (alerts.length > 0) {
      sections.push({
        sectionKey: 'CLUTCH',
        sectionName: 'Clutch',
        severity: sectionSeverity,
        alerts,
      });
      updateHighestSeverity(sectionSeverity);
    }
  }

  if (service.alertSlideSingleHammer && service.alertSlideSingleHammer.length > 0) {
    const alert = service.alertSlideSingleHammer[0];
    const alerts: AlertDetailDto[] = [];
    let sectionSeverity: AlertSeverityDto = 'NONE';
    const severity = alert.maxDeviation_severity as AlertSeverityDto;
    if (severity === 'YELLOW' || severity === 'RED') {
      alerts.push({
        field: 'maxDeviation',
        fieldLabel: 'Max Deviation',
        value: alert.maxDeviation_differential?.toString() || '0',
        severity,
      });
      alertCount++;
      sectionSeverity = severity;
    }
    if (alerts.length > 0) {
      sections.push({
        sectionKey: 'SLIDE_SINGLE_HAMMER',
        sectionName: 'Slide (Single Hammer)',
        severity: sectionSeverity,
        alerts,
      });
      updateHighestSeverity(sectionSeverity);
    }
  }

  if (service.alertSlideDoubleHammer && service.alertSlideDoubleHammer.length > 0) {
    const alert = service.alertSlideDoubleHammer[0];
    const alerts: AlertDetailDto[] = [];
    let sectionSeverity: AlertSeverityDto = 'NONE';
    const slideFields = [
      {
        field: 'maxDeviationOuter',
        label: 'Max Deviation (Outer)',
        severity: alert.maxDeviationOuter_severity as AlertSeverityDto,
        value: alert.maxDeviationOuter_differential?.toString() || '0',
      },
      {
        field: 'maxDeviationInner',
        label: 'Max Deviation (Inner)',
        severity: alert.maxDeviationInner_severity as AlertSeverityDto,
        value: alert.maxDeviationInner_differential?.toString() || '0',
      },
    ];
    for (const f of slideFields) {
      if (f.severity === 'YELLOW' || f.severity === 'RED') {
        alerts.push({ field: f.field, fieldLabel: f.label, value: f.value, severity: f.severity });
        alertCount++;
        if (f.severity === 'RED') sectionSeverity = 'RED';
        else if (f.severity === 'YELLOW' && sectionSeverity !== 'RED') sectionSeverity = 'YELLOW';
      }
    }
    if (alerts.length > 0) {
      sections.push({
        sectionKey: 'SLIDE_DOUBLE_HAMMER',
        sectionName: 'Slide (Double Hammer)',
        severity: sectionSeverity,
        alerts,
      });
      updateHighestSeverity(sectionSeverity);
    }
  }

  if (
    service.alertSlide &&
    service.alertSlide.length > 0 &&
    !(service.alertSlideSingleHammer?.length > 0) &&
    !(service.alertSlideDoubleHammer?.length > 0)
  ) {
    const alert = service.alertSlide[0];
    const alerts: AlertDetailDto[] = [];
    let sectionSeverity: AlertSeverityDto = 'NONE';
    const slideFields = [
      {
        field: 'maxDeviationOuter',
        label: 'Max Deviation (Outer)',
        severity: alert.maxDeviationOuter_severity as AlertSeverityDto,
        value: alert.maxDeviationOuter_differential?.toString() || '0',
      },
      {
        field: 'maxDeviationInner',
        label: 'Max Deviation (Inner)',
        severity: alert.maxDeviationInner_severity as AlertSeverityDto,
        value: alert.maxDeviationInner_differential?.toString() || '0',
      },
    ];
    for (const f of slideFields) {
      if (f.severity === 'YELLOW' || f.severity === 'RED') {
        alerts.push({ field: f.field, fieldLabel: f.label, value: f.value, severity: f.severity });
        alertCount++;
        if (f.severity === 'RED') sectionSeverity = 'RED';
        else if (f.severity === 'YELLOW' && sectionSeverity !== 'RED') sectionSeverity = 'YELLOW';
      }
    }
    if (alerts.length > 0) {
      sections.push({
        sectionKey: 'SLIDE_DOUBLE_HAMMER',
        sectionName: 'Slide (Double Hammer)',
        severity: sectionSeverity,
        alerts,
      });
      updateHighestSeverity(sectionSeverity);
    }
  }

  if (service.alertGibs && service.alertGibs.length > 0) {
    const alert = service.alertGibs[0];
    const alerts: AlertDetailDto[] = [];
    let sectionSeverity: AlertSeverityDto = 'NONE';
    const severity = alert.usable_severity as AlertSeverityDto;
    if (severity === 'YELLOW' || severity === 'RED') {
      alerts.push({
        field: 'usable',
        fieldLabel: 'Usable',
        value: alert.usable_value?.toString() || '0',
        severity,
      });
      alertCount++;
      sectionSeverity = severity;
    }
    if (alerts.length > 0) {
      sections.push({ sectionKey: 'GIBS', sectionName: 'Gibs', severity: sectionSeverity, alerts });
      updateHighestSeverity(sectionSeverity);
    }
  }

  if (service.alertPistons && service.alertPistons.length > 0) {
    const alert = service.alertPistons[0];
    const alerts: AlertDetailDto[] = [];
    let sectionSeverity: AlertSeverityDto = 'NONE';
    const pistonsFields = [
      {
        field: 'outer_lhLeftRight',
        label: 'LH Left-Right Diff (Outer)',
        severity: alert.outer_lhLeftRight_severity as AlertSeverityDto,
        value: alert.outer_lhLeftRight_diff?.toString(),
      },
      {
        field: 'outer_lhTopBottom',
        label: 'LH Top-Bottom Diff (Outer)',
        severity: alert.outer_lhTopBottom_severity as AlertSeverityDto,
        value: alert.outer_lhTopBottom_diff?.toString(),
      },
      {
        field: 'outer_rhLeftRight',
        label: 'RH Left-Right Diff (Outer)',
        severity: alert.outer_rhLeftRight_severity as AlertSeverityDto,
        value: alert.outer_rhLeftRight_diff?.toString(),
      },
      {
        field: 'outer_rhTopBottom',
        label: 'RH Top-Bottom Diff (Outer)',
        severity: alert.outer_rhTopBottom_severity as AlertSeverityDto,
        value: alert.outer_rhTopBottom_diff?.toString(),
      },
      {
        field: 'inner_lhLeftRight',
        label: 'LH Left-Right Diff (Inner)',
        severity: alert.inner_lhLeftRight_severity as AlertSeverityDto,
        value: alert.inner_lhLeftRight_diff?.toString(),
      },
      {
        field: 'inner_lhTopBottom',
        label: 'LH Top-Bottom Diff (Inner)',
        severity: alert.inner_lhTopBottom_severity as AlertSeverityDto,
        value: alert.inner_lhTopBottom_diff?.toString(),
      },
      {
        field: 'inner_rhLeftRight',
        label: 'RH Left-Right Diff (Inner)',
        severity: alert.inner_rhLeftRight_severity as AlertSeverityDto,
        value: alert.inner_rhLeftRight_diff?.toString(),
      },
      {
        field: 'inner_rhTopBottom',
        label: 'RH Top-Bottom Diff (Inner)',
        severity: alert.inner_rhTopBottom_severity as AlertSeverityDto,
        value: alert.inner_rhTopBottom_diff?.toString(),
      },
    ];
    for (const f of pistonsFields) {
      if (f.severity === 'YELLOW' || f.severity === 'RED') {
        alerts.push({
          field: f.field,
          fieldLabel: f.label,
          value: f.value || '',
          severity: f.severity,
        });
        alertCount++;
        if (f.severity === 'RED') sectionSeverity = 'RED';
        else if (f.severity === 'YELLOW' && sectionSeverity !== 'RED') sectionSeverity = 'YELLOW';
      }
    }
    if (alerts.length > 0) {
      sections.push({
        sectionKey: 'PISTONS',
        sectionName: 'Pistons',
        severity: sectionSeverity,
        alerts,
      });
      updateHighestSeverity(sectionSeverity);
    }
  }

  if (
    service.alertCounterbalanceCylinderAirbag &&
    service.alertCounterbalanceCylinderAirbag.length > 0
  ) {
    const alerts: AlertDetailDto[] = [];
    for (const alert of service.alertCounterbalanceCylinderAirbag) {
      alerts.push({
        field: alert.fieldName,
        fieldLabel: alert.fieldName.replace(/_/g, ' '),
        value: alert.justification,
        severity: 'RED',
      });
      alertCount++;
    }
    if (alerts.length > 0) {
      sections.push({
        sectionKey: 'COUNTERBALANCE_CYLINDER',
        sectionName: 'Counterbalance Cylinder / Airbag',
        severity: 'RED',
        alerts,
      });
      updateHighestSeverity('RED');
    }
  }

  if (service.alertTramming && service.alertTramming.length > 0) {
    const alert = service.alertTramming[0];
    const alerts: AlertDetailDto[] = [];
    let sectionSeverity: AlertSeverityDto = 'NONE';
    const trammingFields = [
      {
        field: 'outer_top_vertical',
        label: 'Top Vertical (Outer)',
        severity: alert.outer_top_verticalSeverity as AlertSeverityDto,
        value: alert.outer_top_verticalSum?.toString() || '0',
      },
      {
        field: 'outer_top_horizontal',
        label: 'Top Horizontal (Outer)',
        severity: alert.outer_top_horizontalSeverity as AlertSeverityDto,
        value: alert.outer_top_horizontalSum?.toString() || '0',
      },
      {
        field: 'outer_bottom_vertical',
        label: 'Bottom Vertical (Outer)',
        severity: alert.outer_bottom_verticalSeverity as AlertSeverityDto,
        value: alert.outer_bottom_verticalSum?.toString() || '0',
      },
      {
        field: 'outer_bottom_horizontal',
        label: 'Bottom Horizontal (Outer)',
        severity: alert.outer_bottom_horizontalSeverity as AlertSeverityDto,
        value: alert.outer_bottom_horizontalSum?.toString() || '0',
      },
      {
        field: 'outer_left_vertical',
        label: 'Left Vertical (Outer)',
        severity: alert.outer_left_verticalSeverity as AlertSeverityDto,
        value: alert.outer_left_verticalSum?.toString() || '0',
      },
      {
        field: 'outer_left_horizontal',
        label: 'Left Horizontal (Outer)',
        severity: alert.outer_left_horizontalSeverity as AlertSeverityDto,
        value: alert.outer_left_horizontalSum?.toString() || '0',
      },
      {
        field: 'outer_right_vertical',
        label: 'Right Vertical (Outer)',
        severity: alert.outer_right_verticalSeverity as AlertSeverityDto,
        value: alert.outer_right_verticalSum?.toString() || '0',
      },
      {
        field: 'outer_right_horizontal',
        label: 'Right Horizontal (Outer)',
        severity: alert.outer_right_horizontalSeverity as AlertSeverityDto,
        value: alert.outer_right_horizontalSum?.toString() || '0',
      },
      {
        field: 'inner_top_vertical',
        label: 'Top Vertical (Inner)',
        severity: alert.inner_top_verticalSeverity as AlertSeverityDto,
        value: alert.inner_top_verticalSum?.toString() || '0',
      },
      {
        field: 'inner_top_horizontal',
        label: 'Top Horizontal (Inner)',
        severity: alert.inner_top_horizontalSeverity as AlertSeverityDto,
        value: alert.inner_top_horizontalSum?.toString() || '0',
      },
      {
        field: 'inner_bottom_vertical',
        label: 'Bottom Vertical (Inner)',
        severity: alert.inner_bottom_verticalSeverity as AlertSeverityDto,
        value: alert.inner_bottom_verticalSum?.toString() || '0',
      },
      {
        field: 'inner_bottom_horizontal',
        label: 'Bottom Horizontal (Inner)',
        severity: alert.inner_bottom_horizontalSeverity as AlertSeverityDto,
        value: alert.inner_bottom_horizontalSum?.toString() || '0',
      },
      {
        field: 'inner_left_vertical',
        label: 'Left Vertical (Inner)',
        severity: alert.inner_left_verticalSeverity as AlertSeverityDto,
        value: alert.inner_left_verticalSum?.toString() || '0',
      },
      {
        field: 'inner_left_horizontal',
        label: 'Left Horizontal (Inner)',
        severity: alert.inner_left_horizontalSeverity as AlertSeverityDto,
        value: alert.inner_left_horizontalSum?.toString() || '0',
      },
      {
        field: 'inner_right_vertical',
        label: 'Right Vertical (Inner)',
        severity: alert.inner_right_verticalSeverity as AlertSeverityDto,
        value: alert.inner_right_verticalSum?.toString() || '0',
      },
      {
        field: 'inner_right_horizontal',
        label: 'Right Horizontal (Inner)',
        severity: alert.inner_right_horizontalSeverity as AlertSeverityDto,
        value: alert.inner_right_horizontalSum?.toString() || '0',
      },
    ];
    for (const f of trammingFields) {
      if (f.severity === 'YELLOW' || f.severity === 'RED') {
        alerts.push({ field: f.field, fieldLabel: f.label, value: f.value, severity: f.severity });
        alertCount++;
        if (f.severity === 'RED') sectionSeverity = 'RED';
        else if (f.severity === 'YELLOW' && sectionSeverity !== 'RED') sectionSeverity = 'YELLOW';
      }
    }
    if (alerts.length > 0) {
      sections.push({
        sectionKey: 'TRAMMING',
        sectionName: 'Tramming',
        severity: sectionSeverity,
        alerts,
      });
      updateHighestSeverity(sectionSeverity);
    }
  }

  return {
    hasAlerts: alertCount > 0,
    alertCount,
    highestSeverity,
    sections,
  };
}
