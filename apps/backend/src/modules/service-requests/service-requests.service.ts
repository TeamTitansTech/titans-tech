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
import { ServiceRequestStatus } from '@titans-tech/db';
import { srService } from '@titans-tech/shared/services';

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
    const createResult = await srService.createServiceRequest(
      this.prisma,
      dto,
      deviceInfo,
    );
    if (createResult.error) {
      throw new NotFoundException(createResult.error.message);
    }
    const { id: createdId, machine } = createResult.data!;

    this.logger.log(
      `Created service request ${createdId} for machine ${dto.machineId} from ${dto.requesterEmail}`,
    );

    // Create notification using shared service
    const { recipients } = await srService.createServiceRequestNotification(
      this.prisma,
      createdId,
      dto.machineId,
      machine.name,
      dto.requesterName,
      dto.requesterEmail,
      dto.problemDescription,
    );

    // Broadcast notification via WebSocket
    this.notificationsGateway.handleNewNotification(recipients);

    // Send email notification
    const machineUrl = `${appEnv.FRONTEND_URL}/admin/machines/${dto.machineId}`;

    // Collect all recipient emails (sysadmins, company admins, branch users + test emails)
    const recipientEmails = await srService.getRecipientEmails(
      this.prisma,
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
        `Sent service request email to ${recipientEmails.length} recipients for request ${createdId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send service request email for request ${createdId}`,
        error,
      );
    }

    return {
      success: true,
      serviceRequestId: createdId,
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
    return srService.findAllServiceRequests(this.prisma, filters);
  }

  /**
   * Get service requests for a specific machine
   */
  async findByMachine(machineId: string): Promise<ServiceRequestResponseDto[]> {
    const exists = await srService.machineExists(this.prisma, machineId);
    if (!exists) throw new NotFoundException('Machine not found');
    return srService.findAllServiceRequests(this.prisma, { machineId });
  }

  /**
   * Get a single service request by ID
   */
  async findOne(id: string): Promise<ServiceRequestResponseDto> {
    const res = await srService.findServiceRequest(this.prisma, id);
    if (res.error) throw new NotFoundException(res.error.message);
    return res.data!;
  }

  /**
   * Close a service request
   */
  async close(id: string): Promise<ServiceRequestResponseDto> {
    const res = await srService.closeServiceRequest(this.prisma, id);
    if (res.error) {
      if (res.error.type === 'BAD_REQUEST')
        throw new BadRequestException(res.error.message);
      throw new NotFoundException(res.error.message);
    }
    return this.findOne(id);
  }

  /**
   * Reopen a closed service request
   */
  async reopen(id: string): Promise<ServiceRequestResponseDto> {
    const res = await srService.reopenServiceRequest(this.prisma, id);
    if (res.error) {
      if (res.error.type === 'BAD_REQUEST')
        throw new BadRequestException(res.error.message);
      throw new NotFoundException(res.error.message);
    }
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
    const res = await srService.createServiceFromRequest(
      this.prisma,
      serviceRequestId,
      performedBy,
    );
    if (res.error) throw new NotFoundException(res.error.message);
    const updatedRequest = await this.findOne(serviceRequestId);
    return { serviceId: res.data!.serviceId, serviceRequest: updatedRequest };
  }

  /**
   * Get all email recipients for service request notifications
   * Includes: sysadmins, company admins/managers, branch users
   * Note: Test emails are added centrally in email.service.ts
   */
  // Recipient email resolution moved to shared (srService.getRecipientEmails)
}
