/**
 * A regex for validating a password against Cognito's password requirements
 * Cognito Documentation: https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-policies.html
 *
 * Regex explanation:
 *   - No leading whitespace
 *     ^(?!\s+)
 *   - No trailing whitespace
 *     (?!.*\s+$)
 *   - Must contain an uppercase character
 *     (?=.*[A-Z])
 *   - Must contain a lowercase character
 *     (?=.*[a-z])
 *   - Must contain a number
 *     (?=.*[0-9])
 *   - Must contain an allowed special character: ^ $ * . [ ] { } ( ) ? " ! @ # % & / \ , > < ' : ; | _ ~ ` = + -
 *     (?=.*[\^$*.\[\]{}()?"!@#%&\/\\,><':;|_~`=+\- ])
 *   - Must be between 8 and 256 characters in length
 *     [A-Za-z0-9^$*.\[\]{}()?"!@#%&/\\,><':;|_~`=+\- ]{8,256}
 */
export const cognitoPasswordRegex =
  /^(?!\s+)(?!.*\s+$)(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[\^$*.\[\]{}()?"!@#%&\/\\,><':;|_~`=+\- ])[A-Za-z0-9\^$*.\[\]{}()?"!@#%&\/\\,><':;|_~`=+\- ]{8,256}$/;
