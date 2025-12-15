import { NextRequest, NextResponse } from 'next/server';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Rate limiting configuration
export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '50'), // 50 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests, please try again later.',
      retryAfter: Math.round((windowMs / 1000))
    });
  }
});

// Security headers configuration
export const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://res.cloudinary.com",
    "font-src 'self' data:",
    "connect-src 'self' https://api.cloudinary.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Resource-Policy': 'same-origin'
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

// SQL injection prevention (for NoSQL)
export const sanitizeMongoInput = (input: any): any => {
  if (typeof input === 'string') {
    return sanitizeInput(input);
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeMongoInput);
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeMongoInput(value);
    }
    return sanitized;
  }
  return input;
};

// Request validation middleware
export const validateRequest = (req: NextRequest) => {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

  // Validate origin
  if (origin && !allowedOrigins.includes(origin)) {
    return false;
  }

  // Validate referer for additional security
  if (referer && !allowedOrigins.some(allowedOrigin => referer.startsWith(allowedOrigin))) {
    return false;
  }

  return true;
};

// File upload validation
export const validateFileUpload = (file: File) => {
  const maxSize = parseInt(process.env.MAX_FILE_SIZE || '1048576'); // 1MB
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,webp').split(',');
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  // Check file size
  if (file.size > maxSize) {
    throw new Error(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
  }

  // Check file type
  if (!fileExtension || !allowedTypes.includes(fileExtension)) {
    throw new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  // Check MIME type
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error(`MIME type not allowed: ${file.type}`);
  }

  return true;
};

// API rate limiting for different endpoints
export const createApiRateLimiter = (windowMs: number, max: number) => {
  return rateLimit({
    windowMs,
    max,
    message: 'Rate limit exceeded for this endpoint',
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Specific rate limiters for different API categories
export const authRateLimiter = createApiRateLimiter(15 * 60 * 1000, 5); // 5 requests per 15 minutes
export const uploadRateLimiter = createApiRateLimiter(60 * 60 * 1000, 10); // 10 uploads per hour
export const contactRateLimiter = createApiRateLimiter(60 * 60 * 1000, 3); // 3 contacts per hour

// Security monitoring
export const logSecurityEvent = (event: string, details: any, req?: NextRequest) => {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    details,
    ip: req?.headers.get('x-forwarded-for') || req?.ip,
    userAgent: req?.headers.get('user-agent'),
    url: req?.url
  };

  console.warn('[SECURITY ALERT]', JSON.stringify(logData, null, 2));

  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production' && process.env.ERROR_REPORTING_ENABLED === 'true') {
    // TODO: Implement actual monitoring service integration
    // sendToMonitoringService(logData);
  }
};

// IP blocking for suspicious activity
export const suspiciousIPs = new Set<string>();

export const blockSuspiciousIP = (ip: string, reason: string) => {
  suspiciousIPs.add(ip);
  logSecurityEvent('IP_BLOCKED', { ip, reason });
};

export const isIPBlocked = (req: NextRequest): boolean => {
  const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
  return suspiciousIPs.has(ip);
};