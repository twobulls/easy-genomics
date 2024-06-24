import { jwtDecode } from 'jwt-decode';

export function decodeJwt(token: string) {
  return jwtDecode(token);
}

/**
 * Check if a JWT has expired
 * @param token
 */
export function checkTokenExpiry(token: string): boolean {
  const decoded = decodeJwt(token);
  const currentTime = Math.floor(Date.now() / 1000); // user's system current time in seconds

  // Check if 'exp' field exists in the token
  if (!decoded.exp) {
    console.warn('Missing "exp" field in JWT payload.');
    return false;
  }

  // Check if the token has expired
  if (currentTime > decoded.exp) {
    console.warn('Token has expired.');
    return false;
  }

  return true;
}
