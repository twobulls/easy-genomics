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