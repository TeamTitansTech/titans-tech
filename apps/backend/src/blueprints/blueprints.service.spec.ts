import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BlueprintsService } from './blueprints.service';
import { PrismaService } from '../prisma.service';
import {
  createMockPrismaService,
  MockPrismaService,
  resetPrismaMocks,
} from '../../test/prisma-mock';
import { ServiceSection } from '@titans-tech/shared/enums';
import {
  CreateBlueprintDto,
  CreateBlueprintWithThresholdsDto,
} from '@titans-tech/shared/backend-dtos';

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
      const createDto: CreateBlueprintDto = {
        name: 'Test Blueprint',
        fields: [{ field1: 'value1' }],
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

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(result.id).toBe('bp-123');
      expect(result.name).toBe('Test Blueprint');
    });

    it('should create blueprint with thresholds when provided', async () => {
      const createDto: CreateBlueprintWithThresholdsDto = {
        name: 'Test Blueprint',
        fields: [{ field1: 'value1' }],
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

      await service.create(createDto);

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
        fields: [{ field1: 'value1' }],
        sections: ['INVALID_SECTION' as any],
      };

      await expect(
        service.create(createDto as CreateBlueprintDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should normalize sections to uppercase', async () => {
      const createDto = {
        name: 'Test Blueprint',
        fields: [{ field1: 'value1' }],
        sections: ['bearing_clearance' as any, 'slide' as any],
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

      const result = await service.create(createDto as CreateBlueprintDto);

      expect(result.sections).toContain(ServiceSection.BEARING_CLEARANCE);
      expect(result.sections).toContain(ServiceSection.SLIDE);
    });

    it('should accept all valid sections simultaneously', async () => {
      const createDto: CreateBlueprintDto = {
        name: 'Test Blueprint',
        fields: [{ field1: 'value1' }],
        sections: [
          ServiceSection.BEARING_CLEARANCE,
          ServiceSection.SLIDE,
          ServiceSection.GIBS,
          ServiceSection.LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER,
          ServiceSection.CLUTCH,
          ServiceSection.COUNTERBALANCE_CYLINDER_AIRBAG,
        ],
      };

      const mockBlueprint = {
        id: 'bp-123',
        name: 'Test Blueprint',
        fields: { field1: 'value1' },
        sections: createDto.sections,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

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

      const result = await service.create(createDto);

      expect(result.sections).toHaveLength(6);
      expect(result.sections).toEqual(
        expect.arrayContaining([
          ServiceSection.BEARING_CLEARANCE,
          ServiceSection.SLIDE,
          ServiceSection.GIBS,
          ServiceSection.LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER,
          ServiceSection.CLUTCH,
          ServiceSection.COUNTERBALANCE_CYLINDER_AIRBAG,
        ]),
      );
    });
  });

  describe('threshold validation', () => {
    it('should call convertThresholdToDecimal when thresholds provided', async () => {
      const createDto: CreateBlueprintWithThresholdsDto = {
        name: 'Test Blueprint',
        fields: [{ field1: 'value1' }],
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

      await service.create(createDto);

      // Verifica se convertThresholdToDecimal foi aplicado aos dados
      expect(thresholdCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            blueprintId: 'bp-123',
            totalClearance_greenMin: expect.anything(),
            totalClearance_yellowMin: expect.anything(),
            totalClearance_redMin: expect.anything(),
          }),
        }),
      );
    });

    it('should rollback transaction if threshold creation fails', async () => {
      const createDto: CreateBlueprintWithThresholdsDto = {
        name: 'Test Blueprint',
        fields: [{ field1: 'value1' }],
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

      // Mock da transação que falha na criação do threshold
      prismaService.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          blueprint: {
            create: jest.fn().mockResolvedValue({
              id: 'bp-123',
              name: 'Test Blueprint',
            }),
          },
          thresholdBearingClearance: {
            create: jest.fn().mockRejectedValue(new Error('Database error')),
          },
        };
        return callback(txMock);
      });

      // A transação deve propagar o erro
      await expect(service.create(createDto)).rejects.toThrow('Database error');
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

    it('should return empty array when all blueprints are deleted', async () => {
      prismaService.blueprint.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('should order blueprints by creation date descending', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const mockBlueprints = [
        {
          id: 'bp-new',
          name: 'Newer Blueprint',
          createdAt: now,
          deletedAt: null,
          _count: { machines: 0 },
        },
        {
          id: 'bp-old',
          name: 'Older Blueprint',
          createdAt: yesterday,
          deletedAt: null,
          _count: { machines: 0 },
        },
      ];

      prismaService.blueprint.findMany.mockResolvedValue(mockBlueprints);

      const result = await service.findAll();

      expect(result[0].id).toBe('bp-new');
      expect(result[1].id).toBe('bp-old');
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

    it('should include associated machines with their fields', async () => {
      const mockBlueprint = {
        id: 'bp-123',
        name: 'Test Blueprint',
        fields: {},
        sections: [],
        deletedAt: null,
        machines: [
          {
            id: 'machine-1',
            name: 'Test Machine',
            fields: [{ id: 'field-1', key: 'serialNumber', value: '12345' }],
          },
        ],
      };

      prismaService.blueprint.findUnique.mockResolvedValue(mockBlueprint);

      const result = await service.findOne('bp-123');

      expect(result.machines).toHaveLength(1);
      expect(result.machines[0].fields).toHaveLength(1);
      expect(prismaService.blueprint.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            machines: {
              include: {
                fields: true,
              },
            },
          },
        }),
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

    it('should set deletedAt to current date', async () => {
      const mockBlueprint = {
        id: 'bp-123',
        name: 'Test Blueprint',
        fields: {},
        sections: [],
        deletedAt: null,
      };

      const beforeDelete = new Date();

      prismaService.blueprint.findUnique.mockResolvedValue(mockBlueprint);
      prismaService.blueprint.update.mockImplementation(
        async (args: { where: { id: string }; data: { deletedAt: Date } }) => {
          return {
            ...mockBlueprint,
            deletedAt: args.data.deletedAt,
          };
        },
      );

      const result = await service.softDelete('bp-123');

      const afterDelete = new Date();

      expect(result.deletedAt).toBeDefined();
      expect(result.deletedAt!.getTime()).toBeGreaterThanOrEqual(
        beforeDelete.getTime(),
      );
      expect(result.deletedAt!.getTime()).toBeLessThanOrEqual(
        afterDelete.getTime(),
      );
      expect(prismaService.blueprint.update).toHaveBeenCalledWith({
        where: { id: 'bp-123' },
        data: {
          deletedAt: expect.any(Date),
        },
      });
    });

    it('should preserve blueprint data after soft delete', async () => {
      const mockBlueprint = {
        id: 'bp-123',
        name: 'Important Blueprint',
        fields: { critical: 'data' },
        sections: [ServiceSection.BEARING_CLEARANCE],
        deletedAt: null,
      };

      prismaService.blueprint.findUnique.mockResolvedValue(mockBlueprint);
      prismaService.blueprint.update.mockResolvedValue({
        ...mockBlueprint,
        deletedAt: new Date(),
      });

      const result = await service.softDelete('bp-123');

      // Verifica que os dados foram preservados
      expect(result.id).toBe('bp-123');
      expect(result.name).toBe('Important Blueprint');
      expect(result.fields).toEqual({ critical: 'data' });
      expect(result.sections).toContain(ServiceSection.BEARING_CLEARANCE);
    });
  });
});
