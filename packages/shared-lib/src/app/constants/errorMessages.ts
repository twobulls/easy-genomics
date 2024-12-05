import { ErrorMessages } from '../types/easy-genomics/errors';

export const ERROR_CODES: ErrorMessages = {
  'EG-101': 'Not Found',
  'EG-102': 'Required field is missing or Invalid request',
  'EG-103': 'Unauthorized access',
  'EG-110': 'Expired organization access',
  'EG-201': 'Organization already exists',
  'EG-202': 'Organization deletion failed',
  'EG-203': 'Organization not found',
  'EG-204': 'Organization name already taken',
  'EG-211': 'Organization User already exists',
  'EG-212': 'Removing user from organization failed',
  'EG-213': 'Organization User not found',
  'EG-214': 'Unable to find Users for Organization',
  'EG-215': 'User Organization Status error',
  'EG-301': 'Laboratory already exists',
  'EG-302': 'Laboratory deletion failed',
  'EG-303': 'Laboratory not found',
  'EG-304': 'Laboratory name already taken',
  'EG-305': 'Unable to find Laboratories for Organization',
  'EG-306': 'Laboratory WorkspaceId unavailable',
  'EG-307': 'Laboratory Access Token unavailable',
  'EG-308': 'Laboratory WorkspaceId or Access Token is incorrect',
  'EG-311': 'Laboratory User already exists',
  'EG-312': 'Removing user from laboratory failed',
  'EG-313': 'Laboratory User not found',
  'EG-314': 'Laboratory Bucket not found',
  'EG-315': 'Laboratory does not have AWS HealthOmics enabled',
  'EG-316': 'Laboratory does not have Seqera Cloud / NextFlow Tower enabled',
  'EG-401': 'User already exists',
  'EG-402': 'User deletion failed',
  'EG-403': 'User not found',
  'EG-404': 'User name already taken',
  'EG-405': 'User not permitted access without first granted access to the Organization',
};

/**
 * Error messages generated by backend and optionally used by frontend logic
 */
export const ERROR_MESSAGES = {
  invitationAlreadyActivated: 'User invitation to access Organization is already activated.',
};
