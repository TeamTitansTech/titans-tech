import z from 'zod';

export const CreateUserSchema = z.object({
  email: z.email(),
  name: z.string().min(1),
});

export const SysAdminCreateUserSchema = CreateUserSchema.extend({
  isCompanyAdmin: z.boolean().optional().default(false),
  isCompanyManager: z.boolean().optional().default(false),
});

export const UpdateUserSchema = z.object({
  email: z.email().optional(),
  name: z.string().min(1).optional(),
});

export const SetUserPermissionsSchema = z.object({
  // User Management Permissions
  readUsers: z.boolean().optional(),
  createUsers: z.boolean().optional(),
  updateUsers: z.boolean().optional(),
  deleteUsers: z.boolean().optional(),
  manageUserPermissions: z.boolean().optional(),
  assignUsersToBranches: z.boolean().optional(),

  // Branch Management Permissions
  readBranches: z.boolean().optional(),
  updateBranches: z.boolean().optional(),

  // Blueprint Permissions
  readBlueprints: z.boolean().optional(),
  createBlueprints: z.boolean().optional(),
  updateBlueprints: z.boolean().optional(),
  deleteBlueprints: z.boolean().optional(),

  // Machine Permissions
  readMachines: z.boolean().optional(),
  createMachines: z.boolean().optional(),
  updateMachines: z.boolean().optional(),
  deleteMachines: z.boolean().optional(),

  // Inspection Permissions
  readServices: z.boolean().optional(),
  createServices: z.boolean().optional(),
  updateServices: z.boolean().optional(),
  deleteServices: z.boolean().optional(),

  // Production Line Permissions
  readProductionLines: z.boolean().optional(),
  createProductionLines: z.boolean().optional(),
  updateProductionLines: z.boolean().optional(),
  deleteProductionLines: z.boolean().optional(),
});

export const SetCompanyAdminSchema = z.object({
  isCompanyAdmin: z.boolean(),
});

export const SetCompanyManagerSchema = z.object({
  isCompanyManager: z.boolean(),
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

  // Role management (Company Admin/Manager only can set)
  isCompanyManager: z.boolean().optional(),
});

/**
 * Delete user request options
 */
export const DeleteUserSchema = z.object({
  scope: z.enum(['branch', 'company']).default('branch'),
});

export type SysAdminCreateUserDto = z.infer<typeof SysAdminCreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type SetUserPermissionsDto = z.infer<typeof SetUserPermissionsSchema>;
export type SetCompanyAdminDto = z.infer<typeof SetCompanyAdminSchema>;
export type SetCompanyManagerDto = z.infer<typeof SetCompanyManagerSchema>;
export type UpdateUserPermissionsDto = z.infer<typeof UpdateUserPermissionsSchema>;
export type UpdateUserInfoDto = z.infer<typeof UpdateUserInfoSchema>;
export type UpdateUserCompleteDto = z.infer<typeof UpdateUserCompleteSchema>;
export type DeleteUserDto = z.infer<typeof DeleteUserSchema>;
