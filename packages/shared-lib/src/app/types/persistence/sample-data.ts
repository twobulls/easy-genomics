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
  OrganizationId: organizationId,
  Name: 'Test Organization',
  Country: 'Australia',
  AwsAccount: '1234567890',
  AwsRegion: 'ap-southeast-2',
  CreatedAt: new Date().toISOString(),
  CreatedBy: userId,
};

export const user: User = {
  UserId: userId,
  Title: 'Dr',
  FirstName: 'Rick',
  LastName: 'Sanchez',
  Email: 'admin.easy-genomics@twobulls.dev',
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

export const laboratory: Laboratory = {
  OrganizationId: organizationId,
  LaboratoryId: laboratoryId,
  Name: 'Test Laboratory',
  OmicsAccess: true,
  NextflowAccess: false,
  CreatedAt: new Date().toISOString(),
  CreatedBy: userId,
};

export const laboratoryUser: LaboratoryUser = {
  LaboratoryId: laboratoryId,
  UserId: userId,
  LabManager: 'Active',
  CreatedAt: new Date().toISOString(),
};
