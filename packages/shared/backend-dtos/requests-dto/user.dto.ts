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
});

export const SetCompanyAdminSchema = z.object({
  isCompanyAdmin: z.boolean(),
});

export const SetCompanyManagerSchema = z.object({
  isCompanyManager: z.boolean(),
});

export type SysAdminCreateUserDto = z.infer<typeof SysAdminCreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type SetUserPermissionsDto = z.infer<typeof SetUserPermissionsSchema>;
export type SetCompanyAdminDto = z.infer<typeof SetCompanyAdminSchema>;
export type SetCompanyManagerDto = z.infer<typeof SetCompanyManagerSchema>;
