import z from 'zod';
import { ALL_PERMISSION_KEYS, type PermissionRecord } from '../../types/permissions';

export const CreateUserSchema = z.object({
  email: z.email(),
  name: z.string().min(1),
});

export const SysAdminCreateUserSchema = CreateUserSchema.extend({
  isCompanyAdmin: z.boolean().optional().default(false),
});

export const UpdateUserSchema = z.object({
  email: z.email().optional(),
  name: z.string().min(1).optional(),
});

/**
 * Schema for setting user permissions
 * Generated from ALL_PERMISSION_KEYS (derived from PERMISSION_DEPENDENCIES in permissions.ts)
 */
export const SetUserPermissionsSchema = z.object(
  Object.fromEntries(
    ALL_PERMISSION_KEYS.map((key) => [key, z.boolean().optional()]),
  ) as PermissionRecord<z.ZodOptional<z.ZodBoolean>>,
);

export const SetCompanyAdminSchema = z.object({
  isCompanyAdmin: z.boolean(),
});

/**
 * Update user permissions with optional multi-branch support
 */
export const UpdateUserPermissionsSchema = SetUserPermissionsSchema.extend({
  applyToAllBranches: z.boolean().optional().default(false),
});

/**
 * Update user information (name, email)
 */
export const UpdateUserInfoSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

/**
 * Combined schema for updating user info, permissions, and role
 */
export const UpdateUserCompleteSchema = z.object({
  // Basic user info
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),

  // Permissions (all optional)
  permissions: SetUserPermissionsSchema.optional(),

  // Apply permissions to all branches
  applyToAllBranches: z.boolean().optional().default(false),
});

/**
 * Delete user request options
 */
export const DeleteUserSchema = z.object({
  scope: z.enum(['branch', 'company']).default('branch'),
});

/**
 * Reactivate user request options
 */
export const ReactivateUserSchema = z.object({
  scope: z.enum(['branch', 'company']).default('branch'),
});

export type SysAdminCreateUserDto = z.infer<typeof SysAdminCreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type SetUserPermissionsDto = z.infer<typeof SetUserPermissionsSchema>;
export type SetCompanyAdminDto = z.infer<typeof SetCompanyAdminSchema>;
export type UpdateUserPermissionsDto = z.infer<typeof UpdateUserPermissionsSchema>;
export type UpdateUserInfoDto = z.infer<typeof UpdateUserInfoSchema>;
export type UpdateUserCompleteDto = z.infer<typeof UpdateUserCompleteSchema>;
export type DeleteUserDto = z.infer<typeof DeleteUserSchema>;
export type ReactivateUserDto = z.infer<typeof ReactivateUserSchema>;
