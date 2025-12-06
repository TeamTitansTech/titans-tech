import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { PrismaService } from '../shared/prisma.service';
import {
  createMockPrismaService,
  MockPrismaService,
  resetPrismaMocks,
} from '../../../test/prisma-mock';
import {
  createMockThreshold,
  createMockThresholdWithDecimals,
  createMockBearingClearanceData,
  createMockMachineService,
} from '../../../test/factories/threshold.factory';

// Mock @titans-tech/shared
jest.mock('@titans-tech/shared', () => ({
  AlertBearingClearanceResponseDto: jest.fn().mockImplementation((data) => ({
    id: data?.id,
    machineServiceId: data?.machineServiceId,
    totalClearance_differential: data?.totalClearance_differential,
    totalClearance_severity: data?.totalClearance_severity,
    thresholdSnapshot: data?.thresholdSnapshot,
    bearingData: data?.bearingData,
  })),
  ThresholdBearingClearanceResponseDto: jest
    .fn()
    .mockImplementation((data) => data),
  CreateThresholdBearingClearanceSchema: {
    parse: jest.fn().mockImplementation((data) => {
      // Simple validation for threshold ordering
      const fields = [
        'totalClearance',
        'mainBearings',
        'upperConnectionBearings',
        'wristPinToMatingPart',
        'wristPinToBushing',
        'slideAdjNutToScrewSleeve',
      ];
      for (const field of fields) {
        const greenMin = data[`${field}_greenMin`];
        const yellowMin = data[`${field}_yellowMin`];
        const redMin = data[`${field}_redMin`];
        if (
          greenMin !== undefined &&
          yellowMin !== undefined &&
          redMin !== undefined
        ) {
          if (greenMin >= yellowMin || yellowMin >= redMin) {
            throw new Error(
              `Invalid threshold order for ${field}: greenMin (${greenMin}) < yellowMin (${yellowMin}) < redMin (${redMin})`,
            );
          }
        }
      }
      return data;
    }),
  },
}));

// Use string literals for AlertSeverity enum
const AlertSeverity = {
  NONE: 'NONE' as const,
  GREEN: 'GREEN' as const,
  YELLOW: 'YELLOW' as const,
  RED: 'RED' as const,
};

