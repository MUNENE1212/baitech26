/**
 * React Error Boundary Component
 */

'use client';

import React, { Component, ReactNode, ErrorInfo, JSX } from 'react';
import { NextResponse } from 'next/server';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; errorInfo: ErrorInfo; errorId: string; onReset: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate a unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.state.errorId || `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.setState({
      error,
      errorInfo,
      errorId,
    });

    // Log error details
    this.logError(error, errorInfo, errorId);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorId);
    }

    // Send to monitoring service
    this.sendToMonitoringService(error, errorInfo, errorId);
  }

  /**
   * Log error details
   */
  private logError(error: Error, errorInfo: ErrorInfo, errorId: string): void {
    const logData = {
      errorId,
      name: error.name,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.error('React Error Boundary - Caught error:', JSON.stringify(logData, null, 2));
  }

  /**
   * Send error to monitoring service
   */
  private async sendToMonitoringService(error: Error, errorInfo: ErrorInfo, errorId: string): Promise<void> {
    try {
      // In development, just log to console
      if (process.env.NODE_ENV === 'development') {
        console.warn('Error monitoring is disabled in development');
        return;
      }

      // In production, send to monitoring service
      const errorData = {
        errorId,
        name: error.name,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        environment: process.env.NODE_ENV,
      };

      // Example: Send to error tracking service
      // await fetch('/api/errors/log', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorData)
      // });

    } catch (monitoringError) {
      console.error('Failed to send error to monitoring service:', monitoringError);
    }
  }

  /**
   * Reset error boundary state
   */
  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      // Use custom fallback component if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            errorId={this.state.errorId!}
            onReset={this.handleReset}
          />
        );
      }

      // Default error fallback
      return (
        <DefaultErrorFallback
          error={this.state.error!}
          errorInfo={this.state.errorInfo!}
          errorId={this.state.errorId!}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Default error fallback component
 */
interface DefaultErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  errorId: string;
  onReset: () => void;
}

function DefaultErrorFallback({ error, errorInfo, errorId, onReset }: DefaultErrorFallbackProps): JSX.Element {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8 mx-4">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h1>

          {/* Error Message */}
          <p className="text-gray-600 mb-6">
            We apologize for the inconvenience. An unexpected error has occurred.
          </p>

          {/* Error ID for support */}
          <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-medium text-gray-700 mb-1">
              Error Reference:
            </p>
            <code className="text-xs text-gray-600 break-all">
              {errorId}
            </code>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onReset}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200"
            >
              Go Home
            </button>
          </div>

          {/* Development Details */}
          {isDevelopment && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                Development Details
              </summary>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-2">
                <p className="text-sm font-medium text-red-800 mb-2">
                  Error: {error.name}
                </p>
                <p className="text-xs text-red-700 mb-2 break-all">
                  {error.message}
                </p>
                {error.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs font-medium text-red-700">
                      Stack Trace
                    </summary>
                    <pre className="text-xs text-red-600 mt-1 whitespace-pre-wrap break-all">
                      {error.stack}
                    </pre>
                  </details>
                )}
                {errorInfo.componentStack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs font-medium text-red-700">
                      Component Stack
                    </summary>
                    <pre className="text-xs text-red-600 mt-1 whitespace-pre-wrap">
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Higher-order component to wrap pages with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; errorInfo: ErrorInfo; errorId: string; onReset: () => void }>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}