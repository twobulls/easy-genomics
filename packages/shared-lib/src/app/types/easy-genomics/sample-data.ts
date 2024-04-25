import { Laboratory } from './laboratory';
import { LaboratoryUser } from './laboratory-user';
import { Organization } from './organization';
import { OrganizationUser } from './organization-user';
import { UniqueReference } from './unique-reference';
import { User } from './user';

const organizationId = '61c86013-74f2-4d30-916a-70b03a97ba14';
const laboratoryId = 'bbac4190-0446-4db4-a084-cfdbc8102297';
const userId = 'c6705721-90ba-4d4a-9460-af2828bb4181';

export const organization: Organization = {
  OrganizationId: organizationId,
  Name: 'DEPT-Health',
  Country: 'Australia',
  AwsHealthOmicsEnabled: true,
  NextFlowTowerEnabled: false,
  CreatedAt: new Date().toISOString(),
};

export const laboratory: Laboratory = {
  OrganizationId: organizationId,
  LaboratoryId: laboratoryId,
  Name: 'Microbial Genomics Laboratory',
  Status: 'Active',
  AwsHealthOmicsEnabled: organization.AwsHealthOmicsEnabled,
  NextFlowTowerEnabled: organization.NextFlowTowerEnabled,
  CreatedAt: new Date().toISOString(),
};

export const user: User = {
  UserId: userId,
  Email: 'test.user@easygenomics.org',
  Title: 'Dr',
  FirstName: 'Rick',
  LastName: 'Sanchez',
  Status: 'Active',
  CreatedAt: new Date().toISOString(),
};

export const organizationUser: OrganizationUser = {
  OrganizationId: organizationId,
  UserId: userId,
  Status: 'Active',
  OrganizationAdmin: true,
  CreatedAt: new Date().toISOString(),
};

export const laboratoryUser: LaboratoryUser = {
  LaboratoryId: laboratoryId,
  UserId: userId,
  Status: 'Active',
  LabManager: true,
  LabTechnician: true,
  CreatedAt: new Date().toISOString(),
};

export const uniqueReferences: UniqueReference = {
  Value: 'DEPT-Health',
  Type: 'organization-name',
};