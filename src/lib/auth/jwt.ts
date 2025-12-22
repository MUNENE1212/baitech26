import jwt from 'jsonwebtoken';
import { JwtPayload } from '../../types';

const JWT_SECRET: string = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Create JWT token for user
 */
export function createAccessToken(payload: {
  user_id: string;
  email: string;
  role: string;
}): string {
  return jwt.sign(
    payload,
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'baitech',
      audience: 'baitech-users',
    } as jwt.SignOptions
  );
}

/**
 * Verify JWT token
 */
export function verifyAccessToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'baitech',
      audience: 'baitech-users',
    }) as JwtPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
}

/**
 * Create refresh token (longer lasting)
 */
export function createRefreshToken(payload: {
  user_id: string;
  email: string;
}): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d', // 30 days for refresh token
    issuer: 'baitech',
    audience: 'baitech-refresh',
  });
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): {
  user_id: string;
  email: string;
} {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'baitech',
      audience: 'baitech-refresh',
    }) as any;

    return {
      user_id: decoded.user_id,
      email: decoded.email,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    } else {
      throw new Error('Refresh token verification failed');
    }
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Decode token without verification (for user info extraction)
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    return Date.now() >= decoded.exp * 1000;
  } catch (error) {
    return true;
  }
}

/**
 * Generate a secure random token for password reset
 */
export function generatePasswordResetToken(): string {
  return jwt.sign(
    { type: 'password_reset' },
    JWT_SECRET,
    { expiresIn: '1h' } // Password reset tokens expire in 1 hour
  );
}

/**
 * Verify password reset token
 */
export function verifyPasswordResetToken(token: string): boolean {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.type === 'password_reset';
  } catch (error) {
    return false;
  }
}

/**
 * Generate email verification token
 */
export function generateEmailVerificationToken(email: string): string {
  return jwt.sign(
    { type: 'email_verification', email },
    JWT_SECRET,
    { expiresIn: '24h' } // Email verification tokens expire in 24 hours
  );
}

/**
 * Verify email verification token
 */
export function verifyEmailVerificationToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type === 'email_verification' && decoded.email) {
      return decoded.email;
    }
    return null;
  } catch (error) {
    return null;
  }
}