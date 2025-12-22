/**
 * Frontend validation utilities that mirror backend Joi validation schemas
 * Provides real-time validation and user-friendly error messages
 */

// Validation patterns matching backend patterns
export const patterns = {
  objectId: /^[0-9a-fA-F]{24}$/,
  kenyanPhone: /^(\+254|0)?[17]\d{8}$/,
  price: /^\d+(\.\d{1,2})?$/,
  slug: /^[a-z0-9-]+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  url: /^https?:\/\/.+/,
  color: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
};

// Validation error messages matching backend
export const errorMessages = {
  required: (field: string) => `${field} is required`,
  minLength: (field: string, min: number) => `${field} must be at least ${min} characters`,
  maxLength: (field: string, max: number) => `${field} must not exceed ${max} characters`,
  email: 'Please provide a valid email address',
  phone: 'Please provide a valid phone number',
  positiveNumber: (field: string) => `${field} must be a positive number`,
  integerNumber: (field: string) => `${field} must be a whole number`,
  minNumber: (field: string, min: number) => `${field} must be at least ${min}`,
  maxNumber: (field: string, max: number) => `${field} must not exceed ${max}`,
  rangeNumber: (field: string, min: number, max: number) => `${field} must be between ${min} and ${max}`,
  alphanumeric: (field: string) => `${field} must contain only letters and numbers`,
  url: 'Please provide a valid URL',
  pattern: (field: string, pattern: string) => `${field} format is invalid (${pattern})`,
};

// Core validation functions
export const validators = {
  required: (value: any): boolean => {
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return !isNaN(value);
    if (typeof value === 'boolean') return true;
    if (Array.isArray(value)) return value.length > 0;
    return value != null;
  },

  minLength: (value: string, min: number): boolean => {
    return typeof value === 'string' && value.trim().length >= min;
  },

  maxLength: (value: string, max: number): boolean => {
    return typeof value === 'string' && value.trim().length <= max;
  },

  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) && value.length <= 254;
  },

  phone: (value: string): boolean => {
    return patterns.kenyanPhone.test(value);
  },

  positiveNumber: (value: string | number): boolean => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(num) && num > 0;
  },

  integerNumber: (value: string | number): boolean => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(num) && Number.isInteger(num);
  },

  minNumber: (value: string | number, min: number): boolean => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(num) && num >= min;
  },

  maxNumber: (value: string | number, max: number): boolean => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(num) && num <= max;
  },

  rangeNumber: (value: string | number, min: number, max: number): boolean => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(num) && num >= min && num <= max;
  },

  alphanumeric: (value: string): boolean => {
    return patterns.alphanumeric.test(value);
  },

  url: (value: string): boolean => {
    return patterns.url.test(value);
  },

  objectId: (value: string): boolean => {
    return patterns.objectId.test(value);
  },

  slug: (value: string): boolean => {
    return patterns.slug.test(value);
  },

  price: (value: string | number): boolean => {
    if (typeof value === 'number') return value > 0;
    return patterns.price.test(value.toString());
  },
};

// Field validation result interface
export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
}

// Product-specific validation rules
export const productValidationRules = {
  product_id: {
    validate: (value: string): FieldValidationResult => {
      // Product ID is always valid - it will be auto-generated for new products
      // and existing products already have valid IDs
      return { isValid: true };
    },
  },

  name: {
    validate: (value: string): FieldValidationResult => {
      if (!validators.required(value)) {
        return { isValid: false, error: errorMessages.required('Product name') };
      }
      if (!validators.minLength(value, 2)) {
        return { isValid: false, error: errorMessages.minLength('Product name', 2) };
      }
      if (!validators.maxLength(value, 200)) {
        return { isValid: false, error: errorMessages.maxLength('Product name', 200) };
      }
      return { isValid: true };
    },
  },

  description: {
    validate: (value: string): FieldValidationResult => {
      if (value && !validators.maxLength(value, 2000)) {
        return { isValid: false, error: errorMessages.maxLength('Description', 2000) };
      }
      return { isValid: true };
    },
  },

  price: {
    validate: (value: string | number): FieldValidationResult => {
      if (!validators.required(value)) {
        return { isValid: false, error: errorMessages.required('Price') };
      }
      if (!validators.positiveNumber(value)) {
        return { isValid: false, error: errorMessages.positiveNumber('Price') };
      }
      return { isValid: true };
    },
  },

  stock: {
    validate: (value: string | number): FieldValidationResult => {
      if (!validators.required(value)) {
        return { isValid: false, error: errorMessages.required('Stock') };
      }
      if (!validators.integerNumber(value)) {
        return { isValid: false, error: errorMessages.integerNumber('Stock') };
      }
      if (!validators.minNumber(value, 0)) {
        return { isValid: false, error: errorMessages.minNumber('Stock', 0) };
      }
      return { isValid: true };
    },
  },

  category: {
    validate: (value: string): FieldValidationResult => {
      if (value && !validators.maxLength(value, 100)) {
        return { isValid: false, error: errorMessages.maxLength('Category', 100) };
      }
      return { isValid: true };
    },
  },

  subcategory: {
    validate: (value: string): FieldValidationResult => {
      if (value && !validators.maxLength(value, 100)) {
        return { isValid: false, error: errorMessages.maxLength('Subcategory', 100) };
      }
      return { isValid: true };
    },
  },

  originalPrice: {
    validate: (value: string | number): FieldValidationResult => {
      if (value && !validators.positiveNumber(value)) {
        return { isValid: false, error: errorMessages.positiveNumber('Original price') };
      }
      return { isValid: true };
    },
  },

  rating: {
    validate: (value: string | number): FieldValidationResult => {
      if (value && !validators.rangeNumber(value, 0, 5)) {
        return { isValid: false, error: errorMessages.rangeNumber('Rating', 0, 5) };
      }
      return { isValid: true };
    },
  },

  features: {
    validate: (value: string[]): FieldValidationResult => {
      if (Array.isArray(value)) {
        const invalidFeature = value.find(f => f && !validators.maxLength(f, 200));
        if (invalidFeature) {
          return { isValid: false, error: errorMessages.maxLength('Feature', 200) };
        }
      }
      return { isValid: true };
    },
  },

  images: {
    validate: (value: string[]): FieldValidationResult => {
      if (Array.isArray(value)) {
        const invalidUrl = value.find(url => url && !validators.url(url));
        if (invalidUrl) {
          return { isValid: false, error: errorMessages.url };
        }
      }
      return { isValid: true };
    },
  },
};

