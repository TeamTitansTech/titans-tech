import z from 'zod';

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
  isCompanyAdmin: z.boolean().optional(),
});

export type SysAdminCreateUserDto = z.infer<typeof SysAdminCreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
