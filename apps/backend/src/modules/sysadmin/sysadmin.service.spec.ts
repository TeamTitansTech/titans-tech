import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SysAdminService } from './sysadmin.service';
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

// Mock @titans-tech/shared
jest.mock('@titans-tech/shared', () => ({
  SysAdminResponseDto: jest.fn().mockImplementation((data) => ({
    id: data.id,
    email: data.email,
    isUsingDefaultPassword: data.isUsingDefaultPassword,
  })),
  UpdatePasswordDto: jest.fn(),
}));

describe('SysAdminService', () => {
  let service: SysAdminService;
  let prismaService: MockPrismaService;
  let jwtService: { signAsync: jest.Mock };

  beforeEach(async () => {
    const mockPrisma = createMockPrismaService();
    const mockJwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SysAdminService,
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

    service = module.get<SysAdminService>(SysAdminService);
    prismaService = mockPrisma;
    jwtService = mockJwtService;
  });

  afterEach(() => {
    resetPrismaMocks(prismaService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully and return access token', async () => {
      const loginDto = {
        email: 'admin@example.com',
        password: 'password123',
      };

      const mockSysAdmin = {
        id: 'admin-123',
        email: 'admin@example.com',
        password: 'hashedPassword',
        isUsingDefaultPassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.sysAdmin.findUnique.mockResolvedValue(mockSysAdmin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('jwt-token-123');

      const result = await service.login(loginDto);

      expect(result.accessToken).toBe('jwt-token-123');
      expect(result.user).toBeDefined();
      expect(result.user.id).toBe('admin-123');
      expect(prismaService.sysAdmin.findUnique).toHaveBeenCalledWith({
        where: { email: 'admin@example.com' },
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        id: 'admin-123',
        isSysAdmin: true,
      });
    });

    it('should throw ForbiddenException when email not found', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      prismaService.sysAdmin.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when password is invalid', async () => {
      const loginDto = {
        email: 'admin@example.com',
        password: 'wrongpassword',
      };

      const mockSysAdmin = {
        id: 'admin-123',
        email: 'admin@example.com',
        password: 'hashedPassword',
        isUsingDefaultPassword: false,
      };

      prismaService.sysAdmin.findUnique.mockResolvedValue(mockSysAdmin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getMe', () => {
    it('should return sysadmin data', async () => {
      const mockSysAdmin = {
        id: 'admin-123',
        email: 'admin@example.com',
        password: 'hashedPassword',
        isUsingDefaultPassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.sysAdmin.findUnique.mockResolvedValue(mockSysAdmin);

      const result = await service.getMe('admin-123');

      expect(result.id).toBe('admin-123');
      expect(result.email).toBe('admin@example.com');
      expect(prismaService.sysAdmin.findUnique).toHaveBeenCalledWith({
        where: { id: 'admin-123' },
      });
    });

    it('should throw NotFoundException when sysadmin not found', async () => {
      prismaService.sysAdmin.findUnique.mockResolvedValue(null);

      await expect(service.getMe('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      const updateDto = {
        currentPassword: 'oldPassword',
        password: 'newPassword123',
        confirmPassword: 'newPassword123',
      };

      const mockSysAdmin = {
        id: 'admin-123',
        email: 'admin@example.com',
        password: 'hashedOldPassword',
        isUsingDefaultPassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedSysAdmin = {
        ...mockSysAdmin,
        password: 'hashedNewPassword',
        isUsingDefaultPassword: false,
      };

      prismaService.sysAdmin.findUnique.mockResolvedValue(mockSysAdmin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
      prismaService.sysAdmin.update.mockResolvedValue(updatedSysAdmin);

      const result = await service.updatePassword('admin-123', updateDto);

      expect(result.id).toBe('admin-123');
      expect(prismaService.sysAdmin.update).toHaveBeenCalledWith({
        where: { id: 'admin-123' },
        data: {
          password: 'hashedNewPassword',
          isUsingDefaultPassword: false,
        },
      });
    });

    it('should use default password when isUsingDefaultPassword is true', async () => {
      const updateDto = {
        currentPassword: 'anyPassword',
        password: 'newPassword123',
        confirmPassword: 'newPassword123',
      };

      const mockSysAdmin = {
        id: 'admin-123',
        email: 'admin@example.com',
        password: 'hashedDefaultPassword',
        isUsingDefaultPassword: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.sysAdmin.findUnique.mockResolvedValue(mockSysAdmin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
      prismaService.sysAdmin.update.mockResolvedValue({
        ...mockSysAdmin,
        password: 'hashedNewPassword',
        isUsingDefaultPassword: false,
      });

      await service.updatePassword('admin-123', updateDto);

      // Should compare with default password 'password' instead of currentPassword
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password',
        'hashedDefaultPassword',
      );
    });

    it('should throw ForbiddenException when sysadmin not found', async () => {
      prismaService.sysAdmin.findUnique.mockResolvedValue(null);

      await expect(
        service.updatePassword('non-existent', {
          currentPassword: 'old',
          password: 'new',
          confirmPassword: 'new',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when current password is invalid', async () => {
      const updateDto = {
        currentPassword: 'wrongPassword',
        password: 'newPassword123',
        confirmPassword: 'newPassword123',
      };

      const mockSysAdmin = {
        id: 'admin-123',
        email: 'admin@example.com',
        password: 'hashedPassword',
        isUsingDefaultPassword: false,
      };

      prismaService.sysAdmin.findUnique.mockResolvedValue(mockSysAdmin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.updatePassword('admin-123', updateDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
