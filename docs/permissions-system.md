# Permissions System Documentation

## Overview

Titans Tech implements a comprehensive role-based access control (RBAC) system with a three-tier hierarchy and granular, branch-specific permissions. This document provides technical details for developers working with the permissions system.

## Architecture

### Three-Tier Hierarchy

The system implements three distinct hierarchy levels within each company:

#### 1. Company Administrator (Admin da empresa)

- **Database Field**: `User.isCompanyAdmin = true`
- **Scope**: Company-wide access across all branches
- **Capabilities**:
  - Full access to all resources in all branches
  - Can promote users to Company Manager
  - Can manage all users, machines, services, and blueprints
  - Cannot be demoted except by System Administrators
  - **Limit**: Only ONE Company Admin per company

#### 2. Company Manager (Gerente)

- **Database Field**: `User.isCompanyManager = true`
- **Scope**: Company-wide access across all branches
- **Capabilities**:
  - Full access to all resources in all branches (same as Company Admin)
  - Can manage users, machines, services, and blueprints
  - Can be promoted/demoted by Company Admins or System Admins
  - **Limit**: Multiple managers allowed per company

#### 3. Regular Users (Usuarios)

- **Database Fields**: Both `isCompanyAdmin` and `isCompanyManager` are `false`
- **Scope**: Branch-specific access controlled by `UserBranch` permissions
- **Capabilities**: Defined by 14 granular permission flags in the `UserBranch` junction table
- **Subtypes**:
  - **Branch Manager**: User with full permissions for a specific branch
  - **Worker/Employee**: User with limited operational permissions

### Database Schema

#### User Model

```prisma
model User {
  id                     String  @id @default(cuid())
  name                   String?
  email                  String  @unique
  password               String
  isCompanyAdmin         Boolean @default(false)
  isCompanyManager       Boolean @default(false)
  isUsingDefaultPassword Boolean @default(true)

  company   Company      @relation(fields: [companyId], references: [id])
  companyId String
  branches  UserBranch[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### UserBranch Junction Model

```prisma
model UserBranch {
  user      User          @relation(fields: [userId], references: [id])
  userId    String
  branch    CompanyBranch @relation(fields: [branchId], references: [id])
  branchId  String

  // User Management Permissions (6)
  readUsers             Boolean @default(false)
  createUsers           Boolean @default(false)
  updateUsers           Boolean @default(false)
  deleteUsers           Boolean @default(false)
  manageUserPermissions Boolean @default(false)
  assignUsersToBranches Boolean @default(false)

  // Branch Management Permissions (2)
  readBranches   Boolean @default(false)
  updateBranches Boolean @default(false)

  // Machine Permissions (4)
  readMachines   Boolean @default(false)
  createMachines Boolean @default(false)
  updateMachines Boolean @default(false)
  deleteMachines Boolean @default(false)

  // Service Permissions (4)
  readServices   Boolean @default(false)
  createServices Boolean @default(false)
  updateServices Boolean @default(false)
  deleteServices Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@id([userId, branchId])
}
```

## Permission Categories

The 14 granular permissions are organized into 4 functional categories:

### 1. User Management (6 permissions)

- `readUsers` - View user lists and profiles
- `createUsers` - Add new users to the branch
- `updateUsers` - Edit user information
- `deleteUsers` - Remove users from branch or company
- `manageUserPermissions` - Modify user permissions within the branch
- `assignUsersToBranches` - Add users to different branches

### 2. Branch Management (2 permissions)

- `readBranches` - View branch information
- `updateBranches` - Modify branch details

### 3. Machine Management (4 permissions)

- `readMachines` - View machine instances
- `createMachines` - Register new machines
- `updateMachines` - Modify machine details
- `deleteMachines` - Remove machines

### 4. Service Management (4 permissions)

- `readServices` - View inspection/maintenance records
- `createServices` - Create new service records
- `updateServices` - Modify service records
- `deleteServices` - Remove service records

## Backend Implementation

### Authentication Decorators

**Location**: `apps/backend/src/modules/auth/auth.decorators.ts`

The system provides several decorators for endpoint protection:

```typescript
// System Administrator only
@Admin()

