import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ServicesService } from './services.service';
import { PrismaService } from '../prisma.service';
import { AlertsService } from '../modules/alerts/alerts.service';
import {
  createMockPrismaService,
  MockPrismaService,
  resetPrismaMocks,
} from '../../test/prisma-mock';
import {
  createMockBearingClearanceData,
  createMockMachineService,
} from '../../test/factories/threshold.factory';

// Mock @titans-tech/shared
jest.mock('@titans-tech/shared', () => ({
  LatestBearingClearanceDto: jest.fn().mockImplementation((data) => data),
  LatestReportResponseDto: jest.fn().mockImplementation((data) => data),
}));

// Use string literals that match the enum values
const ServiceType = {
  INSPECTION: 'INSPECTION' as const,
  MAINTENANCE: 'MAINTENANCE' as const,
};

const ServiceStatus = {
  PENDING: 'PENDING' as const,
  COMPLETED: 'COMPLETED' as const,
};

describe('ServicesService', () => {
  let service: ServicesService;
  let prismaService: MockPrismaService;
  let alertsService: {
    generateAlertsForService: jest.Mock;
    getAlertByService: jest.Mock;
  };

  beforeEach(async () => {
    const mockPrisma = createMockPrismaService();
    const mockAlertsService = {
      generateAlertsForService: jest.fn(),
      getAlertByService: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: AlertsService,
          useValue: mockAlertsService,
        },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
    prismaService = mockPrisma;
    alertsService = mockAlertsService;
  });

  afterEach(() => {
    resetPrismaMocks(prismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a service successfully', async () => {
      // setup do test mocks
      const createDto = {
        machineId: 'machine-123',
        date: '2024-01-15',
        type: ServiceType.INSPECTION,
      };

      const mockMachine = {
        id: 'machine-123',
        name: 'Test Machine',
        blueprint: { id: 'bp-1', name: 'Test BP' },
      };

      const mockCreatedService = {
        id: 'service-123',
        machineId: 'machine-123',
        date: new Date('2024-01-15'),
        type: ServiceType.INSPECTION,
        status: ServiceStatus.PENDING,
        machine: mockMachine,
      };

      // chama o mock do prisma para buscar a maquina
      prismaService.machine.findUnique.mockResolvedValue(mockMachine);
      // chama o mock do prisma para criar o servico
      prismaService.machineService.create.mockResolvedValue(mockCreatedService);

      const result = await service.create(createDto as any);

      // verifica se o mock do prisma foi chamado com a maquina correta
      expect(prismaService.machine.findUnique).toHaveBeenCalledWith({
        where: { id: 'machine-123' },
        include: { blueprint: true },
      });
      // verifica se o mock do prisma foi chamado para criar o servico
      expect(prismaService.machineService.create).toHaveBeenCalled();
      // verifica se o id do servico criado
      expect(result.id).toBe('service-123');
      // verifica o tipo do que foi criado
      expect(result.type).toBe(ServiceType.INSPECTION);
    });

    it('should throw NotFoundException when machine not found', async () => {
      const createDto = {
        machineId: 'non-existent',
        date: '2024-01-15',
        type: ServiceType.INSPECTION,
      };

      prismaService.machine.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    // NOTE: bearing clearance data is now added via update endpoints, not during creation
  });

  describe('findAll', () => {
    it('should return all services', async () => {
      const mockServices = [
        createMockMachineService({ id: 'service-1' }),
        createMockMachineService({ id: 'service-2' }),
      ];

      prismaService.machineService.findMany.mockResolvedValue(mockServices);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(prismaService.machineService.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { date: 'desc' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a service by id', async () => {
      const mockService = createMockMachineService({ id: 'service-123' });

      prismaService.machineService.findUnique.mockResolvedValue(mockService);
      const result = await service.findOne('service-123');

      expect(result.id).toBe('service-123');
      expect(prismaService.machineService.findUnique).toHaveBeenCalledWith({
        where: { id: 'service-123' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when service not found', async () => {
      prismaService.machineService.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByMachine', () => {
    it('should return services for a machine', async () => {
      const mockMachine = { id: 'machine-123', name: 'Test' };
      const mockServices = [
        createMockMachineService({ id: 'service-1', machineId: 'machine-123' }),
        createMockMachineService({ id: 'service-2', machineId: 'machine-123' }),
      ];

      prismaService.machine.findUnique.mockResolvedValue(mockMachine);
      prismaService.machineService.findMany.mockResolvedValue(mockServices);

      const result = await service.findByMachine('machine-123');

      expect(result).toHaveLength(2);
      expect(prismaService.machineService.findMany).toHaveBeenCalledWith({
        where: { machineId: 'machine-123' },
        include: expect.any(Object),
        orderBy: { date: 'desc' },
      });
    });

    it('should throw NotFoundException when machine not found', async () => {
      prismaService.machine.findUnique.mockResolvedValue(null);

      await expect(service.findByMachine('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // TODO: Implementar os testes para o update apos refactor do felps TT-BE-08
  // describe('update', () => {
  //   it('should update a service successfully', async () => {
  //     const existingService = createMockMachineService({ id: 'service-123' });
  //     const updateDto = {
  //       status: ServiceStatus.COMPLETED,
  //       currentStep: 'summary',
  //     };
  //     const updatedService = {
  //       ...existingService,
  //       status: ServiceStatus.COMPLETED,
  //       currentStep: 'summary',
  //     };

  //     prismaService.machineService.findUnique.mockResolvedValue(
  //       existingService,
  //     );
  //     prismaService.machineService.update.mockResolvedValue(updatedService);

  //     const result = await service.update('service-123', updateDto as any);

  //     expect(result.status).toBe(ServiceStatus.COMPLETED);
  //     expect(result.currentStep).toBe('summary');
  //   });

  //   it('should throw NotFoundException when service not found', async () => {
  //     prismaService.machineService.findUnique.mockResolvedValue(null);

  //     await expect(
  //       service.update('non-existent', {
  //         status: ServiceStatus.COMPLETED,
  //       } as any),
  //     ).rejects.toThrow(NotFoundException);
  //   });

  //   it('should trigger alert generation when bearing clearance data is updated', async () => {
  //     const existingService = createMockMachineService({ id: 'service-123' });
  //     const bearingData = {
  //       totalClearance_RH: 0.015,
  //       totalClearance_LH: 0.01,
  //       mainBearings_RH: 0.015,
  //       mainBearings_LH: 0.01,
  //       upperConnectionBearings_RH: 0.015,
  //       upperConnectionBearings_LH: 0.01,
  //       wristPinToMatingPart_RH: 0.015,
  //       wristPinToMatingPart_LH: 0.01,
  //       wristPinToBushing_RH: 0.015,
  //       wristPinToBushing_LH: 0.01,
  //       slideAdjNutToScrewSleeve_RH: 0.015,
  //       slideAdjNutToScrewSleeve_LH: 0.01,
  //     };

  //     const updateDto = {
  //       bearingClearance: {
  //         outerAfter: bearingData,
  //       },
  //     };

  //     const updatedService = {
  //       ...existingService,
  //       bearingClearance: [
  //         {
  //           id: 'bc-1',
  //           outerData: createMockBearingClearanceData(bearingData),
  //         },
  //       ],
  //     };

  //     prismaService.machineService.findUnique.mockResolvedValue(
  //       existingService,
  //     );
  //     prismaService.machineService.update.mockResolvedValue(updatedService);
  //     alertsService.generateAlertsForService.mockResolvedValue(null);

  //     await service.update('service-123', updateDto as any);

  //     expect(alertsService.generateAlertsForService).toHaveBeenCalledWith(
  //       'service-123',
  //     );
  //   });

  //   it('should not trigger alert generation when no bearing data is updated', async () => {
  //     const existingService = createMockMachineService({ id: 'service-123' });
  //     const updateDto = {
  //       status: ServiceStatus.COMPLETED,
  //     };

  //     prismaService.machineService.findUnique.mockResolvedValue(
  //       existingService,
  //     );
  //     prismaService.machineService.update.mockResolvedValue({
  //       ...existingService,
  //       status: ServiceStatus.COMPLETED,
  //     });

  //     await service.update('service-123', updateDto as any);

  //     expect(alertsService.generateAlertsForService).not.toHaveBeenCalled();
  //   });

  //   it('should handle workflow state updates', async () => {
  //     const existingService = createMockMachineService({ id: 'service-123' });
  //     const updateDto = {
  //       currentStep: 'sections',
  //       currentSectionKey: 'BEARING_CLEARANCE',
  //       selectedSections: ['BEARING_CLEARANCE', 'SLIDE'],
  //     };

  //     const updatedService = {
  //       ...existingService,
  //       ...updateDto,
  //     };

  //     prismaService.machineService.findUnique.mockResolvedValue(
  //       existingService,
  //     );
  //     prismaService.machineService.update.mockResolvedValue(updatedService);

  //     const result = await service.update('service-123', updateDto as any);

  //     expect(result.currentStep).toBe('sections');
  //     expect(result.currentSectionKey).toBe('BEARING_CLEARANCE');
  //     expect(result.selectedSections).toEqual(['BEARING_CLEARANCE', 'SLIDE']);
  //   });
  // });

  describe('getLatestReport', () => {
    it('should return latest report for a machine', async () => {
      const mockMachine = {
        id: 'machine-123',
        name: 'Test Machine',
        blueprint: {
          id: 'bp-1',
          name: 'Test BP',
          sections: ['BEARING_CLEARANCE'],
        },
        branch: { id: 'branch-1', name: 'Branch' },
      };

      const mockServices = [
        {
          id: 'service-1',
          date: new Date('2024-01-15'),
          type: ServiceType.INSPECTION,
          bearingClearance: [
            {
              outerData: createMockBearingClearanceData(),
              innerData: null,
            },
          ],
          slide: [],
          gibs: [],
          lubricationHydraulics: [],
          clutch: [],
          counterbalanceCylinderAirbag: [],
        },
      ];

      prismaService.machine.findUnique.mockResolvedValue(mockMachine);
      prismaService.machineService.findMany.mockResolvedValue(mockServices);
      alertsService.getAlertByService.mockRejectedValue(
        new NotFoundException(),
      );

      const result = await service.getLatestReport('machine-123');

      expect(result.machineId).toBe('machine-123');
      expect(result.sections.BEARING_CLEARANCE).toBeDefined();
      expect(result.sections.BEARING_CLEARANCE?.latestServiceId).toBe(
        'service-1',
      );
    });

    it('should throw NotFoundException when machine not found', async () => {
      prismaService.machine.findUnique.mockResolvedValue(null);

      await expect(service.getLatestReport('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return null for sections without data', async () => {
      const mockMachine = {
        id: 'machine-123',
        name: 'Test Machine',
        blueprint: {
          id: 'bp-1',
          name: 'Test BP',
          sections: ['BEARING_CLEARANCE', 'SLIDE'],
        },
        branch: { id: 'branch-1', name: 'Branch' },
      };

      // No services exist
      prismaService.machine.findUnique.mockResolvedValue(mockMachine);
      prismaService.machineService.findMany.mockResolvedValue([]);

      const result = await service.getLatestReport('machine-123');

      expect(result.sections.BEARING_CLEARANCE).toBeNull();
      expect(result.sections.SLIDE).toBeNull();
    });
  });
});
