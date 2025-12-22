import { useState, useCallback, useEffect } from 'react';
import {
  validateForm,
  validateProductCrossFields,
  FieldValidationResult,
  sanitizeString,
  sanitizeNumber,
  sanitizeInteger
} from '@/lib/validation/frontend-validation';

export interface UseFormValidationOptions<T> {
  initialValues: T;
  validationRules: Record<keyof T, { validate: (value: any) => FieldValidationResult }>;
  crossFieldValidator?: (formData: T) => FieldValidationResult;
  onValidationChange?: (isValid: boolean, errors: Partial<Record<keyof T, string>>) => void;
  realTimeValidation?: boolean; // Default: true
  sanitizeOnBlur?: boolean; // Default: true
}

export interface FormValidationResult<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isDirty: boolean;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string | undefined) => void;
  setTouched: (field: keyof T, touched: boolean) => void;
  validateField: (field: keyof T) => boolean;
  validateForm: () => boolean;
  resetForm: (newValues?: Partial<T>) => void;
  resetErrors: () => void;
  clearField: (field: keyof T) => void;
  sanitizeAndSetField: (field: keyof T, value: any, sanitize?: boolean) => void;
}

export function useFormValidation<T extends Record<string, any>>({
  initialValues,
  validationRules,
  crossFieldValidator,
  onValidationChange,
  realTimeValidation = true,
  sanitizeOnBlur = true,
}: UseFormValidationOptions<T>): FormValidationResult<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Validate a single field
  const validateField = useCallback((field: keyof T): boolean => {
    const validationRule = validationRules[field];
    if (!validationRule) return true;

    const result = validationRule.validate(values[field]);
    setErrors(prev => ({
      ...prev,
      [field]: result.isValid ? undefined : result.error
    }));

    return result.isValid;
  }, [values, validationRules]);

  // Validate entire form
  const validateEntireForm = useCallback((): boolean => {
    // Validate individual fields
    const { isValid: fieldsValid, errors: fieldErrors } = validateForm(values, validationRules);

    // Validate cross-field dependencies
    let crossFieldValid = true;
    let crossFieldError: string | undefined;

    if (crossFieldValidator) {
      const crossFieldResult = crossFieldValidator(values);
      crossFieldValid = crossFieldResult.isValid;
      crossFieldError = crossFieldResult.error;
    }

    const newErrors: Partial<Record<keyof T | 'crossField', string>> = { ...fieldErrors };
    if (crossFieldError) {
      (newErrors as any)['crossField'] = crossFieldError;
    }

    setErrors(newErrors as Partial<Record<keyof T, string>>);
    const overallValid = fieldsValid && crossFieldValid;

    // Notify parent component
    if (onValidationChange) {
      onValidationChange(overallValid, newErrors);
    }

    return overallValid;
  }, [values, validationRules, crossFieldValidator, onValidationChange]);

  // Set field value with optional validation
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    setIsDirty(true);

    // Real-time validation if enabled
    if (realTimeValidation) {
      // Use setTimeout to ensure the value is updated before validation
      setTimeout(() => {
        const validationRule = validationRules[field];
        if (validationRule) {
          const result = validationRule.validate(value);
          setErrors(prev => ({
            ...prev,
            [field]: result.isValid ? undefined : result.error
          }));
        }
      }, 0);
    }
  }, [realTimeValidation, validationRules]);

  // Set field error manually
  const setFieldError = useCallback((field: keyof T, error: string | undefined) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  // Mark field as touched/un-touched
  const setFieldTouched = useCallback((field: keyof T, touchedValue: boolean) => {
    setTouched(prev => ({ ...prev, [field]: touchedValue }));

    // Validate on blur if enabled and field is now touched
    if (touchedValue && realTimeValidation) {
      validateField(field);

      // Apply sanitization on blur if enabled
      if (sanitizeOnBlur) {
        const currentValue = values[field];
        const sanitizedValue = sanitizeFieldValue(field, currentValue);
        if (sanitizedValue !== currentValue) {
          setValues(prev => ({ ...prev, [field]: sanitizedValue }));
        }
      }
    }
  }, [values, validateField, realTimeValidation, sanitizeOnBlur]);

  // Reset form to initial values or new values
  const resetForm = useCallback((newValues?: Partial<T>) => {
    const resetValues = { ...initialValues, ...newValues };
    setValues(resetValues);
    setErrors({});
    setTouched({});
    setIsDirty(false);

    if (onValidationChange) {
      onValidationChange(true, {});
    }
  }, [initialValues, onValidationChange]);

  // Reset all errors
  const resetErrors = useCallback(() => {
    setErrors({});
    if (onValidationChange) {
      onValidationChange(true, {});
    }
  }, [onValidationChange]);

  // Clear a specific field
  const clearField = useCallback((field: keyof T) => {
    setValues(prev => ({ ...prev, [field]: '' }));
    setTouched(prev => ({ ...prev, [field]: false }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
    setIsDirty(true);
  }, []);

  // Sanitize and set field value
  const sanitizeAndSetField = useCallback((field: keyof T, value: any, shouldSanitize = true) => {
    const sanitizedValue = shouldSanitize ? sanitizeFieldValue(field, value) : value;
    setFieldValue(field, sanitizedValue);
  }, [setFieldValue]);

  // Helper function to sanitize field values based on field type
  const sanitizeFieldValue = (field: keyof T, value: any): any => {
    // Skip sanitization for non-string values
    if (typeof value !== 'string') return value;

    // Common string sanitization
    if (typeof value === 'string') {
      // Handle string fields that need trimming and HTML sanitization
      if (['name', 'description', 'category', 'subcategory', 'customer_name', 'service_note'].includes(String(field))) {
        return sanitizeString(value);
      }
    }

    // Handle number fields
    if (['price', 'originalPrice', 'stock', 'rating', 'pricing'].includes(String(field))) {
      return sanitizeNumber(value);
    }

    // Handle integer fields
    if (['stock'].includes(String(field))) {
      return sanitizeInteger(value);
    }

    return value;
  };

  // Calculate overall form validity
  const isValid = Object.keys(errors).length === 0 && Object.keys(validationRules).every(field => {
    const fieldErrors = errors[field as keyof T];
    return !fieldErrors;
  });

  // Auto-validate when values change if real-time validation is disabled
  useEffect(() => {
    if (!realTimeValidation && isDirty) {
      validateEntireForm();
    }
  }, [values, realTimeValidation, isDirty, validateEntireForm]);

  return {
    values,
    errors,
    touched,
    isValid,
    isDirty,
    setFieldValue,
    setFieldError,
    setTouched: setFieldTouched,
    validateField,
    validateForm: validateEntireForm,
    resetForm,
    resetErrors,
    clearField,
    sanitizeAndSetField,
  };
}

// Hook specifically for product validation
export function useProductFormValidation(initialValues: any, onValidationChange?: (isValid: boolean, errors: any) => void) {
  const { productValidationRules } = require('@/lib/validation/frontend-validation');

  return useFormValidation({
    initialValues,
    validationRules: productValidationRules,
    crossFieldValidator: validateProductCrossFields,
    onValidationChange,
  });
}

// Hook specifically for service validation
export function useServiceFormValidation(initialValues: any, onValidationChange?: (isValid: boolean, errors: any) => void) {
  const { serviceValidationRules } = require('@/lib/validation/frontend-validation');

  return useFormValidation({
    initialValues,
    validationRules: serviceValidationRules,
    onValidationChange,
  });
}