// Company Administrator only
@CompanyAdmin()

// Company Manager or Administrator
@CompanyManager()

// Any authenticated user
@Authenticated()

// Specific branch permission required
@BranchPermission('permissionName')

// No authentication required
@Public()
```

### Permission Types

```typescript
export type BranchPermissionType =
  | 'readUsers'
  | 'createUsers'
  | 'updateUsers'
  | 'deleteUsers'
  | 'manageUserPermissions'
  | 'assignUsersToBranches'
  | 'readBranches'
  | 'updateBranches'
  | 'readMachines'
  | 'createMachines'
  | 'updateMachines'
  | 'deleteMachines'
  | 'readServices'
  | 'createServices'
  | 'updateServices'
  | 'deleteServices';
```

### Auth Guard Logic

**Location**: `apps/backend/src/modules/auth/auth.guard.ts`

The `AuthGuard` implements the following validation flow:

1. **Public Routes**: Allow without authentication
2. **System Admin Check**: System Admins bypass all permission checks
3. **Authenticated Routes**: Any authenticated user allowed
4. **Company Admin Routes**: Requires `isCompanyAdmin = true`
5. **Company Manager Routes**: Requires `isCompanyManager = true` OR `isCompanyAdmin = true`
6. **Branch Permission Routes**: Complex validation

#### Branch Access Validation

```typescript
async validateBranchAccess(
  payload: CurrentUserInfo,
  branchId: string,
  requiredPermission: BranchPermissionType | undefined,
): Promise<boolean> {
  // 1. Verify branch exists and belongs to user's company
  const branch = await this.prisma.companyBranch.findUnique({
    where: { id: branchId },
    select: { companyId: true },
  });

  if (!branch) {
    throw new NotFoundException('Branch not found');
  }

  if (payload.companyId !== branch.companyId) {
    throw new ForbiddenException('Access denied: User not part of this company');
  }

  // 2. Company Admins and Managers get automatic access
  if (payload.isCompanyAdmin || payload.isCompanyManager) {
    return true;
  }

  // 3. Check UserBranch permissions for regular users
  const userBranch = await this.prisma.userBranch.findUnique({
    where: {
      userId_branchId: { userId: payload.id, branchId: branchId }
    }
  });

  if (!userBranch) {
    throw new ForbiddenException('Access denied: User not assigned to this branch');
  }

  if (requiredPermission && !userBranch[requiredPermission]) {
    throw new ForbiddenException(
      `Access denied: Missing required permission '${requiredPermission}'`
    );
  }

  return true;
}
```

### The `/me` Endpoint

**Location**: `apps/backend/src/modules/users/users.controller.ts`

The `/me` endpoint returns the current user's information with all branch permissions:

```typescript
@Authenticated()
@Get('me')
async getMe(@Request() req: ReqWithAuthUser) {
  return this.usersService.getMe(req.user.id);
}
```

#### Special Handling for Admins/Managers

The service implementation includes special logic for Company Admins and Managers:

```typescript
async getMe(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: { branches: { include: { branch: true } } },
  });

  // If user is Company Admin or Manager, grant access to ALL branches
  if (user.isCompanyAdmin || user.isCompanyManager) {
    const allBranches = await this.prisma.companyBranch.findMany({
      where: { companyId: user.companyId },
    });

    // Create synthetic UserBranch objects with ALL permissions set to true
    const userBranches = allBranches.map((branch) => ({
      userId: user.id,
      branchId: branch.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      // All 14 permissions set to true
      readUsers: true,
      createUsers: true,
      updateUsers: true,
      deleteUsers: true,
      manageUserPermissions: true,
      assignUsersToBranches: true,
      readBranches: true,
      updateBranches: true,
      readMachines: true,
      createMachines: true,
      updateMachines: true,
      deleteMachines: true,
      readServices: true,
      createServices: true,
      updateServices: true,
      deleteServices: true,
      branch: branch,
    }));

    return new UserResponseDto({ ...user, branches: userBranches });
  }

  // Regular users get their actual UserBranch records
  return new UserResponseDto(user);
}
```

**Key Points**:

- Company Admins and Managers don't have `UserBranch` records in the database
- They receive synthetic branch permissions with all flags set to `true`
- This approach keeps the database clean while providing full access
- Regular users receive their actual `UserBranch` records with real permissions

## API Endpoints

### User Management

#### Get Current User

```http
GET /users/me
Authorization: Bearer <token>
```

Returns: `UserResponseDto` with branches array and all permissions

#### Create User in Branch

```http
POST /company-branches/:branchId/users
Authorization: Bearer <token>
Permission: @BranchPermission('createUsers')

