import { jwtDecode } from 'jwt-decode';

export function getJwtPayload(token: string) {
  return jwtDecode(token);
}

export function checkResetTokenExpiry(jwt: string) {
  const val = getJwtPayload(jwt);

  if (!val.exp) {
    console.warn('Missing "exp" field in JWT payload.');
    return false;
  }

  const currentTime = Math.floor(Date.now() / 1000); // user's system current time in seconds
  const isExpired = currentTime > val.exp;

  if (isExpired) {
    console.warn('Token has expired.');
    return false;
  }

  return true;
}
