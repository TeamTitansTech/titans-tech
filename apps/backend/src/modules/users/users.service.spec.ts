import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { PrismaService } from '../shared/prisma.service';
import {
  createMockPrismaService,
  MockPrismaService,
  resetPrismaMocks,
} from '../../../test/prisma-mock';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

// Mock src/errors/err - use relative path from service file
jest.mock('../../errors/err', () => ({
  FieldsErr: jest.fn().mockImplementation(() => {
    const error = new Error('Validation error');
    error.name = 'FieldsErr';
    return error;
  }),
}));

// Mock src/types/request - use relative path from service file
jest.mock('../../types/request', () => ({
  isSysAdmin: jest
    .fn()
    .mockImplementation((payload) => payload.isSysAdmin === true),
  UserJwtPayload: jest.fn(),
  JwtPayload: jest.fn(),
}));

// Mock @titans-tech/shared
jest.mock('@titans-tech/shared', () => ({
  UserResponseDto: jest.fn().mockImplementation((data) => ({
    id: data?.id,
    email: data?.email,
    name: data?.name,
    companyId: data?.companyId,
    isCompanyAdmin: data?.isCompanyAdmin,
    isCompanyManager: data?.isCompanyManager,
    isUsingDefaultPassword: data?.isUsingDefaultPassword,
    branches: data?.branches || [],
  })),
  CreateUserDto: jest.fn(),
  UpdateUserDto: jest.fn(),
  UpdatePasswordDto: jest.fn(),
  SysAdminCreateUserDto: jest.fn(),
  SetCompanyAdminDto: jest.fn(),
  SetCompanyManagerDto: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: MockPrismaService;
  let jwtService: { signAsync: jest.Mock };

  beforeEach(async () => {
    const mockPrisma = createMockPrismaService();
    const mockJwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = mockPrisma;
    jwtService = mockJwtService;
  });

  afterEach(() => {
    resetPrismaMocks(prismaService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully and return access token', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
        password: 'hashedPassword',
        companyId: 'company-123',
        isCompanyAdmin: false,
        isCompanyManager: false,
        isUsingDefaultPassword: false,
        branches: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.user.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('jwt-token-123');

      const result = await service.login(
        'user@example.com',
        'password123',
        'company-123',
      );

      expect(result.accessToken).toBe('jwt-token-123');
      expect(result.user).toBeDefined();
      expect(result.user.id).toBe('user-123');
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        id: 'user-123',
        companyId: 'company-123',
        isSysAdmin: false,
      });
    });

    it('should throw ForbiddenException when user not found', async () => {
      prismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login('nonexistent@example.com', 'password', 'company-123'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when password is invalid', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        password: 'hashedPassword',
        companyId: 'company-123',
        branches: [],
      };

      prismaService.user.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login('user@example.com', 'wrongpassword', 'company-123'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getMe', () => {
    it('should return user data', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
        companyId: 'company-123',
        branches: [],
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getMe('user-123');

      expect(result.id).toBe('user-123');
      expect(result.email).toBe('user@example.com');
    });

    it('should throw NotFoundException when user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getMe('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all users for a company', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          name: 'User 1',
          companyId: 'company-123',
          branches: [],
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          name: 'User 2',
          companyId: 'company-123',
          branches: [],
        },
      ];

      prismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll('company-123');

      expect(result).toHaveLength(2);
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: { companyId: 'company-123' },
        include: {
          branches: {
            include: { branch: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
        companyId: 'company-123',
        branches: [],
      };

      prismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.findOne('user-123', 'company-123');

      expect(result.id).toBe('user-123');
    });

    it('should throw NotFoundException when user not found', async () => {
      prismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne('non-existent', 'company-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createWithBranch', () => {
    it('should create a user with branch assignment', async () => {
      const createDto = {
        email: 'newuser@example.com',
        name: 'New User',
      };

      const mockBranch = {
        id: 'branch-123',
        name: 'Main Branch',
        companyId: 'company-123',
      };

      const mockCreatedUser = {
        id: 'user-123',
        email: 'newuser@example.com',
        name: 'New User',
        companyId: 'company-123',
        isUsingDefaultPassword: true,
        branches: [{ branch: mockBranch }],
      };

      prismaService.companyBranch.findUnique.mockResolvedValue(mockBranch);
      prismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      prismaService.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          user: {
            create: jest.fn().mockResolvedValue({ id: 'user-123' }),
            findUnique: jest.fn().mockResolvedValue(mockCreatedUser),
          },
          userBranch: {
            create: jest.fn(),
          },
        };
        return callback(txMock);
      });

      const result = await service.createWithBranch('branch-123', createDto);

      expect(result.id).toBe('user-123');
      expect(result.email).toBe('newuser@example.com');
    });

    it('should throw NotFoundException when branch not found', async () => {
      prismaService.companyBranch.findUnique.mockResolvedValue(null);

      await expect(
        service.createWithBranch('non-existent', {
          email: 'test@example.com',
          name: 'Test',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error when email is already in use', async () => {
      const mockBranch = {
        id: 'branch-123',
        companyId: 'company-123',
      };

      const existingUser = {
        id: 'existing-user',
        email: 'existing@example.com',
      };

      prismaService.companyBranch.findUnique.mockResolvedValue(mockBranch);
      prismaService.user.findUnique.mockResolvedValue(existingUser);

      await expect(
        service.createWithBranch('branch-123', {
          email: 'existing@example.com',
          name: 'Test',
        }),
      ).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const updateDto = {
        name: 'Updated Name',
      };

      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Original Name',
        companyId: 'company-123',
        branches: [],
      };

      const updatedUser = {
        ...mockUser,
        name: 'Updated Name',
      };

      prismaService.user.findFirst.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('user-123', 'company-123', updateDto);

      expect(result.name).toBe('Updated Name');
    });

    it('should throw NotFoundException when user not found', async () => {
      prismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        service.update('non-existent', 'company-123', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        companyId: 'company-123',
      };

      prismaService.user.findFirst.mockResolvedValue(mockUser);
      prismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove('user-123', 'company-123');

      expect(result).toEqual({ message: 'User deleted successfully' });
    });

    it('should throw NotFoundException when user not found', async () => {
      prismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        service.remove('non-existent', 'company-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      const updateDto = {
        currentPassword: 'oldPassword',
        password: 'newPassword123',
        confirmPassword: 'newPassword123',
      };

      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        password: 'hashedOldPassword',
        isUsingDefaultPassword: false,
        companyId: 'company-123',
        branches: [],
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
      prismaService.user.update.mockResolvedValue({
        ...mockUser,
        password: 'hashedNewPassword',
      });

      const result = await service.updatePassword('user-123', updateDto);

      expect(result.id).toBe('user-123');
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          password: 'hashedNewPassword',
          isUsingDefaultPassword: false,
        },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updatePassword('non-existent', {
          currentPassword: 'old',
          password: 'new',
          confirmPassword: 'new',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when current password is invalid', async () => {
      const mockUser = {
        id: 'user-123',
        password: 'hashedPassword',
        isUsingDefaultPassword: false,
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.updatePassword('user-123', {
          currentPassword: 'wrongPassword',
          password: 'newPassword',
          confirmPassword: 'newPassword',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('addUserToBranch', () => {
    it('should add user to branch successfully', async () => {
      const mockBranch = {
        id: 'branch-123',
        companyId: 'company-123',
      };

      const mockUser = {
        id: 'user-123',
        companyId: 'company-123',
        branches: [],
      };

      const updatedUser = {
        ...mockUser,
        branches: [{ branch: mockBranch }],
      };

      prismaService.companyBranch.findUnique.mockResolvedValue(mockBranch);
      prismaService.user.findUnique
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(updatedUser);
      prismaService.userBranch.findUnique.mockResolvedValue(null);
      prismaService.userBranch.create.mockResolvedValue({});

      const result = await service.addUserToBranch('branch-123', 'user-123');

      expect(result.branches).toHaveLength(1);
    });

    it('should throw NotFoundException when branch not found', async () => {
      prismaService.companyBranch.findUnique.mockResolvedValue(null);

      await expect(
        service.addUserToBranch('non-existent', 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user not found', async () => {
      const mockBranch = {
        id: 'branch-123',
        companyId: 'company-123',
      };

      prismaService.companyBranch.findUnique.mockResolvedValue(mockBranch);
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.addUserToBranch('branch-123', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is from different company', async () => {
      const mockBranch = {
        id: 'branch-123',
        companyId: 'company-123',
      };

      const mockUser = {
        id: 'user-123',
        companyId: 'different-company',
      };

      prismaService.companyBranch.findUnique.mockResolvedValue(mockBranch);
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.addUserToBranch('branch-123', 'user-123'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when user is already assigned to branch', async () => {
      const mockBranch = {
        id: 'branch-123',
        companyId: 'company-123',
      };

      const mockUser = {
        id: 'user-123',
        companyId: 'company-123',
      };

      prismaService.companyBranch.findUnique.mockResolvedValue(mockBranch);
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.userBranch.findUnique.mockResolvedValue({
        userId: 'user-123',
        branchId: 'branch-123',
      });

      await expect(
        service.addUserToBranch('branch-123', 'user-123'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('removeUserFromBranch', () => {
    it('should remove user from branch successfully', async () => {
      const mockUserBranch = {
        userId: 'user-123',
        branchId: 'branch-123',
      };

      const updatedUser = {
        id: 'user-123',
        branches: [],
      };

      prismaService.userBranch.findUnique.mockResolvedValue(mockUserBranch);
      prismaService.userBranch.delete.mockResolvedValue({});
      prismaService.user.findUnique.mockResolvedValue(updatedUser);

      const result = await service.removeUserFromBranch(
        'branch-123',
        'user-123',
      );

      expect(result.branches).toHaveLength(0);
    });

    it('should throw NotFoundException when user is not assigned to branch', async () => {
      prismaService.userBranch.findUnique.mockResolvedValue(null);

      await expect(
        service.removeUserFromBranch('branch-123', 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('setCompanyAdmin', () => {
    it('should set company admin status', async () => {
      const dto = { isCompanyAdmin: true };
      const userPayload = { id: 'admin-123', isSysAdmin: true };

      const mockUser = {
        id: 'user-123',
        isCompanyAdmin: false,
        branches: [],
      };

      const updatedUser = {
        ...mockUser,
        isCompanyAdmin: true,
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.setCompanyAdmin(
        'user-123',
        dto,
        userPayload as any,
      );

      expect(result.isCompanyAdmin).toBe(true);
    });

    it('should throw ForbiddenException when non-sysadmin tries to set admin', async () => {
      const dto = { isCompanyAdmin: true };
      const userPayload = {
        id: 'user-456',
        isSysAdmin: false,
        companyId: 'company-123',
      };

      await expect(
        service.setCompanyAdmin('user-123', dto, userPayload as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when user not found', async () => {
      const dto = { isCompanyAdmin: true };
      const userPayload = { id: 'admin-123', isSysAdmin: true };

      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.setCompanyAdmin('non-existent', dto, userPayload as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('setCompanyManager', () => {
    it('should set company manager status', async () => {
      const dto = { isCompanyManager: true };
      const userPayload = { id: 'admin-123', isSysAdmin: true };

      const mockUser = {
        id: 'user-123',
        isCompanyManager: false,
        branches: [],
      };

      const updatedUser = {
        ...mockUser,
        isCompanyManager: true,
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.setCompanyManager(
        'user-123',
        dto,
        userPayload as any,
      );

      expect(result.isCompanyManager).toBe(true);
    });

    it('should throw NotFoundException when user not found', async () => {
      const dto = { isCompanyManager: true };
      const userPayload = { id: 'admin-123', isSysAdmin: true };

      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.setCompanyManager('non-existent', dto, userPayload as any),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
