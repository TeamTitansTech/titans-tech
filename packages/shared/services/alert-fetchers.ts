import { PrismaClient } from '@prisma/client';

/**
 * Alert fetcher functions used by getLatestMachineReport
 * These functions query existing alerts from the database
 */

/**
 * Get bearing clearance alert for a service
 */
export async function getAlertByService(
  prisma: PrismaClient,
  machineServiceId: string,
): Promise<any | null> {
  const alert = await (prisma as any).alertBearingClearance.findFirst({
    where: { machineServiceId },
    orderBy: { createdAt: 'desc' },
    include: {
      machineService: {
        include: {
          bearingClearance: {
            include: {
              outerData: true,
              innerData: true,
            },
          },
        },
      },
    },
  });

  if (!alert) {
    return null;
  }

  const bearingData =
    alert.machineService.bearingClearance[0]?.outerData ||
    alert.machineService.bearingClearance[0]?.innerData;

  if (!bearingData) {
    return null;
  }

  return {
    ...alert,
    bearingData,
  };
}

/**
 * Get clutch alert for a service
 */
export async function getClutchAlertByService(
  prisma: PrismaClient,
  machineServiceId: string,
): Promise<any | null> {
  const alert = await (prisma as any).alertClutch.findFirst({
    where: { machineServiceId },
    orderBy: { createdAt: 'desc' },
    include: {
      machineService: {
        include: {
          clutch: {
            include: {
              data: true,
            },
          },
        },
      },
    },
  });

  if (!alert) {
    return null;
  }

  const clutchData = alert.machineService.clutch[0]?.data;

  if (!clutchData) {
    return null;
  }

  return {
    ...alert,
    clutchData,
  };
}

/**
 * Get slide single hammer alert for a service
 */
export async function getSlideSingleHammerAlertByService(
  prisma: PrismaClient,
  machineServiceId: string,
): Promise<any | null> {
  const alert = await (prisma as any).alertSlideSingleHammer.findFirst({
    where: { machineServiceId },
    orderBy: { createdAt: 'desc' },
    include: {
      machineService: {
        include: {
          slideSingleHammer: {
            include: {
              data: true,
            },
          },
        },
      },
    },
  });

  if (!alert) {
    return null;
  }

  const slideData = alert.machineService.slideSingleHammer[0]?.data;

  if (!slideData) {
    return null;
  }

  return {
    ...alert,
    slideData,
  };
}

/**
 * Get slide double hammer alert for a service
 */
export async function getSlideDoubleHammerAlertByService(
  prisma: PrismaClient,
  machineServiceId: string,
): Promise<any | null> {
  const alert = await (prisma as any).alertSlideDoubleHammer.findFirst({
    where: { machineServiceId },
    orderBy: { createdAt: 'desc' },
    include: {
      machineService: {
        include: {
          slideDoubleHammer: {
            include: {
              outerData: true,
              innerData: true,
            },
          },
        },
      },
    },
  });

  if (!alert) {
    return null;
  }

  const slideData = alert.machineService.slideDoubleHammer[0];

  if (!slideData) {
    return null;
  }

  return {
    ...alert,
    slideData: {
      outer: slideData.outerData,
      inner: slideData.innerData,
    },
  };
}

/**
 * Get gibs alert for a service
 */
export async function getGibsAlertByService(
  prisma: PrismaClient,
  machineServiceId: string,
): Promise<any | null> {
  const alert = await (prisma as any).alertGibs.findFirst({
    where: { machineServiceId },
    orderBy: { createdAt: 'desc' },
    include: {
      machineService: {
        include: {
          gibs: {
            include: {
              outerData: true,
            },
          },
        },
      },
    },
  });

  if (!alert) {
    return null;
  }

  const gibsData = alert.machineService.gibs[0]?.outerData;

  if (!gibsData) {
    return null;
  }

  return {
    ...alert,
    gibsData,
  };
}

/**
 * Get pistons alert for a service
 */
export async function getPistonsAlertByService(
  prisma: PrismaClient,
  machineServiceId: string,
): Promise<any | null> {
  const alert = await (prisma as any).alertPistons.findFirst({
    where: { machineServiceId },
    orderBy: { createdAt: 'desc' },
    include: {
      machineService: {
        include: {
          pistons: {
            include: {
              outerData: true,
              innerData: true,
            },
          },
        },
      },
    },
  });

  if (!alert) {
    return null;
  }

  return alert;
}

/**
 * Get tramming alerts for a service
 */
export async function getTrammingAlertsByService(
  prisma: PrismaClient,
  machineServiceId: string,
): Promise<any | null> {
  const alerts = await (prisma as any).alertTramming.findMany({
    where: { machineServiceId },
    orderBy: { createdAt: 'desc' },
  });

  if (alerts.length === 0) {
    return null;
  }

  return alerts[0];
}

/**
 * Get counterbalance cylinder airbag alerts for a service
 */
export async function getCounterbalanceAlertsForService(
  prisma: PrismaClient,
  machineServiceId: string,
): Promise<any[]> {
  const alerts = await (prisma as any).alertCounterbalanceCylinderAirbag.findMany({
    where: { machineServiceId },
    orderBy: { createdAt: 'desc' },
  });

  return alerts;
}
