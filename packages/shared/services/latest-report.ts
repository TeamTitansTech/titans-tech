import { PrismaClient } from '@prisma/client';
import * as serviceHelpers from './service';
import { OIL_CHANGE_INTERVAL_DAYS, OIL_CHANGE_WARNING_THRESHOLD_DAYS } from './constants';
import {
  getAlertByService,
  getClutchAlertByService,
  getSlideSingleHammerAlertByService,
  getSlideDoubleHammerAlertByService,
  getGibsAlertByService,
  getPistonsAlertByService,
  getTrammingAlertsByService,
  getCounterbalanceAlertsForService,
} from './alert-fetchers';

/**
 * Safe alert fetcher that wraps alert service calls with try-catch
 */
async function safeAlertFetch<T>(fetcher: () => Promise<T>): Promise<T | undefined> {
  try {
    return await fetcher();
  } catch {
    return undefined;
  }
}

export async function getLatestMachineReport(
  prisma: PrismaClient,
  machineId: string,
): Promise<any> {
  // Use default oil change config
  const oilChangeConfig = {
    intervalDays: OIL_CHANGE_INTERVAL_DAYS,
    warningThresholdDays: OIL_CHANGE_WARNING_THRESHOLD_DAYS,
  };

  // Fetch machine with blueprint
  const machine = await serviceHelpers.getMachineWithBlueprint(prisma, machineId);

  if (!machine) {
    return null;
  }

  // Fetch only COMPLETED services for this machine
  const services: any[] = await serviceHelpers.findCompletedServicesByMachine(prisma, machineId);

  const report: any = {
    machineId: machine.id,
    machineName: machine.name,
    blueprint: {
      id: machine.blueprint.id,
      name: machine.blueprint.name,
      sections: machine.blueprint.sections,
    },
    generatedAt: new Date(),
    sections: {},
  };

  // Process BearingClearance section
  if (machine.blueprint.sections.includes('BEARING_CLEARANCE')) {
    const latestService = services.find((s) => s.bearingClearance && s.bearingClearance.length > 0);

    if (latestService) {
      const record = latestService.bearingClearance[0];
      const outerData = record.outerData;
      const innerData = record.innerData;

      if (outerData || innerData) {
        const alert = await safeAlertFetch(() => getAlertByService(prisma, latestService.id));

        report.sections.BEARING_CLEARANCE = {
          latestServiceId: latestService.id,
          latestServiceDate: latestService.date,
          serviceType: latestService.type,
          outerData: outerData || undefined,
          innerData: innerData || undefined,
          alert: alert || undefined,
        };
      }
    }
  }

  // Process Clutch section
  if (machine.blueprint.sections.includes('CLUTCH')) {
    const latestService = services.find((s) => s.clutch && s.clutch.length > 0);

    if (latestService) {
      const measurements = latestService.clutch[0].data;

      if (measurements) {
        const alert = await safeAlertFetch(() => getClutchAlertByService(prisma, latestService.id));

        report.sections.CLUTCH = {
          latestServiceId: latestService.id,
          latestServiceDate: latestService.date,
          serviceType: latestService.type,
          data: measurements,
          alert: alert || undefined,
        };
      }
    }
  }

  // Process Slide Single Hammer section
  if (machine.blueprint.sections.includes('SLIDE_SINGLE_HAMMER')) {
    const latestService = services.find(
      (s) => s.slideSingleHammer && s.slideSingleHammer.length > 0,
    );

    if (latestService) {
      const record = latestService.slideSingleHammer[0];

      if (record) {
        const alert = await safeAlertFetch(() =>
          getSlideSingleHammerAlertByService(prisma, latestService.id),
        );

        report.sections.SLIDE_SINGLE_HAMMER = {
          latestServiceId: latestService.id,
          latestServiceDate: latestService.date,
          serviceType: latestService.type,
          data: {
            beforeData: record.beforeData,
            data: record.data,
          },
          alert: alert || undefined,
        };
      }
    }
  }

  // Process Slide Double Hammer section
  if (machine.blueprint.sections.includes('SLIDE_DOUBLE_HAMMER')) {
    const latestService = services.find(
      (s) => s.slideDoubleHammer && s.slideDoubleHammer.length > 0,
    );

    if (latestService) {
      const record = latestService.slideDoubleHammer[0];

      if (record) {
        const alert = await safeAlertFetch(() =>
          getSlideDoubleHammerAlertByService(prisma, latestService.id),
        );

        report.sections.SLIDE_DOUBLE_HAMMER = {
          latestServiceId: latestService.id,
          latestServiceDate: latestService.date,
          serviceType: latestService.type,
          data: {
            outerBefore: record.outerBefore,
            outerData: record.outerData,
            innerBefore: record.innerBefore,
            innerData: record.innerData,
          },
          alert: alert || undefined,
        };
      }
    }
  }

  // Process GIBS section
  if (machine.blueprint.sections.includes('GIBS')) {
    const latestService = services.find((s) => s.gibs && s.gibs.length > 0);

    if (latestService) {
      const record = latestService.gibs[0];

      if (record && record.outerData) {
        const alert = await safeAlertFetch(() => getGibsAlertByService(prisma, latestService.id));

        report.sections.GIBS = {
          latestServiceId: latestService.id,
          latestServiceDate: latestService.date,
          serviceType: latestService.type,
          data: record.outerData,
          alert: alert || undefined,
        };
      }
    }
  }

  // Process Lubrication & Hydraulics section
  if (machine.blueprint.sections.includes('LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER')) {
    const latestService = services.find(
      (s) =>
        s.lubricationHydraulics &&
        s.lubricationHydraulics.length > 0 &&
        s.lubricationHydraulics[0].data,
    );

    if (latestService) {
      const record = latestService.lubricationHydraulics[0];

      if (record && record.data) {
        let oilChangeAlert: any = {
          lastOilChangeDate: null,
          daysSinceChange: null,
          daysUntilDue: null,
          severity: 'NONE',
        };

        if (oilChangeConfig) {
          // Search all services for last oil change
          for (const service of services) {
            const lubData = service.lubricationHydraulics?.[0]?.data;
            if (lubData?.changedOil === 'YES') {
              const changeDate = new Date(service.date);
              const today = new Date();
              const daysSinceChange = Math.floor(
                (today.getTime() - changeDate.getTime()) / (1000 * 60 * 60 * 24),
              );
              const daysUntilDue = oilChangeConfig.intervalDays - daysSinceChange;

              let severity: 'NONE' | 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
              if (daysUntilDue < 0) {
                severity = 'RED';
              } else if (daysUntilDue <= oilChangeConfig.warningThresholdDays) {
                severity = 'YELLOW';
              }

              oilChangeAlert = {
                lastOilChangeDate: changeDate,
                daysSinceChange,
                daysUntilDue,
                severity,
              };
              break;
            }
          }
        }

        report.sections.LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER = {
          latestServiceId: latestService.id,
          latestServiceDate: latestService.date,
          serviceType: latestService.type,
          data: {
            ...record.data,
            gauges: record.data.gauges || [],
          },
          alert: oilChangeAlert.severity !== 'NONE' ? oilChangeAlert : undefined,
        };
      }
    }
  }

  // Process Counterbalance Cylinder/Airbag section
  if (machine.blueprint.sections.includes('COUNTERBALANCE_CYLINDER_AIRBAG')) {
    const latestService = services.find(
      (s) => s.counterbalanceCylinderAirbag && s.counterbalanceCylinderAirbag.length > 0,
    );

    if (latestService) {
      const record = latestService.counterbalanceCylinderAirbag[0];

      if (record) {
        const alerts = await safeAlertFetch(() =>
          getCounterbalanceAlertsForService(prisma, latestService.id),
        );

        report.sections.COUNTERBALANCE_CYLINDER_AIRBAG = {
          latestServiceId: latestService.id,
          latestServiceDate: latestService.date,
          serviceType: latestService.type,
          data: {
            outerData: record.outerData || undefined,
            innerData: record.innerData || undefined,
            notes: record.notes || undefined,
          },
          alerts: alerts && alerts.length > 0 ? alerts : undefined,
        };
      }
    }
  }

  // Process Pistons section
  if (machine.blueprint.sections.includes('PISTONS')) {
    const latestService = services.find((s) => s.pistons && s.pistons.length > 0);

    if (latestService) {
      const record = latestService.pistons[0];
      const outerData = record.outerData;
      const innerData = record.innerData;

      if (outerData || innerData) {
        const alert = await safeAlertFetch(() =>
          getPistonsAlertByService(prisma, latestService.id),
        );

        report.sections.PISTONS = {
          latestServiceId: latestService.id,
          latestServiceDate: latestService.date,
          serviceType: latestService.type,
          data: {
            guideSeals: record.guideSeals,
            pistonSeals: record.pistonSeals,
            vacuumSystem: record.vacuumSystem,
            vacuumSystemAirPressureSetting: record.vacuumSystemAirPressureSetting,
            outerData: outerData || undefined,
            innerData: innerData || undefined,
            notes: record.notes,
          },
          alert: alert || undefined,
        };
      }
    }
  }

  // Process Tramming section
  if (machine.blueprint.sections.includes('TRAMMING')) {
    const latestService = services.find((s) => s.tramming && s.tramming.length > 0);

    if (latestService) {
      const record = latestService.tramming[0];

      if (record) {
        const alert = await safeAlertFetch(() =>
          getTrammingAlertsByService(prisma, latestService.id),
        );

        report.sections.TRAMMING = {
          latestServiceId: latestService.id,
          latestServiceDate: latestService.date,
          serviceType: latestService.type,
          data: {
            outerData: record.outerData || undefined,
            innerData: record.innerData || undefined,
          },
          alert: alert || undefined,
        };
      }
    }
  }

  return report;
}
