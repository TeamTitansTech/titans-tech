import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { EmailService } from '../email/email.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { appEnv } from '../../config/env';
import {
  NotificationType,
  ServiceRequestStatus,
  ServiceStatus,
  ServiceType,
} from '@titans-tech/db';

export interface CreateServiceRequestDto {
  machineId: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  problemDescription: string;
  imageUrl?: string;
}

export interface DeviceInfo {
  ipAddress: string;
  userAgent: string;
  browser: string;
  os: string;
  device: string;
  isMobile: boolean;
}

export interface ServiceRequestResponseDto {
  id: string;
  machineId: string;
  machineName: string;
  machineSerialNumber: string | null;
  companyName: string;
  branchName: string;
  status: ServiceRequestStatus;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string | null;
  problemDescription: string;
  imageUrl: string | null;
  ipAddress: string | null;
  browser: string | null;
  os: string | null;
  deviceType: string | null;
  isMobile: boolean;
  createdAt: string;
  closedAt: string | null;
  services: Array<{
    id: string;
    date: string;
    type: string;
    status: string;
  }>;
}

@Injectable()
export class ServiceRequestsService {
  private readonly logger = new Logger(ServiceRequestsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  /**
   * Create a new service request from public QR code form
   */
  async create(
    dto: CreateServiceRequestDto,
    deviceInfo: DeviceInfo,
  ): Promise<{ success: boolean; serviceRequestId: string }> {
    const machine = await this.prisma.machine.findUnique({
      where: { id: dto.machineId },
      include: {
        branch: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!machine) {
      throw new NotFoundException('Machine not found');
    }

    // Create the service request
    const serviceRequest = await this.prisma.serviceRequest.create({
      data: {
        machineId: dto.machineId,
        requesterName: dto.requesterName,
        requesterEmail: dto.requesterEmail,
        requesterPhone: dto.requesterPhone || null,
        problemDescription: dto.problemDescription,
        imageUrl: dto.imageUrl || null,
        ipAddress: deviceInfo.ipAddress,
        userAgent: deviceInfo.userAgent,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        deviceType: deviceInfo.device,
        isMobile: deviceInfo.isMobile,
        status: ServiceRequestStatus.OPEN,
      },
    });

    this.logger.log(
      `Created service request ${serviceRequest.id} for machine ${dto.machineId} from ${dto.requesterEmail}`,
    );

    // Get sysadmins to create recipients
    const admins = await this.prisma.sysAdmin.findMany({
      select: { id: true },
    });

    // Create notification with recipients (new structure without machine relation)
    const notification = await this.prisma.notification.create({
      data: {
        type: NotificationType.URGENT_SERVICE_REQUEST,
        createdByUserId: null,
        metadata: {
          type: NotificationType.URGENT_SERVICE_REQUEST,
          machineId: dto.machineId,
          machineName: machine.name,
          requestedByUserId: null,
          requestedByName: dto.requesterName,
          notes: dto.problemDescription,
          serviceRequestId: serviceRequest.id,
          requesterEmail: dto.requesterEmail,
          isPublicRequest: true,
        },
        recipients: {
          createMany: {
            data: admins.map((admin) => ({
              recipientId: admin.id,
            })),
          },
        },
      },
    });

    // Broadcast notification via WebSocket
    const recipients = await this.prisma.notificationRecipient.findMany({
      include: { notification: true },
      where: { notificationId: notification.id },
    });
    this.notificationsGateway.handleNewNotification(recipients);

    // Send email notification
    const machineUrl = `${appEnv.FRONTEND_URL}/admin/machines/${dto.machineId}`;

    // Collect all recipient emails (sysadmins, company admins, branch users + test emails)
    const recipientEmails = await this.getServiceRequestRecipientEmails(
      machine.branch.companyId,
      machine.branchId,
    );

    // Send emails to all recipients
    const emailData = {
      machineName: machine.name,
      machineSerialNumber: machine.serialNumber,
      companyName: machine.branch.company.name,
      branchName: machine.branch.name,
      requesterName: dto.requesterName,
      requesterEmail: dto.requesterEmail,
      requesterPhone: dto.requesterPhone || null,
      problemDescription: dto.problemDescription,
      imageUrl: dto.imageUrl || null,
      machineUrl,
      deviceInfo: {
        ipAddress: deviceInfo.ipAddress,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        device: deviceInfo.device,
        isMobile: deviceInfo.isMobile,
      },
    };

    try {
      await this.emailService.sendPublicServiceRequestEmail(
        recipientEmails,
        emailData,
        dto.machineId,
      );

      this.logger.log(
        `Sent service request email to ${recipientEmails.length} recipients for request ${serviceRequest.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send service request email for request ${serviceRequest.id}`,
        error,
      );
    }

    return {
      success: true,
      serviceRequestId: serviceRequest.id,
    };
  }

  /**
   * Get all service requests (admin endpoint)
   */
  async findAll(filters?: {
    status?: ServiceRequestStatus;
    machineId?: string;
    companyId?: string;
    limit?: number;
  }): Promise<ServiceRequestResponseDto[]> {
    const requests = await this.prisma.serviceRequest.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.machineId && { machineId: filters.machineId }),
        ...(filters?.companyId && {
          machine: { branch: { companyId: filters.companyId } },
        }),
      },
      include: {
        machine: {
          include: {
            branch: {
              include: {
                company: true,
              },
            },
          },
        },
        services: {
          select: {
            id: true,
            date: true,
            type: true,
            status: true,
          },
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 100,
    });

    return requests.map((req) => ({
      id: req.id,
      machineId: req.machineId,
      machineName: req.machine.name,
      machineSerialNumber: req.machine.serialNumber,
      companyName: req.machine.branch.company.name,
      branchName: req.machine.branch.name,
      status: req.status,
      requesterName: req.requesterName,
      requesterEmail: req.requesterEmail,
      requesterPhone: req.requesterPhone,
      problemDescription: req.problemDescription,
      imageUrl: req.imageUrl,
      ipAddress: req.ipAddress,
      browser: req.browser,
      os: req.os,
      deviceType: req.deviceType,
      isMobile: req.isMobile,
      createdAt: req.createdAt.toISOString(),
      closedAt: req.closedAt?.toISOString() || null,
      services: req.services.map((s) => ({
        id: s.id,
        date: s.date.toISOString(),
        type: s.type,
        status: s.status,
      })),
    }));
  }

  /**
   * Get service requests for a specific machine
   */
  async findByMachine(machineId: string): Promise<ServiceRequestResponseDto[]> {
    const machine = await this.prisma.machine.findUnique({
      where: { id: machineId },
    });

    if (!machine) {
      throw new NotFoundException('Machine not found');
    }

    return this.findAll({ machineId });
  }

  /**
   * Get a single service request by ID
   */
  async findOne(id: string): Promise<ServiceRequestResponseDto> {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        machine: {
          include: {
            branch: {
              include: {
                company: true,
              },
            },
          },
        },
        services: {
          select: {
            id: true,
            date: true,
            type: true,
            status: true,
          },
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Service request not found');
    }

    return {
      id: request.id,
      machineId: request.machineId,
      machineName: request.machine.name,
      machineSerialNumber: request.machine.serialNumber,
      companyName: request.machine.branch.company.name,
      branchName: request.machine.branch.name,
      status: request.status,
      requesterName: request.requesterName,
      requesterEmail: request.requesterEmail,
      requesterPhone: request.requesterPhone,
      problemDescription: request.problemDescription,
      imageUrl: request.imageUrl,
      ipAddress: request.ipAddress,
      browser: request.browser,
      os: request.os,
      deviceType: request.deviceType,
      isMobile: request.isMobile,
      createdAt: request.createdAt.toISOString(),
      closedAt: request.closedAt?.toISOString() || null,
      services: request.services.map((s) => ({
        id: s.id,
        date: s.date.toISOString(),
        type: s.type,
        status: s.status,
      })),
    };
  }

  /**
   * Close a service request
   */
  async close(id: string): Promise<ServiceRequestResponseDto> {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Service request not found');
    }

    if (request.status === ServiceRequestStatus.CLOSED) {
      throw new BadRequestException('Service request is already closed');
    }

    await this.prisma.serviceRequest.update({
      where: { id },
      data: {
        status: ServiceRequestStatus.CLOSED,
        closedAt: new Date(),
      },
    });

    return this.findOne(id);
  }

