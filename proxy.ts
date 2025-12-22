import { NextRequest, NextResponse } from 'next/server';
import {
  securityHeaders,
  validateRequest,
  logSecurityEvent,
  isIPBlocked
} from './lib/security/security-middleware';

export default function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const url = request.nextUrl;
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  // Block suspicious IPs immediately
  if (isIPBlocked(request)) {
    logSecurityEvent('BLOCKED_IP_ACCESS_ATTEMPT', {
      ip,
      url: url.pathname
    }, request);

    return new NextResponse('Access Denied', {
      status: 403,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }

  // Apply security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Validate requests to API routes
  if (url.pathname.startsWith('/api/')) {
    // Validate origin and referer for API routes
    if (!validateRequest(request)) {
      logSecurityEvent('INVALID_ORIGIN_REQUEST', {
        ip,
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer'),
        url: url.pathname
      }, request);

      return new NextResponse('Forbidden', {
        status: 403,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    }

    // Log API access for monitoring
    logSecurityEvent('API_ACCESS', {
      ip,
      method: request.method,
      url: url.pathname,
      userAgent: request.headers.get('user-agent')
    });
  }

  // Protect sensitive API routes only (allow client-side admin pages to handle auth)
  const protectedAPIRoutes = ['/api/admin'];
  if (protectedAPIRoutes.some(route => url.pathname.startsWith(route))) {
    // Check for authentication token
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');

    let hasValidToken = false;

    // Check Authorization header
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      hasValidToken = validateToken(token);
    }

    // Check for session cookie as fallback
    if (!hasValidToken && cookieHeader) {
      const sessionMatch = cookieHeader.match(/auth-token=([^;]+)/);
      if (sessionMatch) {
        hasValidToken = validateToken(sessionMatch[1]);
      }
    }

    if (!hasValidToken) {
      logSecurityEvent('UNAUTHORIZED_ADMIN_ACCESS', {
        ip,
        url: url.pathname,
        hasAuthHeader: !!authHeader,
        hasCookie: !!cookieHeader
      }, request);

      return new NextResponse('Unauthorized', {
        status: 401,
        headers: {
          'Content-Type': 'text/plain',
          'WWW-Authenticate': 'Bearer'
        }
      });
    }
  }

  // Log access to admin pages for monitoring (but don't block)
  if (url.pathname.startsWith('/admin')) {
    logSecurityEvent('ADMIN_PAGE_ACCESS', {
      ip,
      url: url.pathname,
      userAgent: request.headers.get('user-agent')
    }, request);
  }

  // Special handling for file upload routes
  if (url.pathname.startsWith('/api/upload')) {
    const contentType = request.headers.get('content-type');

    // Validate content type for uploads
    if (!contentType || (!contentType.includes('multipart/form-data') && !contentType.includes('application/json'))) {
      logSecurityEvent('INVALID_UPLOAD_CONTENT_TYPE', {
        ip,
        contentType,
        url: url.pathname
      }, request);

      return new NextResponse('Invalid Content-Type', {
        status: 400,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    }
  }

  // Handle POST/PUT/DELETE requests with additional validation
  if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
    const contentLength = request.headers.get('content-length');

    // Reject requests with suspiciously large content
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
      logSecurityEvent('OVERSIZED_REQUEST', {
        ip,
        contentLength,
        method: request.method,
        url: url.pathname
      }, request);

      return new NextResponse('Request too large', {
        status: 413,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    }

    // Check for common attack patterns
    const userAgent = request.headers.get('user-agent') || '';
    const suspiciousPatterns = [
      /sqlmap/i,
      /nmap/i,
      /nikto/i,
      /burp/i,
      /scanner/i,
      /bot/i
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
      logSecurityEvent('SUSPICIOUS_USER_AGENT', {
        ip,
        userAgent,
        url: url.pathname
      }, request);

      // Don't block immediately, but log for potential blocking
    }
  }

  // Add custom headers for security monitoring
  response.headers.set('X-Request-ID', generateRequestId());
  response.headers.set('X-Response-Time', Date.now().toString());

  return response;
}

// Simple token validation (in production, use proper JWT verification)
function validateToken(token: string): boolean {
  if (!token || token.length < 20) {
    return false;
  }

  try {
    // This is a basic validation - in production, use proper JWT verification
    const parts = token.split('.');
    return parts.length === 3; // Basic JWT format check
  } catch {
    return false;
  }
}

function generateRequestId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}