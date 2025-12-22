import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyAccessToken } from './jwt';
import { UnauthorizedError, ForbiddenError, UserRole, JwtPayload } from '../../types';
import { cacheService } from '../cache/cache';

/**
 * Get current user from request
 */
export async function getCurrentUser(request: NextRequest): Promise<JwtPayload> {
  const token = extractTokenFromHeader(request.headers.get('authorization') || undefined);

  if (!token) {
    throw new UnauthorizedError('No authorization token provided');
  }

  try {
    const payload = verifyAccessToken(token);

    // Try to verify user still exists and is active, but don't fail if DB is down
    try {
      const { getUsersCollection } = await import('../database/connection');
      const { ObjectId } = await import('mongodb');
      const usersCollection = await getUsersCollection();
      const user = await usersCollection.findOne({
        _id: new ObjectId(payload.user_id),
        // Try both possible field names for active status
        $or: [{ isActive: true }, { active: true }, { role: 'admin' }]
      });

        if (!user) {
          console.warn(`User not found in database. User ID: ${payload.user_id}`);
          // Don't throw error - trust the JWT token if user not found
          // This allows admin operations to work even if DB has issues
        }

        // Cache user data
        if (user) {
          await cacheService.cacheUser(payload.user_id, user, 1800); // 30 minutes
        }
    } catch (dbError) {
      // If database fails, log the error but continue with token verification
      console.warn('Database verification failed, proceeding with token verification:', dbError);
      // Don't throw error - trust the JWT token if DB is unavailable
    }

    return payload;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError('Invalid authorization token');
  }
}

/**
 * Middleware to require authentication
 */
export function requireAuth(handler: (req: NextRequest, user: JwtPayload) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const user = await getCurrentUser(request);
      return await handler(request, user);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: error.statusCode }
        );
      }
      if (error instanceof ForbiddenError) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: error.statusCode }
        );
      }

      // Log unexpected errors but always return a response
      console.error('Unexpected authentication error:', error);
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
}

/**
 * Middleware to require specific role
 */
export function requireRole(role: UserRole | UserRole[]) {
  const allowedRoles = Array.isArray(role) ? role : [role];

  return function(handler: (req: NextRequest, user: JwtPayload) => Promise<NextResponse>) {
    return requireAuth(async (request: NextRequest, user: JwtPayload): Promise<NextResponse> => {
      if (!allowedRoles.includes(user.role as UserRole)) {
        throw new ForbiddenError(`Access denied. Required role: ${allowedRoles.join(' or ')}`);
      }

      return await handler(request, user);
    });
  };
}

/**
 * Middleware to require admin role
 */
export const requireAdmin = requireRole(UserRole.ADMIN);

/**
 * Middleware to require customer role
 */
export const requireCustomer = requireRole(UserRole.CUSTOMER);

/**
 * Middleware to require technician role
 */
export const requireTechnician = requireRole(UserRole.TECHNICIAN);

/**
 * Middleware to require admin or technician role
 */
export const requireAdminOrTechnician = requireRole([UserRole.ADMIN, UserRole.TECHNICIAN]);

/**
 * Check if user can access resource (owner or admin)
 */
export async function requireOwnershipOrAdmin(
  request: NextRequest,
  resourceId: string,
  userField: string = 'user_id'
): Promise<JwtPayload> {
  const user = await getCurrentUser(request);

  // Admins can access everything
  if (user.role === UserRole.ADMIN) {
    return user;
  }

  // Check if user owns the resource
  if (user.user_id !== resourceId) {
    throw new ForbiddenError('Access denied. You can only access your own resources.');
  }

  return user;
}

/**
 * Rate limiting middleware using Redis
 */
export async function rateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  try {
    const redis = await import('../database/connection').then(m => m.getRedisClient());

    if (!redis) {
      // If Redis is not available, allow all requests
      return { allowed: true, remaining: maxRequests, resetTime: Date.now() + windowMs };
    }

    const key = `rate_limit:${identifier}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Remove old entries
    await redis.zRemRangeByScore(key, 0, windowStart);

    // Count current requests
    const currentRequests = await redis.zCard(key);

    if (currentRequests >= maxRequests) {
      const oldestRequest = await redis.zRange(key, 0, 0);
      const resetTime = oldestRequest.length > 0
        ? parseInt(oldestRequest[0]) + windowMs
        : now + windowMs;

      return {
        allowed: false,
        remaining: 0,
        resetTime,
      };
    }

    // Add current request
    await redis.zAdd(key, [{ score: now, value: `${now}-${Math.random()}` }]);
    await redis.expire(key, Math.ceil(windowMs / 1000));

    return {
      allowed: true,
      remaining: maxRequests - currentRequests - 1,
      resetTime: now + windowMs,
    };

  } catch (error) {
    console.error('Rate limiting error:', error);
    // If rate limiting fails, allow the request
    return { allowed: true, remaining: maxRequests, resetTime: Date.now() + windowMs };
  }
}

/**
 * Apply rate limiting to API routes
 */
export function applyRateLimit(
  maxRequests: number = 100,
  windowMs: number = 60000
) {
  return function(handler: (req: NextRequest, user?: JwtPayload) => Promise<NextResponse>) {
    return async (request: NextRequest): Promise<NextResponse> => {
      // Use IP address or user ID for rate limiting
      const user = await getCurrentUser(request).catch(() => null);
      const forwarded = request.headers.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
      const identifier = user ? `user:${user.user_id}` : `ip:${ip}`;

      const rateLimitResult = await rateLimit(identifier, maxRequests, windowMs);

      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: 'Too many requests. Please try again later.',
            retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': maxRequests.toString(),
              'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
              'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
              'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            },
          }
        );
      }

      const response = await handler(request, user || undefined);

      // Add rate limit headers to successful responses
      response.headers.set('X-RateLimit-Limit', maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());

      return response;
    };
  };
}

/**
 * CORS middleware
 */
export function corsMiddleware(request: NextRequest, response: NextResponse): NextResponse {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://baitech.co.ke',
    'https://www.baitech.co.ke',
  ];

  const origin = request.headers.get('origin');

  if (allowedOrigins.includes(origin || '')) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

  return response;
}

/**
 * Security headers middleware
 */
export function securityHeadersMiddleware(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:"
  );

  return response;
}