/**
 * The following LaboratoryUserDetails model defines the DTO for the
 * /easy-genomics/laboratory/user/laboratory-user-details API response
 * for display in the FE.
 *
 * {
 *   UserId: <string>,
 *   LaboratoryId: <string>,
 *   LabManager: <boolean>,
 *   LabTechnician: <boolean>,
 *   UserDisplayName?: <string>,
 *   UserEmail?: <string>
 * }
 */

export interface LaboratoryUserDetails {
  UserId: string;
  LaboratoryId: string;
  LabManager: boolean;
  LabTechnician: boolean;
  UserDisplayName?: string;
  UserEmail?: string;
}
