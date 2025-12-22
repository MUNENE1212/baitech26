/**
 * Global Error Handler for API responses
 */

import { NextResponse } from 'next/server';
import { AppError, ValidationError, NotFoundError, UnauthorizedError, ForbiddenError } from '../../types';

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    timestamp: string;
    details?: any;
    stack?: string; // Only in development
  };
}

export class ErrorHandler {
  private static instance: ErrorHandler;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle API errors and return standardized response
   */
  async handleError(error: Error | AppError, context?: string): Promise<NextResponse> {
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Log error details
    this.logError(error, context);

    // Categorize and format error response
    const errorResponse = this.formatErrorResponse(error, isDevelopment);

    return NextResponse.json(errorResponse, {
      status: this.getStatusCode(error),
      headers: this.getSecurityHeaders()
    });
  }

  /**
   * Format error response consistently
   */
  private formatErrorResponse(error: Error | AppError, isDevelopment: boolean): ApiErrorResponse {
    const errorType = this.categorizeError(error);

    return {
      success: false,
      error: {
        code: errorType.code,
        message: errorType.userMessage,
        timestamp: new Date().toISOString(),
        details: error instanceof AppError ? error.details : undefined,
        stack: isDevelopment ? error.stack : undefined,
      }
    };
  }

  /**
   * Categorize error and determine appropriate response
   */
  private categorizeError(error: Error | AppError): { code: string; userMessage: string } {
    if (error instanceof ValidationError) {
      return {
        code: 'VALIDATION_ERROR',
        userMessage: error.message || 'Invalid input data provided'
      };
    }

    if (error instanceof UnauthorizedError) {
      return {
        code: 'UNAUTHORIZED',
        userMessage: 'Please log in to continue'
      };
    }

    if (error instanceof ForbiddenError) {
      return {
        code: 'FORBIDDEN',
        userMessage: 'You do not have permission to perform this action'
      };
    }

    if (error instanceof NotFoundError) {
      return {
        code: 'NOT_FOUND',
        userMessage: 'The requested resource was not found'
      };
    }

    if (error instanceof AppError) {
      return {
        code: error.code || 'APPLICATION_ERROR',
        userMessage: error.message || 'An application error occurred'
      };
    }

    // Handle common error types
    if (error.name === 'ValidationError') {
      return {
        code: 'VALIDATION_ERROR',
        userMessage: 'Invalid data format provided'
      };
    }

    if (error.name === 'CastError') {
      return {
        code: 'INVALID_ID',
        userMessage: 'Invalid ID format provided'
      };
    }

    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return {
        code: 'DATABASE_ERROR',
        userMessage: 'Database operation failed'
      };
    }

    if (error.name === 'TypeError') {
      return {
        code: 'TYPE_ERROR',
        userMessage: 'Invalid data type provided'
      };
    }

    // Default error
    return {
      code: 'INTERNAL_ERROR',
      userMessage: 'An unexpected error occurred. Please try again later.'
    };
  }

  /**
   * Determine appropriate HTTP status code
   */
  private getStatusCode(error: Error | AppError): number {
    if (error instanceof AppError) {
      return error.statusCode;
    }

    if (error instanceof ValidationError) {
      return 400;
    }

    if (error instanceof UnauthorizedError) {
      return 401;
    }

    if (error instanceof ForbiddenError) {
      return 403;
    }

    if (error instanceof NotFoundError) {
      return 404;
    }

    // Handle common error types
    if (error.name === 'ValidationError' || error.name === 'CastError' || error.name === 'TypeError') {
      return 400;
    }

    if (error.name === 'MongoError') {
      // Check for duplicate key error
      if (error.message.includes('duplicate key')) {
        return 409; // Conflict
      }
      return 500;
    }

    // Default to server error
    return 500;
  }

  /**
   * Log error with context
   */
  private logError(error: Error | AppError, context?: string): void {
    const logData: any = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    };

    if (error instanceof AppError) {
      logData.statusCode = error.statusCode;
      logData.code = error.code;
    }

    // Log error details
    console.error('API Error:', JSON.stringify(logData, null, 2));

    // TODO: In production, send to monitoring service
    // await this.sendToMonitoringService(logData);
  }

  /**
   * Get security headers for error responses
   */
  private getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    };
  }

  /**
   * Send error to monitoring service (for production)
   */
  private async sendToMonitoringService(errorData: any): Promise<void> {
    // Implementation for services like Sentry, LogRocket, etc.
    // Example:
    // Sentry.captureException(new Error(errorData.message), {
    //   extra: errorData
    // });
  }
}

/**
 * API handler wrapper for consistent error handling
 */
export function withErrorHandler(handler: (req: Request, ...args: any[]) => Promise<NextResponse>) {
  return async (req: Request, ...args: any[]): Promise<NextResponse> => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      const errorHandler = ErrorHandler.getInstance();
      return await errorHandler.handleError(error as Error);
    }
  };
}