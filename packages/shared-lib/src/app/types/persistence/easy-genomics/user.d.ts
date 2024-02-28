/**
 * The following User model represents the data stored in the user-table for
 * an EasyGenomics User's account details & preferences.
 *
 * The UserId serves as the Hash Key and is unique, and cannot be modified
 * after creation.
 *
 * The User Email is modifiable but it is enforced to be unique via a
 * transaction that checks the 'unique-reference-table' for uniqueness.
 *
 * {
 *   UserId: <string>,
 *   Email: <string>,
 *   Title?: 'Prof' | 'Dr' | 'Mr' | 'Mrs' | 'Ms',
 *   PreferredName?: <string>,
 *   FirstName?: <string>,
 *   LastName?: <string>,
 *   PhoneNumber?: <string>,
 *   Status: 'Active' | 'Inactive',
 *   CreatedAt?: <string>,
 *   CreatedBy?: <string>,
 *   ModifiedAt?: <string>,
 *   ModifiedBy?: <string>,
 * }
 */
import { BaseAttributes, Status } from '../base-entity';

export interface User extends BaseAttributes {
  UserId: string; // DynamoDB Partition Key (String)
  Email: string;
  Title?: UserTitle;
  PreferredName?: string;
  FirstName?: string;
  LastName?: string;
  PhoneNumber?: string;
  Status: Status;
}

export type UserTitle = 'Prof' | 'Dr' | 'Mr' | 'Mrs' | 'Ms';
