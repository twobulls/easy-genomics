import { z } from 'zod';

export const LaboratoryAccessDetailsSchema = z.object({
  Status: z.enum(['Active', 'Inactive']),
});

export const LaboratoryAccessSchema = z.record(z.string(), LaboratoryAccessDetailsSchema);

export const OrganizationAccessDetailsSchema = z.object({
  Status: z.enum(['Active', 'Inactive', 'Invited']),
  LaboratoryAccess: LaboratoryAccessSchema.optional(),
});

export const OrganizationAccessSchema = z.record(z.string(), OrganizationAccessDetailsSchema);

export const UserSchema = z
  .object({
    UserId: z.string().uuid(),
    Email: z.string(),
    Title: z.string().optional(),
    FirstName: z.string().optional(),
    LastName: z.string().optional(),
    PhoneNumber: z.string().optional(),
    Status: z.enum(['Active', 'Inactive', 'Invited']),
    OrganizationAccess: OrganizationAccessSchema.optional(),
    CreatedAt: z.string().optional(),
    CreatedBy: z.string().optional(),
    ModifiedAt: z.string().optional(),
    ModifiedBy: z.string().optional(),
  })
  .strict();

export const CreateUserSchema = z
  .object({
    Email: z.string(),
    Title: z.string().optional(),
    FirstName: z.string().optional(),
    LastName: z.string().optional(),
    PhoneNumber: z.string().optional(),
  })
  .strict();
