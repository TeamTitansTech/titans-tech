import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Headers,
} from '@nestjs/common';
import { Request } from 'express';
import { UAParser } from 'ua-parser-js';
import { ServiceRequestsService } from './service-requests.service';
import { isValidEmail } from '../../common/validators';
import { Authenticated, CompanyManager, Public } from '../auth/auth.decorators';
import type { ReqWithAuthUser } from '../../types/request';
import { isRegularUser, isSysAdmin } from '../../types/request';
import { ServiceRequestStatus } from '@titans-tech/db';

@Controller('service-requests')
export class ServiceRequestsController {
  constructor(
    private readonly serviceRequestsService: ServiceRequestsService,
  ) {}

  /**
   * Create a public service request (no authentication required)
   * This is called from the QR code public page
   */
  @Post('public')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async createPublicServiceRequest(
    @Req() req: Request,
    @Body()
    body: {
      machineId: string;
      requesterName: string;
      requesterEmail: string;
      requesterPhone?: string;
      problemDescription: string;
      imageUrl?: string;
    },
    @Headers('user-agent') userAgent?: string,
  ): Promise<{ success: boolean; serviceRequestId: string }> {
    // Validate required fields
    if (!body.machineId || body.machineId.trim().length === 0) {
      throw new BadRequestException('Machine ID is required');
    }
    if (!body.requesterName || body.requesterName.trim().length === 0) {
      throw new BadRequestException('Requester name is required');
    }
    if (!body.requesterEmail || body.requesterEmail.trim().length === 0) {
      throw new BadRequestException('Requester email is required');
    }
    if (
      !body.problemDescription ||
      body.problemDescription.trim().length === 0
    ) {
      throw new BadRequestException('Problem description is required');
    }

    // Basic email validation
    if (!isValidEmail(body.requesterEmail)) {
      throw new BadRequestException('Invalid email format');
    }

    // Get IP address (handle proxies)
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket?.remoteAddress ||
      'unknown';

    // Parse user agent for device info
    const deviceInfo = this.parseUserAgent(userAgent || '');

    return this.serviceRequestsService.create(
      {
        machineId: body.machineId.trim(),
        requesterName: body.requesterName.trim(),
        requesterEmail: body.requesterEmail.trim().toLowerCase(),
        requesterPhone: body.requesterPhone?.trim() || undefined,
        problemDescription: body.problemDescription.trim(),
        imageUrl: body.imageUrl?.trim() || undefined,
      },
      {
        ipAddress,
        userAgent: userAgent || 'unknown',
        ...deviceInfo,
      },
    );
  }

  /**
   * Get all service requests (admin endpoint)
   */
  @Get()
  @CompanyManager()
  async findAll(
    @Req() req: ReqWithAuthUser,
    @Query('status') status?: string,
    @Query('machineId') machineId?: string,
    @Query('limit') limit?: string,
  ) {
    const companyId = isRegularUser(req.user) ? req.user.companyId : undefined;

    return this.serviceRequestsService.findAll({
      status: status as ServiceRequestStatus | undefined,
      machineId,
      companyId: isSysAdmin(req.user) ? undefined : companyId,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  /**
   * Get service requests for a specific machine
   */
  @Get('machine/:machineId')
  @Authenticated()
  async findByMachine(@Param('machineId') machineId: string) {
    return this.serviceRequestsService.findByMachine(machineId);
  }

  /**
   * Get a single service request by ID
   */
  @Get(':id')
  @Authenticated()
  async findOne(@Param('id') id: string) {
    return this.serviceRequestsService.findOne(id);
  }

  /**
   * Close a service request
   */
  @Patch(':id/close')
  @CompanyManager()
  @HttpCode(HttpStatus.OK)
  async close(@Param('id') id: string) {
    return this.serviceRequestsService.close(id);
  }

  /**
   * Reopen a closed service request
   */
  @Patch(':id/reopen')
  @CompanyManager()
  @HttpCode(HttpStatus.OK)
  async reopen(@Param('id') id: string) {
    return this.serviceRequestsService.reopen(id);
  }

  /**
   * Create a service from a service request
   * This automatically closes the service request
   */
  @Post(':id/create-service')
  @CompanyManager()
  @HttpCode(HttpStatus.CREATED)
  async createServiceFromRequest(
    @Param('id') id: string,
    @Body() body: { performedBy?: string },
  ) {
    return this.serviceRequestsService.createServiceFromRequest(
      id,
      body.performedBy,
    );
  }

  /**
   * Parse user agent string to extract device information
   */
  private parseUserAgent(userAgent: string): {
    browser: string;
    os: string;
    device: string;
    isMobile: boolean;
  } {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    const browser = result.browser.name || 'Unknown';
    const os = result.os.name || 'Unknown';
    const deviceType = result.device.type || 'desktop';

    const isMobile = deviceType === 'mobile' || deviceType === 'tablet';
    let device = 'Desktop';
    if (deviceType === 'mobile') device = 'Mobile';
    else if (deviceType === 'tablet') device = 'Tablet';

    return { browser, os, device, isMobile };
  }
}
