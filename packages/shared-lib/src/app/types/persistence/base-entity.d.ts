/**
 * Do not change the following shared type definitions.
 */
export type BaseAttributes = {
  CreatedAt?: string;
  CreatedBy?: string;
  ModifiedAt?: string;
  ModifiedBy?: string;
}

export type OrganizationRoles = {
  OrganizationAdmin?: RoleStatus;
  LabManager?: RoleStatus;
  LabTechnician?: RoleStatus;
}

export type LaboratoryRoles = {
  LabManager?: RoleStatus;
  LabTechnician?: RoleStatus;
}

export type RoleStatus = 'Active' | 'Inactive' | null;
export type Status = 'Active' | 'Inactive';