// Service-specific validation rules
export const serviceValidationRules = {
  service_id: {
    validate: (value: string): FieldValidationResult => {
      if (!validators.required(value)) {
        return { isValid: false, error: errorMessages.required('Service ID') };
      }
      if (!validators.minLength(value, 3)) {
        return { isValid: false, error: errorMessages.minLength('Service ID', 3) };
      }
      if (!validators.maxLength(value, 50)) {
        return { isValid: false, error: errorMessages.maxLength('Service ID', 50) };
      }
      if (!validators.slug(value)) {
        return { isValid: false, error: errorMessages.pattern('Service ID', 'lowercase, letters, numbers, and hyphens only') };
      }
      return { isValid: true };
    },
  },

  name: {
    validate: (value: string): FieldValidationResult => {
      if (!validators.required(value)) {
        return { isValid: false, error: errorMessages.required('Service name') };
      }
      if (!validators.minLength(value, 2)) {
        return { isValid: false, error: errorMessages.minLength('Service name', 2) };
      }
      if (!validators.maxLength(value, 200)) {
        return { isValid: false, error: errorMessages.maxLength('Service name', 200) };
      }
      return { isValid: true };
    },
  },

  description: {
    validate: (value: string): FieldValidationResult => {
      if (!validators.required(value)) {
        return { isValid: false, error: errorMessages.required('Description') };
      }
      if (!validators.minLength(value, 10)) {
        return { isValid: false, error: errorMessages.minLength('Description', 10) };
      }
      if (!validators.maxLength(value, 1000)) {
        return { isValid: false, error: errorMessages.maxLength('Description', 1000) };
      }
      return { isValid: true };
    },
  },

  category: {
    validate: (value: string): FieldValidationResult => {
      if (!validators.required(value)) {
        return { isValid: false, error: errorMessages.required('Category') };
      }
      if (!validators.maxLength(value, 100)) {
        return { isValid: false, error: errorMessages.maxLength('Category', 100) };
      }
      return { isValid: true };
    },
  },

  pricing: {
    validate: (value: string | number): FieldValidationResult => {
      if (!validators.required(value)) {
        return { isValid: false, error: errorMessages.required('Price') };
      }
      if (!validators.positiveNumber(value)) {
        return { isValid: false, error: errorMessages.positiveNumber('Price') };
      }
      return { isValid: true };
    },
  },

  estimated_duration: {
    validate: (value: string): FieldValidationResult => {
      if (value && !validators.maxLength(value, 100)) {
        return { isValid: false, error: errorMessages.maxLength('Estimated duration', 100) };
      }
      return { isValid: true };
    },
  },

  features: {
    validate: (value: string[]): FieldValidationResult => {
      if (Array.isArray(value)) {
        const invalidFeature = value.find(f => f && !validators.maxLength(f, 200));
        if (invalidFeature) {
          return { isValid: false, error: errorMessages.maxLength('Feature', 200) };
        }
      }
      return { isValid: true };
    },
  },
};

// Utility function to validate entire form
export const validateForm = <T extends Record<string, any>>(
  formData: T,
  validationRules: Record<keyof T, { validate: (value: any) => FieldValidationResult }>
): { isValid: boolean; errors: Partial<Record<keyof T, string>> } => {
  const errors: Partial<Record<keyof T, string>> = {};
  let isValid = true;

  for (const [field, rules] of Object.entries(validationRules)) {
    const result = rules.validate(formData[field as keyof T]);
    if (!result.isValid) {
      errors[field as keyof T] = result.error || 'Invalid value';
      isValid = false;
    }
  }

  return { isValid, errors };
};

// Cross-field validation for products
export const validateProductCrossFields = (formData: Record<string, any>): FieldValidationResult => {
  // Original price must be greater than current price
  if (formData.originalPrice && formData.price) {
    const originalPrice = parseFloat(formData.originalPrice);
    const currentPrice = parseFloat(formData.price);

    if (originalPrice <= currentPrice) {
      return {
        isValid: false,
        error: 'Original price must be greater than current price'
      };
    }
  }

  return { isValid: true };
};

// Sanitization functions
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const sanitizeNumber = (input: string | number): number | null => {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  return isNaN(num) ? null : num;
};

export const sanitizeInteger = (input: string | number): number | null => {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  if (isNaN(num) || !Number.isInteger(num)) return null;
  return num;
};