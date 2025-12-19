import { PrismaClient } from '@prisma/client';
import { CompleteServiceDto } from '@titans-tech/shared/backend-dtos';
import { validateServicePermissionByServiceId, ServicePermission } from './permission-validator';
import { completeServiceStatus } from './service';
import {
  generateBearingClearanceAlerts,
  generateBearingClearanceSingleHammerAlerts,
  generateClutchAlerts,
  generateSlideSingleHammerAlerts,
  generateSlideDoubleHammerAlerts,
  generateGibsAlerts,
  generatePistonsAlerts,
  generateTrammingAlerts,
} from './alert-generators';

export interface CompleteServiceResult {
  isValid: boolean;
  error?: {
    code: 'NOT_FOUND' | 'BAD_REQUEST' | 'FORBIDDEN';
    message: string;
  };
  service?: any;
}

/**
 * Completes a service after validating permissions and that all selected sections are completed
 * Generates alerts for all completed sections internally
 */
export async function completeServiceWithValidation(
  prisma: PrismaClient,
  serviceId: string,
  userId: string | null,
  permission: ServicePermission,
  completeDto: CompleteServiceDto,
): Promise<CompleteServiceResult> {
  // Validate permissions first
  const permissionResult = await validateServicePermissionByServiceId(
    prisma,
    userId,
    serviceId,
    permission,
  );

  if (!permissionResult.isValid) {
    return permissionResult;
  }

  const service = await (prisma as any).machineService.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    return {
      isValid: false,
      error: {
        code: 'NOT_FOUND',
        message: `Service with ID ${serviceId} not found`,
      },
    };
  }

  // Check if all selected sections are completed
  const selectedSections = Array.isArray(service.selectedSections) ? service.selectedSections : [];
  const completedSections = Array.isArray(service.completedSections)
    ? service.completedSections
    : [];

  if (selectedSections.length > 0) {
    const missingSections = (selectedSections as string[]).filter(
      (section) => !(completedSections as string[]).includes(section),
    );

    if (missingSections.length > 0) {
      return {
        isValid: false,
        error: {
          code: 'BAD_REQUEST',
          message: `Cannot complete service. The following sections are not completed: ${missingSections.join(', ')}`,
        },
      };
    }
  }

  // Update service status to completed
  const updatedService = await completeServiceStatus(prisma, serviceId, {
    status: completeDto.status,
    completedBy: completeDto.completedBy,
  });

  // Generate alerts for all completed sections (fire and forget)
  const completedSectionsList = updatedService.completedSections as string[];
  generateAlertsForSections(prisma, serviceId, completedSectionsList);

  return {
    isValid: true,
    service: updatedService,
  };
}

/**
 * Generates alerts for all completed sections
 * Each alert generation is fire-and-forget (errors are caught and logged)
 */
function generateAlertsForSections(
  prisma: PrismaClient,
  serviceId: string,
  completedSectionsList: string[],
): void {
  if (completedSectionsList.includes('BEARING_CLEARANCE')) {
    generateBearingClearanceAlerts(prisma, serviceId).catch(() => {});
  }

  if (completedSectionsList.includes('BEARING_CLEARANCE_SINGLE_HAMMER')) {
    generateBearingClearanceSingleHammerAlerts(prisma, serviceId).catch(() => {});
  }

  if (completedSectionsList.includes('CLUTCH')) {
    generateClutchAlerts(prisma, serviceId).catch(() => {});
  }

  if (completedSectionsList.includes('SLIDE_SINGLE_HAMMER')) {
    generateSlideSingleHammerAlerts(prisma, serviceId).catch(() => {});
  }

  if (completedSectionsList.includes('SLIDE_DOUBLE_HAMMER')) {
    generateSlideDoubleHammerAlerts(prisma, serviceId).catch(() => {});
  }

  if (completedSectionsList.includes('GIBS')) {
    generateGibsAlerts(prisma, serviceId).catch(() => {});
  }

  if (completedSectionsList.includes('PISTONS')) {
    generatePistonsAlerts(prisma, serviceId).catch(() => {});
  }

  if (completedSectionsList.includes('TRAMMING')) {
    generateTrammingAlerts(prisma, serviceId).catch(() => {});
  }
}