Body: {
  name: string
  email: string
  password: string (default: "password")
  permissions: { ...14 permission flags... }
}
```

#### Update User Permissions

```http
PATCH /company-branches/:branchId/users/:userId/permissions
Authorization: Bearer <token>
Permission: @BranchPermission('manageUserPermissions')

Body: {
  readUsers: boolean
  createUsers: boolean
  // ... all 14 permissions
}
```

#### Set Company Admin

```http
PATCH /company-branches/:branchId/users/:userId/company-admin
Authorization: Bearer <token>
Permission: @Admin() (System Admin only)

Body: {
  isCompanyAdmin: boolean
}
```

**Validation**: Only ONE Company Admin per company

#### Set Company Manager

```http
PATCH /company-branches/:branchId/users/:userId/company-manager
Authorization: Bearer <token>
Permission: @CompanyAdmin() (Company Admin or System Admin)

Body: {
  isCompanyManager: boolean
}
```

**Validation**: Multiple managers allowed per company

#### Assign User to Branch

```http
POST /company-branches/:branchId/users/:userId
Authorization: Bearer <token>
Permission: @BranchPermission('assignUsersToBranches')

Body: {
  permissions: { ...14 permission flags... }
}
```

#### Remove User from Branch

```http
DELETE /company-branches/:branchId/users/:userId
Authorization: Bearer <token>
Permission: @BranchPermission('deleteUsers')
```

## Frontend Integration

### CompanyUserContext

**Location**: `apps/dashboard/src/contexts/CompanyUserContext.tsx`

The `CompanyUserContext` provides the current user's information throughout the client portal:

```typescript
interface CompanyUserContextType {
  companyUser: UserResponseDto | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const { companyUser } = useCompanyUser();

// Access user info
companyUser.id;
companyUser.email;
companyUser.name;
companyUser.isCompanyAdmin;
companyUser.isCompanyManager;
companyUser.branches; // Array of UserBranchDto
```

### Permission Checking Pattern

```typescript
// Check if user has specific permission for a branch
const canCreateUsers =
  companyUser?.isCompanyAdmin ||
  companyUser?.isCompanyManager ||
  companyUser?.branches?.some((b) => b.branchId === branchId && b.createUsers);

// Check if user is Admin or Manager
const isAdminOrManager = companyUser?.isCompanyAdmin || companyUser?.isCompanyManager;

// Get permissions for specific branch
const branchPermissions = companyUser?.branches?.find((b) => b.branchId === branchId);
```

### Role Detection

The UI determines a user's display role based on their permissions:

```typescript
function getUserRole(user: UserResponseDto, branchId: string): string {
  // Company-level roles
  if (user.isCompanyAdmin) return 'companyAdmin';
  if (user.isCompanyManager) return 'companyManager';

  // Branch-level roles
  const branchPerms = user.branches?.find((b) => b.branchId === branchId);
  if (!branchPerms) return 'none';

  // Check if has manager permissions
  const hasManagerPermissions =
    branchPerms.createUsers || branchPerms.manageUserPermissions || branchPerms.updateBranches;

  if (hasManagerPermissions) return 'branchManager';

  // Default to employee
  return 'employee';
}
```

## Role Presets

The UI provides predefined role templates for quick user setup:

### Manager Preset

All 14 permissions set to `true`:

- Full control of the branch
- Can manage users, machines, services
- Can modify branch settings

### Worker/Employee Preset

Operational permissions only:

- `readUsers: true`
- `readBranches: true`
- `readMachines: true`
- `readServices: true`
- `createServices: true`
- `updateServices: true`

### Custom

Users can also set individual permissions as needed.

## Security Considerations

### 1. Password Security

- New users receive default password: `"password"` (hashed with bcrypt)
- `isUsingDefaultPassword: true` flag forces password change on first login
- Passwords hashed using bcrypt with appropriate salt rounds

### 2. JWT Tokens

- Stored in HTTP-only cookies
- Include user ID, company ID, and hierarchy flags
- Validated on each request by `AuthGuard`

### 3. Permission Inheritance

- Company Admins and Managers automatically bypass permission checks
- No need to create `UserBranch` records for them
- Synthetic permissions generated in `/me` endpoint

### 4. Branch Isolation

- Users can only access branches within their company
- Branch validation occurs before permission checks
- Cross-company access is strictly forbidden

### 5. Company Admin Protection

- Only ONE Company Admin per company (enforced in backend)
- Only System Admins can promote/demote Company Admins
- Company Admins cannot be removed by other Company Admins

### 6. Manager Removal Protection

- Only Company Admins or System Admins can remove Manager status
- Prevents managers from removing each other
- Multiple managers allowed for redundancy

## Testing Checklist

When testing the permissions system:

- [ ] System Admin can promote users to Company Admin
- [ ] Only one Company Admin per company is enforced
- [ ] Company Admin can promote users to Company Manager
- [ ] Multiple Company Managers can coexist
- [ ] Company Admins have access to all branches
- [ ] Company Managers have access to all branches
- [ ] Regular users only access assigned branches
- [ ] Permission checks work correctly for each of the 14 permissions
- [ ] Branch isolation prevents cross-company access
- [ ] `/me` endpoint returns synthetic permissions for Admins/Managers
- [ ] Role presets apply correct permission sets
- [ ] Custom permissions can be set individually
- [ ] Users can belong to multiple branches with different permissions
- [ ] Password reset flow works for default passwords

## Common Patterns

### Check Permission Before Showing UI

```typescript
const canEdit = companyUser?.branches
  ?.find(b => b.branchId === branchId)
  ?.updateMachines;

return canEdit ? <EditButton /> : null;
```

### Require Admin or Manager

```typescript
if (!companyUser?.isCompanyAdmin && !companyUser?.isCompanyManager) {
  return <Unauthorized />;
}
```

### Get All Accessible Branches

```typescript
const accessibleBranches = companyUser?.branches?.map((b) => b.branch) || [];
```

### Check Multiple Permissions

```typescript
const hasFullAccess =
  branchPerms?.readServices &&
  branchPerms?.createServices &&
  branchPerms?.updateServices &&
  branchPerms?.deleteServices;
```

## Migration Guide

If you're adding new permissions:

1. Add to `BranchPermissionType` in `auth.decorators.ts`
2. Add boolean field to `UserBranch` model in `schema.prisma`
3. Run `npm run db:generate` and create migration
4. Update `/me` endpoint to include new permission in synthetic branches
5. Add to permission presets (Manager/Worker)
6. Update UI components to show new permission
7. Add translations for new permission name/description

## Related Files

**Backend:**

- `apps/backend/src/modules/auth/auth.decorators.ts` - Auth decorators
- `apps/backend/src/modules/auth/auth.guard.ts` - Permission guard
- `apps/backend/src/modules/users/users.service.ts` - User service
- `apps/backend/src/modules/users/users.controller.ts` - User endpoints
- `apps/backend/src/modules/company-branches/company-branches.controller.ts` - Branch user endpoints

**Database:**

- `packages/database/prisma/schema.prisma` - Models (lines 380-439)

**Shared:**

- `packages/shared/backend-dtos/responses-dto/user-response.dto.ts` - User DTO
- `packages/shared/backend-dtos/requests-dto/user.dto.ts` - User request schemas

**Frontend:**

- `apps/dashboard/src/contexts/CompanyUserContext.tsx` - User context
- `apps/dashboard/src/app/s/[subdomain]/settings/` - Settings UI
