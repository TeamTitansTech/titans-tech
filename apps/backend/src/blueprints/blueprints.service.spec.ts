import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BlueprintsService } from './blueprints.service';
import { PrismaService } from '../prisma.service';
import {
  createMockPrismaService,
  MockPrismaService,
  resetPrismaMocks,
} from '../../test/prisma-mock';

// Use string literals for ServiceSection enum
const ServiceSection = {
  BEARING_CLEARANCE: 'BEARING_CLEARANCE' as const,
  SLIDE: 'SLIDE' as const,
  GIBS: 'GIBS' as const,
  LUBRICATION_HYDRAULICS: 'LUBRICATION_HYDRAULICS' as const,
  CLUTCH: 'CLUTCH' as const,
  COUNTERBALANCE_CYLINDER_AIRBAG: 'COUNTERBALANCE_CYLINDER_AIRBAG' as const,
};

describe('BlueprintsService', () => {
  let service: BlueprintsService;
  let prismaService: MockPrismaService;

  beforeEach(async () => {
    const mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlueprintsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<BlueprintsService>(BlueprintsService);
    prismaService = mockPrisma;
  });

  afterEach(() => {
    resetPrismaMocks(prismaService);
  });

  describe('create', () => {
    it('should create a blueprint successfully', async () => {
      const createDto = {
        name: 'Test Blueprint',
        fields: { field1: 'value1' },
        sections: [ServiceSection.BEARING_CLEARANCE, ServiceSection.SLIDE],
      };

      const mockBlueprint = {
        id: 'bp-123',
        name: 'Test Blueprint',
        fields: { field1: 'value1' },
        sections: [ServiceSection.BEARING_CLEARANCE, ServiceSection.SLIDE],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      // Mock transaction
      prismaService.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          blueprint: {
            create: jest.fn().mockResolvedValue(mockBlueprint),
          },
          thresholdBearingClearance: {
            create: jest.fn(),
          },
        };
        return callback(txMock);
      });

      const result = await service.create(createDto as any);

      expect(result).toBeDefined();
      expect(result.id).toBe('bp-123');
      expect(result.name).toBe('Test Blueprint');
    });

    it('should create blueprint with thresholds when provided', async () => {
      const createDto = {
        name: 'Test Blueprint',
        fields: { field1: 'value1' },
        sections: [ServiceSection.BEARING_CLEARANCE],
        thresholds: {
          totalClearance_greenMin: 0.01,
          totalClearance_yellowMin: 0.02,
          totalClearance_redMin: 0.03,
          mainBearings_greenMin: 0.01,
          mainBearings_yellowMin: 0.02,
          mainBearings_redMin: 0.03,
          upperConnectionBearings_greenMin: 0.01,
          upperConnectionBearings_yellowMin: 0.02,
          upperConnectionBearings_redMin: 0.03,
          wristPinToMatingPart_greenMin: 0.01,
          wristPinToMatingPart_yellowMin: 0.02,
          wristPinToMatingPart_redMin: 0.03,
          wristPinToBushing_greenMin: 0.01,
          wristPinToBushing_yellowMin: 0.02,
          wristPinToBushing_redMin: 0.03,
          slideAdjNutToScrewSleeve_greenMin: 0.01,
          slideAdjNutToScrewSleeve_yellowMin: 0.02,
          slideAdjNutToScrewSleeve_redMin: 0.03,
        },
      };

      const mockBlueprint = {
        id: 'bp-123',
        name: 'Test Blueprint',
        fields: { field1: 'value1' },
        sections: [ServiceSection.BEARING_CLEARANCE],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const thresholdCreateMock = jest.fn();

      prismaService.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          blueprint: {
            create: jest.fn().mockResolvedValue(mockBlueprint),
          },
          thresholdBearingClearance: {
            create: thresholdCreateMock,
          },
        };
        return callback(txMock);
      });

      await service.create(createDto as any);

      expect(thresholdCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            blueprintId: 'bp-123',
          }),
        }),
      );
    });

    it('should throw BadRequestException for invalid sections', async () => {
      const createDto = {
        name: 'Test Blueprint',
        fields: { field1: 'value1' },
        sections: ['INVALID_SECTION'],
      };

      await expect(service.create(createDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all non-deleted blueprints', async () => {
      const mockBlueprints = [
        {
          id: 'bp-1',
          name: 'Blueprint 1',
          fields: {},
          sections: [],
          deletedAt: null,
          _count: { machines: 5 },
        },
        {
          id: 'bp-2',
          name: 'Blueprint 2',
          fields: {},
          sections: [],
          deletedAt: null,
          _count: { machines: 3 },
        },
      ];

      prismaService.blueprint.findMany.mockResolvedValue(mockBlueprints);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(prismaService.blueprint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deletedAt: null },
          include: {
            _count: {
              select: { machines: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a blueprint by id', async () => {
      const mockBlueprint = {
        id: 'bp-123',
        name: 'Test Blueprint',
        fields: {},
        sections: [],
        deletedAt: null,
        machines: [],
      };

      prismaService.blueprint.findUnique.mockResolvedValue(mockBlueprint);

      const result = await service.findOne('bp-123');

      expect(result.id).toBe('bp-123');
      expect(prismaService.blueprint.findUnique).toHaveBeenCalledWith({
        where: { id: 'bp-123' },
        include: {
          machines: {
            include: {
              fields: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when blueprint not found', async () => {
      prismaService.blueprint.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when blueprint is soft-deleted', async () => {
      const mockBlueprint = {
        id: 'bp-123',
        name: 'Test Blueprint',
        fields: {},
        sections: [],
        deletedAt: new Date(),
        machines: [],
      };

      prismaService.blueprint.findUnique.mockResolvedValue(mockBlueprint);

      await expect(service.findOne('bp-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('softDelete', () => {
    it('should soft delete a blueprint', async () => {
      const mockBlueprint = {
        id: 'bp-123',
        name: 'Test Blueprint',
        fields: {},
        sections: [],
        deletedAt: null,
      };

      const deletedBlueprint = {
        ...mockBlueprint,
        deletedAt: new Date(),
      };

      prismaService.blueprint.findUnique.mockResolvedValue(mockBlueprint);
      prismaService.blueprint.update.mockResolvedValue(deletedBlueprint);

      const result = await service.softDelete('bp-123');

      expect(result.deletedAt).toBeDefined();
      expect(prismaService.blueprint.update).toHaveBeenCalledWith({
        where: { id: 'bp-123' },
        data: {
          deletedAt: expect.any(Date),
        },
      });
    });

    it('should throw NotFoundException when blueprint not found', async () => {
      prismaService.blueprint.findUnique.mockResolvedValue(null);

      await expect(service.softDelete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when blueprint is already deleted', async () => {
      const mockBlueprint = {
        id: 'bp-123',
        name: 'Test Blueprint',
        fields: {},
        sections: [],
        deletedAt: new Date(),
      };

      prismaService.blueprint.findUnique.mockResolvedValue(mockBlueprint);

      await expect(service.softDelete('bp-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
