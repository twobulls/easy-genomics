import { v4 as uuidv4 } from 'uuid';
import { Laboratory } from './laboratory';
import { LaboratoryUser } from './laboratory-user';
import { Organization } from './organization';
import { OrganizationUser } from './organization-user';
import { User } from './user';

const organizationId = uuidv4();
const laboratoryId = uuidv4();
const userId = uuidv4();

export const organization: Organization = {
  Id: organizationId,
  Name: 'DEPT-Health',
  Country: 'Australia',
  AwsHealthOmicsEnabled: true,
  NextFlowTowerEnabled: false,
  CreatedAt: new Date().toISOString(),
};

export const laboratory: Laboratory = {
  OrganizationId: organizationId,
  Id: laboratoryId,
  Name: 'Microbial Genomics Laboratory',
  Status: 'Active',
  AwsHealthOmicsEnabled: true,
  NextFlowTowerEnabled: false,
  CreatedAt: new Date().toISOString(),
};

export const user: User = {
  Id: userId,
  Email: 'admin.easy-genomics@twobulls.dev',
  Title: 'Dr',
  FirstName: 'Rick',
  LastName: 'Sanchez',
  Status: 'Active',
  CreatedAt: new Date().toISOString(),
};

export const organizationUser: OrganizationUser = {
  OrganizationId: organizationId,
  UserId: userId,
  OrganizationAdmin: 'Active',
  LabManager: 'Active',
  LabTechnician: 'Active',
  CreatedAt: new Date().toISOString(),
};

export const laboratoryUser: LaboratoryUser = {
  LaboratoryId: laboratoryId,
  UserId: userId,
  LabManager: 'Active',
  LabTechnician: 'Active',
  CreatedAt: new Date().toISOString(),
};
