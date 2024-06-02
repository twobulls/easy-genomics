import { JwtPayload, sign, verify } from 'jsonwebtoken';

/**
 * Helper utility function to generate JWT
 */
export function generateJwt<T>(jwtPayload: T, jwtSecretKey: string, expiresIn?: string): string {
  return sign(<T>jwtPayload, process.env.JWT_SECRET_KEY, {
    expiresIn: expiresIn || '7 days',
  });
};

/**
 * Helper utility function to verify JWT
 * @param token
 * @param jwtSecretKey
 */
export function verifyJwt(token: string, jwtSecretKey: string): JwtPayload | string {
  return verify(token, jwtSecretKey);
};
