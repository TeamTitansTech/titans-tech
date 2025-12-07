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
  BRANCH_PERMISSION_KEY,
  IS_SYS_ADMIN_KEY,
  IS_COMPANY_ADMIN_KEY,
  IS_PUBLIC_KEY,
  IS_AUTHENTICATED_KEY,
} from './auth.decorators';
import {
  BranchPermissionType,
  hasPermissionInBranch,
  hasPermissionInAnyBranch,
  UserWithBranchPermissions,
  Permissions,
} from '@titans-tech/shared/types/permissions';
import { appEnv } from 'src/config/env';
import { JwtPayload, isSysAdmin, ReqWithAuthUser } from 'src/types/request';
import { PrismaService } from '../shared/prisma.service';

type CurrentUserInfo = {
  id: string;
  companyId: string;
  isCompanyAdmin: boolean;
};
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

    const requiresSysAdmin = this.reflector.getAllAndOverride<boolean>(
      IS_SYS_ADMIN_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiresCompanyAdmin = this.reflector.getAllAndOverride<boolean>(
      IS_COMPANY_ADMIN_KEY,
      [context.getHandler(), context.getClass()],
    );

    const isAuthenticated = this.reflector.getAllAndOverride<boolean>(
      IS_AUTHENTICATED_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (
      !requiresSysAdmin &&
      !requiresCompanyAdmin &&
      !requiredPermission &&
      !isPublic &&
      !isAuthenticated
    ) {
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

    // From this point on, we know the user is a regular user (not SysAdmin)
    const currentUser: CurrentUserInfo = await this.prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        companyId: true,
        isCompanyAdmin: true,
      },
    });

    if (!currentUser) {
      throw new UnauthorizedException('User not found');
    }

    // Handle @Authenticated routes - any authenticated user can access
    if (isAuthenticated) {
      return true;
    }

    if (requiresSysAdmin) {
      throw new ForbiddenException(
        'Access denied: Only system administrators can access this resource',
      );
    }

    // Handle @CompanyAdmin routes - only CompanyAdmin can access
    if (requiresCompanyAdmin) {
      if (!currentUser.isCompanyAdmin) {
        throw new ForbiddenException(
          'Access denied: Only company administrators can access this resource',
        );
      }
      return true;
    }

    // Extract branchId from params (URL) or body (POST requests)
    const branchId = request.params?.branchId || request.body?.branchId;
    const companyId = request.params?.companyId;

    this.validateCorrectRouteConfiguration({
      branchId,
      companyId,
      requiredPermission,
    });

    if (branchId) {
      return this.validateBranchAccess(
        currentUser,
        branchId,
        requiredPermission,
      );
    }

    if (companyId) {
      return this.validateCompanyAccess(
        currentUser,
        companyId,
        requiredPermission,
      );
    }

    // TODO: Handle other cases
    return false;
  }

  /**
   * Validates user access to a specific branch
   * Allows access if:
   * 1. User is part of the company AND is a company admin, OR
   * 2. User is part of the branch AND has the required permission
   */
  private async validateBranchAccess(
    payload: CurrentUserInfo,
    branchId: string,
    requiredPermission: BranchPermissionType | undefined,
  ): Promise<boolean> {
    // Verify the branch exists and get its company
    const branch = await this.prisma.companyBranch.findUnique({
      where: { id: branchId },
      select: { companyId: true },
    });

    if (!branch) {
      throw new ForbiddenException('Branch not found');
    }

    // Check if user belongs to the same company
    if (payload.companyId !== branch.companyId) {
      throw new ForbiddenException(
        'Access denied: User not part of this company',
      );
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

    // Construct user object for permission check
    const user: UserWithBranchPermissions = {
      id: payload.id,
      isCompanyAdmin: false, // Already checked above
      branches: [{ branchId, ...(userBranch as unknown as Permissions) }],
    };

    if (!hasPermissionInBranch(user, branchId, requiredPermission)) {
      throw new ForbiddenException(
        `Access denied: Missing required permission '${requiredPermission}' or its prerequisites`,
      );
    }

    return true;
  }

  private async validateCompanyAccess(
    payload: CurrentUserInfo,
    companyId: string,
    requiredPermission?: BranchPermissionType,
  ): Promise<boolean> {
    if (payload.companyId !== companyId) {
      throw new ForbiddenException(
        'Access denied: User not part of this company',
      );
    }

    // If user is company admin, grant access
    if (payload.isCompanyAdmin) {
      return true;
    }

    // If no specific permission required, deny access (requires admin)
    if (!requiredPermission) {
      throw new ForbiddenException(
        'Access denied: Only company administrators can access this resource',
      );
    }

    // Check if user has the required permission in ANY branch of the company
    const userBranches = await this.prisma.userBranch.findMany({
      where: {
        userId: payload.id,
        branch: {
          companyId: companyId,
        },
      },
    });

    if (userBranches.length === 0) {
      throw new ForbiddenException(
        'Access denied: User not part of any branch in this company',
      );
    }

    // Construct user object for permission check
    const user: UserWithBranchPermissions = {
      id: payload.id,
      isCompanyAdmin: false, // Already checked above
      branches: userBranches.map((ub) => ({
        branchId: ub.branchId,
        ...(ub as unknown as Permissions),
      })),
    };

    if (!hasPermissionInAnyBranch(user, requiredPermission)) {
      throw new ForbiddenException(
        `Access denied: Missing required permission '${requiredPermission}' or its prerequisites in all branches`,
      );
    }

    return true;
  }

  /**
   * These errors should only occur at development time
   *
   * If a route has :branchId or :companyId parameter but no permission metadata,
   * it indicates a misconfiguration in the route decorators (we forgot to add BranchPermission decorator)
   *
   * If a route requires a permission but has no :branchId or :companyId parameter,
   * it indicates a misconfiguration as well (we added BranchPermission decorator to a route without context)
   */
  private validateCorrectRouteConfiguration(args: {
    branchId?: string;
    companyId?: string;
    requiredPermission: BranchPermissionType | undefined;
  }) {
    if (!args.requiredPermission && (args.branchId || args.companyId)) {
      throw new ForbiddenException(
        'Access denied: Missing required permission',
      );
    }

    if (args.requiredPermission && !args.branchId && !args.companyId) {
      throw new ForbiddenException(
        'Access denied: No branch or company context provided',
      );
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
