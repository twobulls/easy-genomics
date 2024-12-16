import { Laboratory } from "@SharedLib/types/easy-genomics/laboratory";
import { User } from "@SharedLib/types/easy-genomics/user";
import { LaboratoryUser } from "@SharedLib/types/easy-genomics/laboratory-user";
import { Organization } from "@SharedLib/types/easy-genomics/organization";
import { OrganizationUser } from "@SharedLib/types/easy-genomics/organization-user";
import { LaboratoryRun } from "@SharedLib/types/easy-genomics/laboratory-run";
import { createS3Zip } from "./file/create-s3-zip";

export type SnsProcessingOperation = 'CREATE' | 'UPDATE' | 'DELETE';

export type SnsProcessingRecordType = 'Organization' | 'OrganizationUser' | 'Laboratory' | 'LaboratoryUser' | 'LaboratoryRun' | 'User' | 'S3Zip';

export interface SnsProcessingEvent {
  Operation: SnsProcessingOperation,
  Type: SnsProcessingRecordType,
  Record: Organization | OrganizationUser | Laboratory | LaboratoryUser | LaboratoryRun | User | createS3Zip,
}
