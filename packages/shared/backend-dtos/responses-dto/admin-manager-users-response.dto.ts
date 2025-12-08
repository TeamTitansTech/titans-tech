import { z } from 'zod';

export const AdminManagerUserResponseDtoSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().email(),
  isCompanyAdmin: z.boolean(),
});

export const AdminManagerUsersResponseDtoSchema = z.array(AdminManagerUserResponseDtoSchema);

export type AdminManagerUserResponseDto = z.infer<typeof AdminManagerUserResponseDtoSchema>;
export type AdminManagerUsersResponseDto = z.infer<typeof AdminManagerUsersResponseDtoSchema>;