  /**
   * Reopen a closed service request
   */
  async reopen(id: string): Promise<ServiceRequestResponseDto> {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Service request not found');
    }

    if (request.status === ServiceRequestStatus.OPEN) {
      throw new BadRequestException('Service request is already open');
    }

    await this.prisma.serviceRequest.update({
      where: { id },
      data: {
        status: ServiceRequestStatus.OPEN,
        closedAt: null,
      },
    });

    return this.findOne(id);
  }

  /**
   * Create a service from a service request
   * This automatically closes the service request
   */
  async createServiceFromRequest(
    serviceRequestId: string,
    performedBy?: string,
  ): Promise<{ serviceId: string; serviceRequest: ServiceRequestResponseDto }> {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id: serviceRequestId },
      include: {
        machine: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Service request not found');
    }

    // Create the service linked to the request
    const service = await this.prisma.machineService.create({
      data: {
        machineId: request.machineId,
        serviceRequestId: serviceRequestId,
        date: new Date(),
        type: ServiceType.MAINTENANCE,
        status: ServiceStatus.PENDING,
        performedBy: performedBy || null,
        notes: `[Created from Service Request]\nRequester: ${request.requesterName} (${request.requesterEmail})\n${request.requesterPhone ? `Phone: ${request.requesterPhone}\n` : ''}\nProblem Description:\n${request.problemDescription}`,
      },
    });

    // Close the service request
    await this.prisma.serviceRequest.update({
      where: { id: serviceRequestId },
      data: {
        status: ServiceRequestStatus.CLOSED,
        closedAt: new Date(),
      },
    });

    this.logger.log(
      `Created service ${service.id} from request ${serviceRequestId}`,
    );

    const updatedRequest = await this.findOne(serviceRequestId);

    return {
      serviceId: service.id,
      serviceRequest: updatedRequest,
    };
  }

  /**
   * Get all email recipients for service request notifications
   * Includes: sysadmins, company admins/managers, branch users
   * Note: Test emails are added centrally in email.service.ts
   */
  private async getServiceRequestRecipientEmails(
    companyId: string,
    branchId: string,
  ): Promise<string[]> {
    const emails = new Set<string>();

    // 1. Get all sysadmin emails
    const sysAdmins = await this.prisma.sysAdmin.findMany({
      select: { email: true },
    });
    sysAdmins.forEach((admin) => emails.add(admin.email.toLowerCase()));

    // 2. Get company admins
    const companyAdmins = await this.prisma.user.findMany({
      where: {
        companyId,
        isCompanyAdmin: true,
      },
      select: { email: true },
    });
    companyAdmins.forEach((user) => emails.add(user.email.toLowerCase()));

    // 3. Get users with access to this branch
    const branchUsers = await this.prisma.userBranch.findMany({
      where: { branchId },
      include: {
        user: {
          select: { email: true },
        },
      },
    });
    branchUsers.forEach((ub) => emails.add(ub.user.email.toLowerCase()));

    this.logger.log(
      `Found ${emails.size} recipients for service request notification: ${Array.from(emails).join(', ')}`,
    );

    return Array.from(emails);
  }
}
