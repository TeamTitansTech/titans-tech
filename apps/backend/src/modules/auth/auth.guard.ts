import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import {
  IS_PUBLIC_KEY,
  BRANCH_PERMISSION_KEY,
  BranchPermissionType,
  IS_ADMIN_KEY,
} from './auth.decorators';
import { appEnv } from '../../config/env';
import {
  isRegularUser,
  isSysAdmin,
  JwtPayload,
  ReqWithAuthUser,
  UserJwtPayload,
} from '../../types/request';
import { PrismaService } from '../shared/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const requiredPermission =
      this.reflector.getAllAndOverride<BranchPermissionType>(
        BRANCH_PERMISSION_KEY,
        [context.getHandler(), context.getClass()],
      );

    const isAdmin = this.reflector.getAllAndOverride<boolean>(IS_ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!isAdmin && !requiredPermission && !isPublic) {
      if (appEnv.NODE_ENV == 'development') {
        throw new ForbiddenException(
          'Access denied: No access metadata defined for this route',
        );
      }
      throw new ForbiddenException('Access denied');
    }

    if (isPublic) {
      return true;
    }

    // Extract and verify JWT token
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: appEnv.AUTH_JWT_SECRET,
      });

      // Assigning payload to request object for access in route handlers
      (request as ReqWithAuthUser)['user'] = payload;

      (request as ReqWithAuthUser)['companyId'] =
        this.extractCompanyIdFromTokenOrHeader(request, payload);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    if (isSysAdmin(payload)) {
      const sysAdmin = await this.prisma.sysAdmin.findUnique({
        where: { id: payload.id },
      });

      if (!sysAdmin) {
        throw new UnauthorizedException('System administrator not found');
      }

      return true;
    }

    if (isAdmin) {
      throw new ForbiddenException(
        'Access denied: Only system administrators can access this resource',
      );
    }

    const userPayload = payload;
    const branchId = request.params?.branchId;
    const companyId = this.extractCompanyIdFromTokenOrHeader(
      request,
      userPayload,
    );

    if (companyId && !branchId && !requiredPermission) {
      return this.validateCompanyAccess(userPayload);
    }

    this.validateCorrectRouteConfiguration({
      branchId,
      requiredPermission,
    });

    if (branchId) {
      return this.validateBranchAccess(
        userPayload,
        branchId,
        requiredPermission,
      );
    }

    if (companyId) {
      return this.validateCompanyAccess(userPayload);
    }

    return false;
  }

  /**
   * Validates user access to a specific branch
   * Allows access if:
   * 1. User is part of the company AND is a company admin, OR
   * 2. User is part of the branch AND has the required permission
   */
  private async validateBranchAccess(
    payload: UserJwtPayload,
    branchId: string,
    requiredPermission: BranchPermissionType | undefined,
  ): Promise<boolean> {
    // Verify the branch exists and get its company
    const branch = await this.prisma.companyBranch.findUnique({
      where: { id: branchId, companyId: payload.companyId },
      select: { companyId: true },
    });

    if (!branch) {
      throw new ForbiddenException('Branch not found');
    }

    // If user is company admin, grant access
    if (payload.isCompanyAdmin) {
      return true;
    }

    // Check user's branch membership and permissions
    const userBranch = await this.prisma.userBranch.findUnique({
      where: {
        userId_branchId: {
          userId: payload.id,
          branchId: branchId,
        },
      },
    });

    if (!userBranch) {
      throw new ForbiddenException(
        'Access denied: User not part of this branch',
      );
    }

    if (!userBranch[requiredPermission]) {
      throw new ForbiddenException(
        `Access denied: Missing required permission '${requiredPermission}'`,
      );
    }

    return true;
  }

  private async validateCompanyAccess(
    payload: UserJwtPayload,
  ): Promise<boolean> {
    if (!payload.isCompanyAdmin) {
      throw new ForbiddenException(
        'Access denied: Only company administrators can access this resource',
      );
    }

    return true;
  }

  /**
   * These errors should only occur at development time
   *
   * If a route has :branchId parameter but no permission metadata,
   * it indicates a misconfiguration in the route decorators (we forgot to add BranchPermission decorator)
   *
   * If a route requires a permission but has no :branchId parameter,
   * it indicates a misconfiguration as well (we added BranchPermission decorator to a route without context)
   */
  private validateCorrectRouteConfiguration(args: {
    branchId?: string;
    requiredPermission: BranchPermissionType | undefined;
  }) {
    if (!args.requiredPermission && args.branchId) {
      throw new ForbiddenException(
        'Access denied: Missing required permission',
      );
    }

    if (args.requiredPermission && !args.branchId) {
      throw new ForbiddenException('Access denied: No branch context provided');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractCompanyIdFromTokenOrHeader(
    request: Request,
    payload: JwtPayload,
  ) {
    const companyIdFromToken = isRegularUser(payload)
      ? payload.companyId
      : undefined;

    const companyId =
      companyIdFromToken ??
      (request.headers['x-company-id'] as string | undefined);
    return companyId ?? '';
  }
}