describe('AlertsService', () => {
  let service: AlertsService;
  let prismaService: MockPrismaService;

  beforeEach(async () => {
    const mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
    prismaService = mockPrisma;
  });

  afterEach(() => {
    resetPrismaMocks(prismaService);
  });

  describe('createThreshold', () => {
    it('should create a threshold successfully', async () => {
      const dto = createMockThreshold({ blueprintId: 'bp-1' });
      const mockResult = createMockThresholdWithDecimals({
        blueprintId: 'bp-1',
      });

      prismaService.thresholdBearingClearance.create.mockResolvedValue(
        mockResult,
      );

      const result = await service.createThreshold(dto);

      expect(
        prismaService.thresholdBearingClearance.create,
      ).toHaveBeenCalledWith({
        data: expect.objectContaining({
          blueprintId: 'bp-1',
        }),
      });
      expect(result).toBeDefined();
      expect(result.blueprintId).toBe('bp-1');
    });
  });

  describe('getThresholdByBlueprint', () => {
    it('should return threshold when found', async () => {
      const mockThreshold = createMockThresholdWithDecimals({
        blueprintId: 'bp-1',
      });
      prismaService.thresholdBearingClearance.findUnique.mockResolvedValue(
        mockThreshold,
      );

      const result = await service.getThresholdByBlueprint('bp-1');

      expect(
        prismaService.thresholdBearingClearance.findUnique,
      ).toHaveBeenCalledWith({
        where: { blueprintId: 'bp-1' },
      });
      expect(result.blueprintId).toBe('bp-1');
    });

    it('should throw NotFoundException when threshold not found', async () => {
      prismaService.thresholdBearingClearance.findUnique.mockResolvedValue(
        null,
      );

      await expect(
        service.getThresholdByBlueprint('non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateThreshold', () => {
    it('should update threshold successfully', async () => {
      const existingThreshold = createMockThresholdWithDecimals({
        blueprintId: 'bp-1',
      });
      const updateDto = { totalClearance_yellowMin: 0.025 };
      const updatedThreshold = createMockThresholdWithDecimals({
        blueprintId: 'bp-1',
        totalClearance_yellowMin: 0.025,
      });

      prismaService.thresholdBearingClearance.findUnique.mockResolvedValue(
        existingThreshold,
      );
      prismaService.thresholdBearingClearance.update.mockResolvedValue(
        updatedThreshold,
      );

      const result = await service.updateThreshold('bp-1', updateDto);

      expect(prismaService.thresholdBearingClearance.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when threshold not found', async () => {
      prismaService.thresholdBearingClearance.findUnique.mockResolvedValue(
        null,
      );

      await expect(
        service.updateThreshold('non-existent', {
          totalClearance_yellowMin: 0.025,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid threshold order', async () => {
      const existingThreshold = createMockThresholdWithDecimals({
        blueprintId: 'bp-1',
      });
      prismaService.thresholdBearingClearance.findUnique.mockResolvedValue(
        existingThreshold,
      );

      // Try to set yellowMin lower than greenMin
      // greenMin is 0.01, so setting yellowMin to 0.005 should fail
      const invalidDto = { totalClearance_yellowMin: 0.005 };

      await expect(
        service.updateThreshold('bp-1', invalidDto),
      ).rejects.toThrow();
    });

    it('should validate greenMin < yellowMin < redMin', async () => {
      const existingThreshold = createMockThresholdWithDecimals({
        blueprintId: 'bp-1',
      });
      prismaService.thresholdBearingClearance.findUnique.mockResolvedValue(
        existingThreshold,
      );

      // Try to set yellowMin >= redMin
      // redMin is 0.03, so setting yellowMin to 0.035 should fail
      const invalidDto = { totalClearance_yellowMin: 0.035 };

      await expect(
        service.updateThreshold('bp-1', invalidDto),
      ).rejects.toThrow();
    });
  });

  describe('deleteThreshold', () => {
    it('should delete threshold successfully', async () => {
      prismaService.thresholdBearingClearance.delete.mockResolvedValue({});

      await service.deleteThreshold('bp-1');

      expect(
        prismaService.thresholdBearingClearance.delete,
      ).toHaveBeenCalledWith({
        where: { blueprintId: 'bp-1' },
      });
    });
  });

  describe('generateAlertsForService', () => {
    it('should generate alerts with correct severity calculations', async () => {
      const threshold = createMockThresholdWithDecimals({
        totalClearance_greenMin: 0.01,
        totalClearance_yellowMin: 0.02,
        totalClearance_redMin: 0.03,
      });

      // Differential = |0.025 - 0.010| = 0.015
      // 0.015 >= 0.01 (greenMin) && 0.015 < 0.02 (yellowMin) = GREEN
      const bearingData = createMockBearingClearanceData({
        totalClearance_RH: 0.025,
        totalClearance_LH: 0.01,
      });

      const mockService = createMockMachineService({
        id: 'service-1',
        thresholdBearingClearance: threshold,
        bearingClearanceData: bearingData,
      });

      prismaService.machineService.findUnique.mockResolvedValue(mockService);
      prismaService.alertBearingClearance.upsert.mockResolvedValue({
        id: 'alert-1',
        machineServiceId: 'service-1',
        totalClearance_differential: bearingData.totalClearance_RH
          .minus(bearingData.totalClearance_LH)
          .abs(),
        totalClearance_severity: AlertSeverity.GREEN,
        thresholdSnapshot: {},
      });

      const result = await service.generateAlertsForService('service-1');

      expect(result).toBeDefined();
      expect(prismaService.alertBearingClearance.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { machineServiceId: 'service-1' },
          create: expect.objectContaining({
            totalClearance_severity: AlertSeverity.GREEN,
          }),
        }),
      );
    });

    it('should return NONE severity when differential < greenMin', async () => {
      const threshold = createMockThresholdWithDecimals({
        totalClearance_greenMin: 0.01,
        totalClearance_yellowMin: 0.02,
        totalClearance_redMin: 0.03,
      });

      // Differential = |0.012 - 0.010| = 0.002 < 0.01 = NONE
      const bearingData = createMockBearingClearanceData({
        totalClearance_RH: 0.012,
        totalClearance_LH: 0.01,
      });

      const mockService = createMockMachineService({
        id: 'service-1',
        thresholdBearingClearance: threshold,
        bearingClearanceData: bearingData,
      });

      prismaService.machineService.findUnique.mockResolvedValue(mockService);
      prismaService.alertBearingClearance.upsert.mockResolvedValue({
        id: 'alert-1',
        machineServiceId: 'service-1',
        totalClearance_severity: AlertSeverity.NONE,
      });

      await service.generateAlertsForService('service-1');

      expect(prismaService.alertBearingClearance.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            totalClearance_severity: AlertSeverity.NONE,
          }),
        }),
      );
    });

    it('should return YELLOW severity when greenMin <= differential < redMin', async () => {
      const threshold = createMockThresholdWithDecimals({
        totalClearance_greenMin: 0.01,
        totalClearance_yellowMin: 0.02,
        totalClearance_redMin: 0.03,
      });

      // Differential = |0.035 - 0.010| = 0.025
      // 0.025 >= 0.02 (yellowMin) && 0.025 < 0.03 (redMin) = YELLOW
      const bearingData = createMockBearingClearanceData({
        totalClearance_RH: 0.035,
        totalClearance_LH: 0.01,
      });

      const mockService = createMockMachineService({
        id: 'service-1',
        thresholdBearingClearance: threshold,
        bearingClearanceData: bearingData,
      });

      prismaService.machineService.findUnique.mockResolvedValue(mockService);
      prismaService.alertBearingClearance.upsert.mockResolvedValue({
        id: 'alert-1',
        machineServiceId: 'service-1',
        totalClearance_severity: AlertSeverity.YELLOW,
      });

      await service.generateAlertsForService('service-1');

      expect(prismaService.alertBearingClearance.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            totalClearance_severity: AlertSeverity.YELLOW,
          }),
        }),
      );
    });

    it('should return RED severity when differential >= redMin', async () => {
      const threshold = createMockThresholdWithDecimals({
        totalClearance_greenMin: 0.01,
        totalClearance_yellowMin: 0.02,
        totalClearance_redMin: 0.03,
      });

      // Differential = |0.050 - 0.010| = 0.040 >= 0.03 (redMin) = RED
      const bearingData = createMockBearingClearanceData({
        totalClearance_RH: 0.05,
        totalClearance_LH: 0.01,
      });

      const mockService = createMockMachineService({
        id: 'service-1',
        thresholdBearingClearance: threshold,
        bearingClearanceData: bearingData,
      });

      prismaService.machineService.findUnique.mockResolvedValue(mockService);
      prismaService.alertBearingClearance.upsert.mockResolvedValue({
        id: 'alert-1',
        machineServiceId: 'service-1',
        totalClearance_severity: AlertSeverity.RED,
      });

      await service.generateAlertsForService('service-1');

      expect(prismaService.alertBearingClearance.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            totalClearance_severity: AlertSeverity.RED,
          }),
        }),
      );
    });

    it('should throw NotFoundException when service not found', async () => {
      prismaService.machineService.findUnique.mockResolvedValue(null);

      await expect(
        service.generateAlertsForService('non-existent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return null when no threshold is configured', async () => {
      const mockService = createMockMachineService({
        id: 'service-1',
        thresholdBearingClearance: null,
        bearingClearanceData: createMockBearingClearanceData(),
      });

      prismaService.machineService.findUnique.mockResolvedValue(mockService);

      const result = await service.generateAlertsForService('service-1');

      expect(result).toBeNull();
      expect(prismaService.alertBearingClearance.upsert).not.toHaveBeenCalled();
    });

    it('should return null when no bearing clearance data exists', async () => {
      const mockService = createMockMachineService({
        id: 'service-1',
        thresholdBearingClearance: createMockThresholdWithDecimals(),
        bearingClearanceData: null,
      });

      prismaService.machineService.findUnique.mockResolvedValue(mockService);

      const result = await service.generateAlertsForService('service-1');

      expect(result).toBeNull();
      expect(prismaService.alertBearingClearance.upsert).not.toHaveBeenCalled();
    });
  });

  describe('getAlertByService', () => {
    it('should return alert when found', async () => {
      const bearingData = createMockBearingClearanceData();
      const mockAlert = {
        id: 'alert-1',
        machineServiceId: 'service-1',
        totalClearance_differential: bearingData.totalClearance_RH,
        totalClearance_severity: AlertSeverity.GREEN,
        machineService: {
          bearingClearance: [
            {
              outerData: bearingData,
              innerData: null,
            },
          ],
        },
      };

      prismaService.alertBearingClearance.findUnique.mockResolvedValue(
        mockAlert,
      );

      const result = await service.getAlertByService('service-1');

      expect(result).toBeDefined();
      expect(
        prismaService.alertBearingClearance.findUnique,
      ).toHaveBeenCalledWith({
        where: { machineServiceId: 'service-1' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when alert not found', async () => {
      prismaService.alertBearingClearance.findUnique.mockResolvedValue(null);

      await expect(service.getAlertByService('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
