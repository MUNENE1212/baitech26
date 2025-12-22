/**
 * Global API Handler for consistent error handling and response formatting
 */

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler, ErrorHandler } from '../errors/ErrorHandler';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Standard API response wrapper
 */
export class ApiResponseBuilder {
  /**
   * Create success response
   */
  static success<T>(
    data?: T,
    message?: string,
    options?: {
      status?: number;
      headers?: Record<string, string>;
      pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }
  ): NextResponse {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      ...(options?.pagination && { pagination: options.pagination }),
    };

    const nextResponse = NextResponse.json(response, {
      status: options?.status || 200,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    // Add security headers
    this.addSecurityHeaders(nextResponse);

    return nextResponse;
  }

  /**
   * Create paginated response
   */
  static paginated<T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    },
    message?: string
  ): NextResponse<PaginatedResponse<T>> {
    return this.success(data, message, {
      pagination,
    }) as NextResponse<PaginatedResponse<T>>;
  }

  /**
   * Create error response
   */
  static error(
    code: string,
    message: string,
    status: number = 400,
    details?: any
  ): NextResponse {
    const response: ApiResponse = {
      success: false,
      error: {
        code,
        message,
        details,
      },
      timestamp: new Date().toISOString(),
    };

    const nextResponse = NextResponse.json(response, {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.addSecurityHeaders(nextResponse);

    return nextResponse;
  }

  /**
   * Add security headers to response
   */
  private static addSecurityHeaders(response: NextResponse): void {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Add CORS headers if needed
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://baitech.co.ke',
      'https://www.baitech.co.ke',
    ];

    // Note: This would need to be adjusted based on the actual request origin
    // response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
}

/**
 * API handler wrapper with error handling
 */
export function apiHandler(
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return withErrorHandler(async (req: NextRequest, ...args: any[]) => {
    const startTime = Date.now();

    try {
      const response = await handler(req, ...args);

      // Add processing time header for monitoring
      const processingTime = Date.now() - startTime;
      response.headers.set('X-Processing-Time', `${processingTime}ms`);

      return response;
    } catch (error) {
      // Log processing time even for errors
      const processingTime = Date.now() - startTime;
      console.error(`API Error - Processing time: ${processingTime}ms`);

      throw error;
    }
  });
}

/**
 * Validation middleware wrapper
 */
export function withValidation<T>(
  validationSchema: {
    validate?: (data: any) => { isValid: boolean; errors?: string[]; data?: T };
  },
  handler: (req: NextRequest, data: T) => Promise<NextResponse>
) {
  return apiHandler(async (req: NextRequest) => {
    let data: any;

    try {
      // Parse request body for POST/PUT requests
      if (req.method === 'POST' || req.method === 'PUT') {
        data = await req.json();
      } else if (req.method === 'GET') {
        // Parse query parameters for GET requests
        data = Object.fromEntries(req.nextUrl.searchParams);
      } else {
        data = {};
      }
    } catch (parseError) {
      return ApiResponseBuilder.error(
        'INVALID_JSON',
        'Invalid JSON data provided',
        400
      );
    }

    // Validate data if schema is provided
    if (validationSchema.validate) {
      const validation = validationSchema.validate(data);

      if (!validation.isValid) {
        return ApiResponseBuilder.error(
          'VALIDATION_ERROR',
          'Invalid input data provided',
          400,
          validation.errors
        );
      }

      data = validation.data;
    }

    return handler(req, data);
  });
}

/**
 * Rate limiting middleware wrapper
 */
export function withRateLimit(
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
) {
  return apiHandler(async (req: NextRequest) => {
    // Simple in-memory rate limiting (for production, use Redis)
    const clientId = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();

    // This is a simplified version - in production, use proper rate limiting
    const rateLimitKey = `rate_limit:${clientId}`;

    // For now, just pass through
    // TODO: Implement proper rate limiting with Redis

    // Add rate limit headers
    const response = NextResponse.json({ message: 'Rate limiting not implemented yet' }, {
      status: 429,
      headers: {
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': (maxRequests - 1).toString(),
        'X-RateLimit-Reset': new Date(now + windowMs).toISOString(),
      }
    });

    return response;
  });
}

/**
 * Logging middleware wrapper
 */
export function withLogging(
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return apiHandler(async (req: NextRequest, ...args: any[]) => {
    const startTime = Date.now();
    const method = req.method;
    const url = req.url;

    console.log(`🚀 API Request: ${method} ${url}`);

    try {
      const response = await handler(req, ...args);
      const duration = Date.now() - startTime;

      console.log(`✅ API Response: ${method} ${url} - ${response.status} (${duration}ms)`);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      console.error(`❌ API Error: ${method} ${url} - ${duration}ms`, error);

      throw error;
    }
  });
}