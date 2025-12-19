import {
  NotificationType,
  PrismaClient,
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

export async function createServiceRequest(
  prisma: PrismaClient,
  dto: CreateServiceRequestDto,
  deviceInfo: DeviceInfo,
): Promise<{ data?: { id: string; machine: any }; error?: { type: string; message: string } }> {
  const machine = await prisma.machine.findUnique({
    where: { id: dto.machineId },
    include: { branch: { include: { company: true } } },
  });
  if (!machine) {
    return { error: { type: 'NOT_FOUND', message: 'Machine not found' } };
  }

  const serviceRequest = await prisma.serviceRequest.create({
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

  return { data: { id: serviceRequest.id, machine } };
}

export async function getRecipientEmails(
  prisma: PrismaClient,
  companyId: string,
  branchId: string,
): Promise<string[]> {
  const emails = new Set<string>();
  const sysAdmins = await prisma.sysAdmin.findMany({ select: { email: true } });
  sysAdmins.forEach((a) => emails.add(a.email.toLowerCase()));

  const companyAdmins = await prisma.user.findMany({
    where: { companyId, isCompanyAdmin: true },
    select: { email: true },
  });
  companyAdmins.forEach((u) => emails.add(u.email.toLowerCase()));

  const branchUsers = await prisma.userBranch.findMany({
    where: { branchId },
    include: { user: { select: { email: true } } },
  });
  branchUsers.forEach((ub) => emails.add(ub.user.email.toLowerCase()));

  return Array.from(emails);
}

export type ServiceRequestResponseDto = {
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
  services: Array<{ id: string; date: string; type: string; status: string }>;
};

export async function findAllServiceRequests(
  prisma: PrismaClient,
  filters?: {
    status?: ServiceRequestStatus;
    machineId?: string;
    companyId?: string;
    limit?: number;
  },
): Promise<ServiceRequestResponseDto[]> {
  const requests = await prisma.serviceRequest.findMany({
    where: {
      ...(filters?.status && { status: filters.status }),
      ...(filters?.machineId && { machineId: filters.machineId }),
      ...(filters?.companyId && { machine: { branch: { companyId: filters.companyId } } }),
    },
    include: {
      machine: { include: { branch: { include: { company: true } } } },
      services: {
        select: { id: true, date: true, type: true, status: true },
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

export async function findServiceRequest(
  prisma: PrismaClient,
  id: string,
): Promise<{ data?: ServiceRequestResponseDto; error?: { type: string; message: string } }> {
  const request = await prisma.serviceRequest.findUnique({
    where: { id },
    include: {
      machine: { include: { branch: { include: { company: true } } } },
      services: {
        select: { id: true, date: true, type: true, status: true },
        orderBy: { date: 'desc' },
      },
    },
  });
  if (!request) {
    return { error: { type: 'NOT_FOUND', message: 'Service request not found' } };
  }
  const dto: ServiceRequestResponseDto = {
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
  return { data: dto };
}

export async function closeServiceRequest(
  prisma: PrismaClient,
  id: string,
): Promise<{ error?: { type: string; message: string } }> {
  const request = await prisma.serviceRequest.findUnique({ where: { id } });
  if (!request) return { error: { type: 'NOT_FOUND', message: 'Service request not found' } };
  if (request.status === ServiceRequestStatus.CLOSED) {
    return { error: { type: 'BAD_REQUEST', message: 'Service request is already closed' } };
  }
  await prisma.serviceRequest.update({
    where: { id },
    data: { status: ServiceRequestStatus.CLOSED, closedAt: new Date() },
  });
  return {};
}

export async function reopenServiceRequest(
  prisma: PrismaClient,
  id: string,
): Promise<{ error?: { type: string; message: string } }> {
  const request = await prisma.serviceRequest.findUnique({ where: { id } });
  if (!request) return { error: { type: 'NOT_FOUND', message: 'Service request not found' } };
  if (request.status === ServiceRequestStatus.OPEN) {
    return { error: { type: 'BAD_REQUEST', message: 'Service request is already open' } };
  }
  await prisma.serviceRequest.update({
    where: { id },
    data: { status: ServiceRequestStatus.OPEN, closedAt: null },
  });
  return {};
}

export async function createServiceFromRequest(
  prisma: PrismaClient,
  serviceRequestId: string,
  performedBy?: string,
): Promise<{ data?: { serviceId: string }; error?: { type: string; message: string } }> {
  const request = await prisma.serviceRequest.findUnique({
    where: { id: serviceRequestId },
    include: { machine: true },
  });
  if (!request) return { error: { type: 'NOT_FOUND', message: 'Service request not found' } };

  const service = await prisma.machineService.create({
    data: {
      machineId: request.machineId,
      serviceRequestId,
      date: new Date(),
      type: ServiceType.MAINTENANCE,
      status: ServiceStatus.PENDING,
      performedBy: performedBy || null,
      notes: `[Created from Service Request]\nRequester: ${request.requesterName} (${request.requesterEmail})\n${request.requesterPhone ? `Phone: ${request.requesterPhone}\n` : ''}\nProblem Description:\n${request.problemDescription}`,
    },
  });

  await prisma.serviceRequest.update({
    where: { id: serviceRequestId },
    data: { status: ServiceRequestStatus.CLOSED, closedAt: new Date() },
  });

  return { data: { serviceId: service.id } };
}

export async function machineExists(prisma: PrismaClient, machineId: string): Promise<boolean> {
  const machine = await prisma.machine.findUnique({
    where: { id: machineId },
    select: { id: true },
  });
  return !!machine;
}
export async function createServiceRequestNotification(
  prisma: PrismaClient,
  serviceRequestId: string,
  machineId: string,
  machineName: string,
  requesterName: string,
  requesterEmail: string,
  problemDescription: string,
): Promise<{
  notification: any;
  recipients: any[];
}> {
  const admins = await prisma.sysAdmin.findMany({
    select: { id: true },
  });

  const notification = await prisma.notification.create({
    data: {
      type: NotificationType.URGENT_SERVICE_REQUEST,
      createdByUserId: null,
      metadata: {
        type: NotificationType.URGENT_SERVICE_REQUEST,
        machineId,
        machineName,
        requestedByUserId: null,
        requestedByName: requesterName,
        notes: problemDescription,
        serviceRequestId,
        requesterEmail,
        isPublicRequest: true,
      },
      recipients: {
        createMany: { data: admins.map((a) => ({ recipientId: a.id })) },
      },
    },
  });

  const recipients = await prisma.notificationRecipient.findMany({
    include: { notification: true },
    where: { notificationId: notification.id },
  });

  return { notification, recipients };
}
