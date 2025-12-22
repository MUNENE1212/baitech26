import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export interface ValidationFeedbackProps {
  error?: string;
  warning?: string;
  info?: string;
  success?: string;
  showIcon?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ValidationFeedback({
  error,
  warning,
  info,
  success,
  showIcon = true,
  className = '',
  size = 'sm',
}: ValidationFeedbackProps) {
  if (!error && !warning && !info && !success) {
    return null;
  }

  const getMessageConfig = () => {
    if (error) {
      return {
        type: 'error',
        icon: AlertCircle,
        iconClass: 'text-red-500',
        bgClass: 'bg-red-50',
        borderClass: 'border-red-200',
        textClass: 'text-red-800',
      };
    }
    if (warning) {
      return {
        type: 'warning',
        icon: AlertCircle,
        iconClass: 'text-amber-500',
        bgClass: 'bg-amber-50',
        borderClass: 'border-amber-200',
        textClass: 'text-amber-800',
      };
    }
    if (info) {
      return {
        type: 'info',
        icon: Info,
        iconClass: 'text-blue-500',
        bgClass: 'bg-blue-50',
        borderClass: 'border-blue-200',
        textClass: 'text-blue-800',
      };
    }
    if (success) {
      return {
        type: 'success',
        icon: CheckCircle,
        iconClass: 'text-green-500',
        bgClass: 'bg-green-50',
        borderClass: 'border-green-200',
        textClass: 'text-green-800',
      };
    }
    return null;
  };

  const config = getMessageConfig();
  if (!config) return null;

  const Icon = config.icon;
  const message = error || warning || info || success;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-3',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div
      className={`
        flex items-center gap-2 rounded-md border
        ${config.bgClass}
        ${config.borderClass}
        ${config.textClass}
        ${sizeClasses[size]}
        ${className}
      `}
      role={config.type === 'error' ? 'alert' : 'status'}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span className="flex-1">{message}</span>
    </div>
  );
}

// Input field wrapper with validation feedback
export interface ValidatedInputProps {
  label?: string;
  required?: boolean;
  error?: string;
  warning?: string;
  info?: string;
  success?: string;
  children: React.ReactNode;
  className?: string;
  showFeedback?: boolean;
}

export function ValidatedInput({
  label,
  required = false,
  error,
  warning,
  info,
  success,
  children,
  className = '',
  showFeedback = true,
}: ValidatedInputProps) {
  const hasFeedback = error || warning || info || success;

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {children}

      {showFeedback && hasFeedback && (
        <ValidationFeedback
          error={error}
          warning={warning}
          info={info}
          success={success}
          size="sm"
        />
      )}
    </div>
  );
}

// Form validation summary
export interface ValidationSummaryProps {
  errors: Record<string, string>;
  warnings?: Record<string, string>;
  title?: string;
  className?: string;
  showOnlyFirst?: boolean;
  onDismissError?: (field: string) => void;
}

export function ValidationSummary({
  errors,
  warnings = {},
  title = 'Please fix the following issues:',
  className = '',
  showOnlyFirst = false,
  onDismissError,
}: ValidationSummaryProps) {
  const allErrors = Object.entries(errors);
  const allWarnings = Object.entries(warnings);
  const hasIssues = allErrors.length > 0 || allWarnings.length > 0;

  if (!hasIssues) {
    return null;
  }

  const errorsToShow = showOnlyFirst ? allErrors.slice(0, 1) : allErrors;
  const warningsToShow = showOnlyFirst ? allWarnings.slice(0, 1) : allWarnings;

  return (
    <div className={`rounded-md border border-red-200 bg-red-50 p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <div className="mt-2 text-sm text-red-700">
            <ul className="list-disc space-y-1 pl-5">
              {errorsToShow.map(([field, message]) => (
                <li key={field} className="flex items-center justify-between">
                  <span>{message}</span>
                  {onDismissError && (
                    <button
                      onClick={() => onDismissError(field)}
                      className="ml-2 text-red-400 hover:text-red-600"
                      title="Dismiss this error"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </li>
              ))}
              {warningsToShow.map(([field, message]) => (
                <li key={field} className="text-amber-700">
                  {message} <span className="text-amber-600 font-medium">(Warning)</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Real-time character counter with validation
export interface CharacterCounterProps {
  current: number;
  max: number;
  min?: number;
  showRemaining?: boolean;
  className?: string;
  warningThreshold?: number;
}

export function CharacterCounter({
  current,
  max,
  min,
  showRemaining = true,
  className = '',
  warningThreshold = 0.8,
}: CharacterCounterProps) {
  const remaining = max - current;
  const thresholdValue = max * warningThreshold;

  const getCounterColor = () => {
    if (current < min) return 'text-red-600';
    if (current >= max) return 'text-red-600';
    if (current >= thresholdValue) return 'text-amber-600';
    return 'text-gray-500';
  };

  const getCounterText = () => {
    if (showRemaining) {
      if (remaining < 0) return `${Math.abs(remaining)} over limit`;
      return `${remaining} remaining`;
    }
    return `${current}/${max}`;
  };

  return (
    <div className={`text-xs ${getCounterColor()} ${className}`}>
      {min && current < min && (
        <span>Min: {min} • </span>
      )}
      <span>{getCounterText()}</span>
    </div>
  );
}

// Helper HOC for form inputs
export interface ValidatedFieldProps {
  name: string;
  value: string | number;
  error?: string;
  warning?: string;
  info?: string;
  success?: string;
  onChange: (value: string | number) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  required?: boolean;
}

export const withValidation = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return React.forwardRef<any, P & ValidatedFieldProps>(({
    name,
    value,
    error,
    warning,
    info,
    success,
    onChange,
    onBlur,
    onFocus,
    disabled = false,
    required = false,
    ...props
  }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      onChange(e.target.value);
    };

    const hasError = !!error;
    const hasWarning = !!warning;
    const hasInfo = !!info;
    const hasSuccess = !!success;

    const inputClassName = `
      w-full rounded-lg border px-3 py-2 text-sm
      focus:outline-none focus:ring-2 focus:ring-offset-0
      transition-colors duration-200
      ${hasError
        ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500/20'
        : hasWarning
        ? 'border-amber-300 text-amber-900 placeholder-amber-300 focus:border-amber-500 focus:ring-amber-500/20'
        : hasSuccess
        ? 'border-green-300 text-green-900 placeholder-green-300 focus:border-green-500 focus:ring-green-500/20'
        : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
      }
      ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-50' : 'bg-white'}
    `;

    return (
      <Component
        {...(props as P)}
        ref={ref}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
        required={required}
        className={inputClassName}
        aria-invalid={hasError}
        aria-describedby={
          (hasError && `${name}-error`) ||
          (hasWarning && `${name}-warning`) ||
          (hasInfo && `${name}-info`) ||
          (hasSuccess && `${name}-success`) ||
          undefined
        }
      />
    );
  });
};