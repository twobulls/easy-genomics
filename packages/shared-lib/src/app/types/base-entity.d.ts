/**
 * Do not change the following shared type definitions.
 */
export type BaseAttributes = {
  CreatedAt?: string;
  CreatedBy?: string;
  ModifiedAt?: string;
  ModifiedBy?: string;
}

export type Status = 'Active' | 'Inactive';

export type UserStatus = 'Active' | 'Inactive' | 'Invited';

export type OrgUserStatus = 'Active' | 'Inactive' | 'Invited';

export type RunType = 'AWS HealthOmics' | 'Seqera Cloud';
