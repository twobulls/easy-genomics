export default class HttpError extends Error {
  public statusCode: number;
  public errorCode: string;

  constructor(
    public rawMessage: string | Record<string, any> | undefined,
    statusCode: number,
    errorCode: string,
  ) {
    super(typeof rawMessage === 'object' ? JSON.stringify(rawMessage) : rawMessage);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

/**
 * Simple wrapper for a 404 error
 *
 * Is a pre-configured error with:
 * - StatusCode: 404
 */
export class NotFoundError extends HttpError {
  constructor(message?: string) {
    super(message, 404, 'EG-101');
  }
}

/**
 * Missing ID in path error
 *
 * @param field - optional
 */
export class RequiredIdNotFoundError extends HttpError {
  constructor(field: string = 'id') {
    super(`Required ${field} is missing`, 400, 'EG-102');
  }
}

/**
 * Invalid body parameters request
 */
export class InvalidRequestError extends HttpError {
  constructor() {
    super('Invalid request', 400, 'EG-102');
  }
}

// User Access

/**
 * User name does not have the required access for the endpoint
 */
export class UnauthorizedAccessError extends HttpError {
  constructor() {
    super('Unauthorized access', 403, 'EG-103');
  }
}

/**
 * The users organization access in Authorizer is out of date
 */
export class ExpiredOrganizationAccessError extends HttpError {
  constructor() {
    super('Expired organization access', 409, 'EG-110');
  }
}

// Organization Errors

/**
 * Organization already exists
 */
export class OrganizationAlreadyExistsError extends HttpError {
  constructor() {
    super('Organization already exists', 400, 'EG-201');
  }
}

/**
 * Organization failed to delete
 */
export class OrganizationDeleteFailedError extends HttpError {
  constructor() {
    super('Organization deletion failed', 500, 'EG-202');
  }
}

/**
 * Organization not found
 */
export class OrganizationNotFoundError extends HttpError {
  constructor() {
    super('Organization Not Found', 404, 'EG-203');
  }
}

/**
 * Organization name is already taken by another resource
 */
export class OrganizationNameTakenError extends HttpError {
  constructor() {
    super('Organization name already taken', 409, 'EG-204');
  }
}

// Organization Users

/**
 * Organization User already exists
 */
export class OrganizationUserAlreadyExistsError extends HttpError {
  constructor() {
    super('Organsiation User already exists', 400, 'EG-211');
  }
}

/**
 * Organization User failed to delete
 */
export class OrganizationUserDeleteFailedError extends HttpError {
  constructor() {
    super('Removing user from organization failed', 500, 'EG-212');
  }
}

/**
 * Organization User not found
 *
 * @param organizationId
 * @param userId
 */
export class OrganizationUserNotFoundError extends HttpError {
  constructor(organizationId: string, userId: string) {
    super(`User '${userId}' for organization '${organizationId}' could not be found`, 404, 'EG-213');
  }
}

/**
 * Organization has no users
 */
export class NoUsersFoundError extends HttpError {
  constructor() {
    super('Unable to find Users for Organization', 404, 'EG-214');
  }
}

/**
 * Organization User status can not reverted to Invited
 */
export class OrganizationUserStatusError extends HttpError {
  constructor(status: string) {
    super(`User Organization Status already '${status}', cannot update Status to 'Invited'`, 409, 'EG-215');
  }
}

// Laboratory Errors

/**
 * Laboratory already exists
 */
export class LaboratoryAlreadyExistsError extends HttpError {
  constructor() {
    super('Laboratory already exists', 400, 'EG-301');
  }
}

/**
 * Laboratory failed to delete
 */
export class LaboratoryDeleteFailedError extends HttpError {
  constructor() {
    super('Laboratory deletion failed', 500, 'EG-302');
  }
}

/**
 * Laboratory not found
 */
export class LaboratoryNotFoundError extends HttpError {
  constructor() {
    super('Laboratory Not Found', 404, 'EG-303');
  }
}

/**
 * Laboratory name is already taken by another resource
 */
export class LaboratoryNameTakenError extends HttpError {
  constructor() {
    super('Laboratory name already taken', 409, 'EG-304');
  }
}

/**
 * Organization has no labratories
 */
export class NoLabratoriesFoundError extends HttpError {
  constructor() {
    super('Unable to find Laboratories for Organization', 404, 'EG-305');
  }
}

/**
 * Laboratory WorkspaceId Unavailable
 */
export class LaboratoryWorkspaceIdUnavailableError extends HttpError {
  constructor() {
    super('Laboratory WorkspaceId unavailable', 400, 'EG-306');
  }
}

/**
 * Laboratory Access Token Unavailable
 */
export class LaboratoryAccessTokenUnavailableError extends HttpError {
  constructor() {
    super('Laboratory Access Token unavailable', 400, 'EG-307');
  }
}

/**
 * Laboratory User already exists
 */
export class LaboratoryUserAlreadyExistsError extends HttpError {
  constructor() {
    super('Laboratory User already exists', 400, 'EG-311');
  }
}

/**
 * Laboratory User failed to delete
 */
export class LaboratoryUserDeleteFailedError extends HttpError {
  constructor() {
    super('Removing user from laboratory failed', 500, 'EG-312');
  }
}

/**
 * Laboratory User not found
 *
 * @param laboratoryId
 * @param userId
 */
export class LaboratoryUserNotFoundError extends HttpError {
  constructor(laboratoryId: string, userId: string) {
    super(`User '${userId}' for laboratory '${laboratoryId}' could not be found`, 404, 'EG-313');
  }
}

/**
 * Laboratory Bucket not found
 *
 * @param laboratoryId
 */
export class LaboratoryBucketNotFoundError extends HttpError {
  constructor(laboratoryId: string) {
    super(`Laboratory '${laboratoryId}' S3 Bucket could not be found`, 404, 'EG-314');
  }
}

// User Errors

/**
 * User already exists
 */
export class UserAlreadyExistsError extends HttpError {
  constructor() {
    super('User already exists', 400, 'EG-401');
  }
}

/**
 * User failed to delete
 */
export class UserDeleteFailedError extends HttpError {
  constructor() {
    super('User deletion failed', 500, 'EG-402');
  }
}

/**
 * User not found
 */
export class UserNotFoundError extends HttpError {
  constructor() {
    super('User Not Found', 404, 'EG-403');
  }
}

/**
 * User name is already taken by another resource
 */
export class UserNameTakenError extends HttpError {
  constructor() {
    super('User name already taken', 409, 'EG-404');
  }
}

/**
 * User missing organization access
 */
export class UserNotInOrganizationError extends HttpError {
  constructor() {
    super('User not permitted access without first granted access to the Organization', 409, 'EG-405');
  }
}
