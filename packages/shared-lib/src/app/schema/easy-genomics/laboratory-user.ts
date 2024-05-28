import { z } from 'zod';

export const LaboratoryUserSchema = z
  .object({
    LaboratoryId: z.string().uuid(),
    UserId: z.string().uuid(),
    Status: z.enum(['Active', 'Inactive']),
    LabManager: z.boolean(),
    LabTechnician: z.boolean(),
    CreatedAt: z.string().optional(),
    CreatedBy: z.string().optional(),
    ModifiedAt: z.string().optional(),
    ModifiedBy: z.string().optional(),
  })
  .strict();

export const AddLaboratoryUserSchema = z
  .object({
    LaboratoryId: z.string().uuid(),
    UserId: z.string().uuid(),
    Status: z.enum(['Active', 'Inactive']),
    LabManager: z.boolean(),
    LabTechnician: z.boolean(),
  })
  .strict();

export const EditLaboratoryUserSchema = z
  .object({
    LaboratoryId: z.string().uuid(),
    UserId: z.string().uuid(),
    Status: z.enum(['Active', 'Inactive']),
    LabManager: z.boolean(),
    LabTechnician: z.boolean(),
  })
  .strict();
export type EditLaboratoryUser = z.infer<typeof EditLaboratoryUserSchema>;

export const RemoveLaboratoryUserSchema = z
  .object({
    LaboratoryId: z.string().uuid(),
    UserId: z.string().uuid(),
  })
  .strict();

export const RequestLaboratoryUserSchema = z
  .object({
    LaboratoryId: z.string().uuid(),
    UserId: z.string().uuid(),
  })
  .strict();
