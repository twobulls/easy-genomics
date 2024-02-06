/**
 * The following User model represents the data stored in the user-table for
 * an EasyGenomics User's account details & preferences.
 *
 * {
 *   UserId: <UUID>,
 *   Title?: 'Prof' | 'Dr' | 'Mr' | 'Mrs' | 'Ms',
 *   PreferredName?: <string>,
 *   FirstName?: <string>,
 *   LastName?: <string>,
 *   Email: <string>,
 *   PhoneNumber?: <string>,
 *   Status: 'Active' | 'Inactive',
 *   CreatedAt?: <string>,
 *   CreatedBy?: <string>,
 *   ModifiedAt?: <string>,
 *   ModifiedBy?: <string>,
 * }
 */
import { BaseAttributes, Status } from './base-entity';

export interface User extends BaseAttributes {
  UserId: string; // DynamoDB Partition Key (UUID)
  Title?: UserTitle;
  PreferredName?: string;
  FirstName?: string;
  LastName?: string;
  Email: string; // GSI
  PhoneNumber?: string;
  Status: Status;
}

export type UserTitle = 'Prof' | 'Dr' | 'Mr' | 'Mrs' | 'Ms';
