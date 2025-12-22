import Joi from 'joi';
import { UserRole, ServiceStatus, OrderStatus, PaymentStatus } from '../../types';

/**
 * Common validation patterns
 */
const patterns = {
  objectId: /^[0-9a-fA-F]{24}$/,
  kenyanPhone: /^(\+254|0)?[17]\d{8}$/,
  price: /^\d+(\.\d{1,2})?$/,
  slug: /^[a-z0-9-]+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  url: /^https?:\/\/.+/,
  color: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
};

/**
 * Common validation functions
 */

/**
 * Sanitization helpers
 */
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const sanitizeHtml = (input: string): string => {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

// User validation schemas
export const userCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must not exceed 100 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
      'any.required': 'Password is required',
    }),
  role: Joi.string()
    .valid(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.TECHNICIAN)
    .default(UserRole.CUSTOMER)
    .messages({
      'any.only': 'Invalid role specified',
    }),
  phone: Joi.string()
    .pattern(/^[+]?[\d\s\-\(\)]+$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number',
    }),
  address: Joi.string().max(500).optional(),
});

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

export const userUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
    .optional(),
  phone: Joi.string()
    .pattern(/^[+]?[\d\s\-\(\)]+$/)
    .optional(),
  address: Joi.string().max(500).optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

// Product validation schemas
export const productCreateSchema = Joi.object({
  product_id: Joi.string()
    .alphanum()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.alphanum': 'Product ID must contain only letters and numbers',
      'string.min': 'Product ID must be at least 3 characters',
      'string.max': 'Product ID must not exceed 50 characters',
      'any.required': 'Product ID is required',
    }),
  name: Joi.string().min(2).max(200).required().messages({
    'string.empty': 'Product name is required',
    'string.min': 'Product name must be at least 2 characters',
    'string.max': 'Product name must not exceed 200 characters',
    'any.required': 'Product name is required',
  }),
  description: Joi.string().max(2000).optional(),
  price: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.positive': 'Price must be a positive number',
      'any.required': 'Price is required',
    }),
  stock: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'number.base': 'Stock must be a number',
      'number.integer': 'Stock must be a whole number',
      'number.min': 'Stock cannot be negative',
      'any.required': 'Stock is required',
    }),
  category: Joi.string().max(100).optional(),
  subcategory: Joi.string().max(100).optional(),
  features: Joi.array()
    .items(Joi.string().max(200))
    .default([])
    .messages({
      'array.base': 'Features must be an array',
    }),
  images: Joi.array()
    .items(Joi.string().uri())
    .default([])
    .messages({
      'array.base': 'Images must be an array',
      'string.uri': 'Each image must be a valid URL',
    }),
  featured: Joi.boolean().default(false),
  seo: Joi.object({
    title: Joi.string().max(60).optional(),
    description: Joi.string().max(300).optional(),
    keywords: Joi.array().items(Joi.string().max(50)).default([]),
  }).optional(),
});

export const productUpdateSchema = Joi.object({
  product_id: Joi.string().alphanum().min(3).max(50).optional(),
  name: Joi.string().min(2).max(200).optional(),
  description: Joi.string().max(2000).optional(),
  price: Joi.number().positive().precision(2).optional(),
  stock: Joi.number().integer().min(0).optional(),
  category: Joi.string().max(100).optional(),
  subcategory: Joi.string().max(100).optional(),
  features: Joi.array().items(Joi.string().max(100)).optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  featured: Joi.boolean().optional(),
  is_active: Joi.boolean().optional(),
  // Additional fields from frontend
  isHotDeal: Joi.boolean().optional(),
  is_hot_deal: Joi.boolean().optional(),
  originalPrice: Joi.number().positive().precision(2).optional(),
  original_price: Joi.number().positive().precision(2).optional(),
  rating: Joi.number().min(0).max(5).optional(),
  seo: Joi.object({
    title: Joi.string().max(60).optional(),
    description: Joi.string().max(300).optional(),
    keywords: Joi.array().items(Joi.string().max(50)).optional(),
  }).optional(),
}).min(1);

// Service request validation schemas
export const serviceRequestCreateSchema = Joi.object({
  customer_name: Joi.string().min(2).max(100).required().messages({
    'any.required': 'Customer name is required',
  }),
  contact: Joi.string()
    .pattern(/^[+]?[\d\s\-\(\)]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid contact number',
      'any.required': 'Contact number is required',
    }),
  service_type: Joi.string().min(2).max(100).required().messages({
    'any.required': 'Service type is required',
  }),
  item: Joi.string().max(200).optional(),
  description: Joi.string().min(10).max(1000).required().messages({
    'string.min': 'Description must be at least 10 characters',
    'any.required': 'Description is required',
  }),
  location: Joi.object({
    address: Joi.string().max(500).optional(),
    coordinates: Joi.object({
      lat: Joi.number().min(-90).max(90).required(),
      lng: Joi.number().min(-180).max(180).required(),
    }).optional(),
  }).optional(),
  scheduled_date: Joi.date().min('now').optional().messages({
    'date.min': 'Scheduled date cannot be in the past',
  }),
});

// Order validation schemas
export const orderCreateSchema = Joi.object({
  customer_name: Joi.string().min(2).max(100).required().messages({
    'any.required': 'Customer name is required',
  }),
  customer_contact: Joi.string()
    .pattern(/^[+]?[\d\s\-\(\)]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid contact number',
      'any.required': 'Customer contact is required',
    }),
  customer_email: Joi.string().email().optional(),
  items: Joi.array()
    .items(
      Joi.object({
        product_id: Joi.string().required().messages({
          'any.required': 'Product ID is required',
        }),
        quantity: Joi.number()
          .integer()
          .min(1)
          .required()
          .messages({
            'number.min': 'Quantity must be at least 1',
            'any.required': 'Quantity is required',
          }),
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'Order must contain at least one item',
      'any.required': 'Items are required',
    }),
  service_note: Joi.string().max(500).optional(),
  shipping_address: Joi.object({
    street: Joi.string().max(200).required().messages({
      'any.required': 'Street address is required',
    }),
    city: Joi.string().max(100).required().messages({
      'any.required': 'City is required',
    }),
    postal_code: Joi.string().max(20).optional(),
    country: Joi.string().max(100).optional(),
  }).optional(),
});

// Order update schemas
export const orderUpdateSchema = Joi.object({
  order_status: Joi.string()
    .valid(OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED)
    .optional(),
  payment_status: Joi.string()
    .valid(PaymentStatus.PENDING, PaymentStatus.PAID, PaymentStatus.UNPAID, PaymentStatus.REFUNDED)
    .optional(),
  tracking_number: Joi.string().max(100).optional(),
  estimated_delivery: Joi.date().min('now').optional(),
  service_note: Joi.string().max(500).optional(),
}).min(1);

// Technician validation schemas
export const technicianCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'any.required': 'Technician name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  phone: Joi.string()
    .pattern(/^[+]?[\d\s\-\(\)]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number',
      'any.required': 'Phone number is required',
    }),
  specializations: Joi.array()
    .items(Joi.string().max(50))
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one specialization is required',
      'any.required': 'Specializations are required',
    }),
  experience: Joi.string().max(1000).required().messages({
    'any.required': 'Experience information is required',
  }),
  location: Joi.string().max(200).required().messages({
    'any.required': 'Location is required',
  }),
  bio: Joi.string().max(1000).optional(),
  certifications: Joi.array()
    .items(Joi.string().max(200))
    .optional(),
  availability: Joi.boolean().default(true),
});

export const technicianApplicationSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^[+]?[\d\s\-\(\)]+$/)
    .required(),
  specializations: Joi.array()
    .items(Joi.string().max(50))
    .min(1)
    .required(),
  experience: Joi.string().max(1000).required(),
  location: Joi.string().max(200).required(),
  bio: Joi.string().max(1000).optional(),
});

// Review validation schemas
export const reviewCreateSchema = Joi.object({
  customer_name: Joi.string().min(2).max(100).required().messages({
    'any.required': 'Customer name is required',
  }),
  product_id: Joi.string().optional(),
  service_id: Joi.string().optional(),
  technician_id: Joi.string().optional(),
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating must not exceed 5',
      'any.required': 'Rating is required',
    }),
  comment: Joi.string()
    .min(10)
    .max(1000)
    .required()
    .messages({
      'string.min': 'Comment must be at least 10 characters',
      'any.required': 'Comment is required',
    }),
}).xor('product_id', 'service_id', 'technician_id').messages({
  'object.xor': 'Review must be for exactly one: product, service, or technician',
});

export const technicianRatingSchema = Joi.object({
  technician_id: Joi.string().required().messages({
    'any.required': 'Technician ID is required',
  }),
  service_id: Joi.string().required().messages({
    'any.required': 'Service ID is required',
  }),
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating must not exceed 5',
      'any.required': 'Rating is required',
    }),
  feedback: Joi.string()
    .min(10)
    .max(1000)
    .required()
    .messages({
      'string.min': 'Feedback must be at least 10 characters',
      'any.required': 'Feedback is required',
    }),
  professionalism_rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .optional(),
  quality_rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .optional(),
  timeliness_rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .optional(),
});

// Query parameter validation schemas
export const productQuerySchema = Joi.object({
  search: Joi.string().max(100).optional(),
  category: Joi.string().max(100).optional(),
  subcategory: Joi.string().max(100).optional(),
  min_price: Joi.number().min(0).optional(),
  max_price: Joi.number().min(0).optional(),
  featured: Joi.boolean().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string()
    .valid('name', 'price', 'created_at', 'stock')
    .default('created_at'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
});

export const serviceQuerySchema = Joi.object({
  status: Joi.string()
    .valid(ServiceStatus.PENDING, ServiceStatus.ASSIGNED, ServiceStatus.IN_PROGRESS, ServiceStatus.COMPLETED, ServiceStatus.CANCELLED)
    .optional(),
  technician: Joi.string().optional(),
  date_from: Joi.date().optional(),
  date_to: Joi.date().min(Joi.ref('date_from')).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

export const orderQuerySchema = Joi.object({
  status: Joi.string()
    .valid(OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED)
    .optional(),
  payment_status: Joi.string()
    .valid(PaymentStatus.PENDING, PaymentStatus.PAID, PaymentStatus.UNPAID, PaymentStatus.REFUNDED)
    .optional(),
  customer_contact: Joi.string().optional(),
  date_from: Joi.date().optional(),
  date_to: Joi.date().min(Joi.ref('date_from')).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

// Utility function to validate request body
export function validateBody<T>(schema: Joi.ObjectSchema<T>) {
  return (data: unknown): { isValid: boolean; data?: T; errors?: string[] } => {
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return {
        isValid: false,
        errors: error.details.map(detail => detail.message),
      };
    }

    return {
      isValid: true,
      data: value,
    };
  };
}

// Utility function to validate query parameters
export function validateQuery<T>(schema: Joi.ObjectSchema<T>) {
  return (query: URLSearchParams): { isValid: boolean; data?: T; errors?: string[] } => {
    const params: Record<string, string | number | boolean> = {};

    // Convert URLSearchParams to object and handle type conversions
    for (const [key, value] of query.entries()) {
      if (value === 'true' || value === 'false') {
        params[key] = value === 'true';
      } else if (/^\d+$/.test(value)) {
        params[key] = parseInt(value, 10);
      } else if (/^\d+\.\d+$/.test(value)) {
        params[key] = parseFloat(value);
      } else {
        params[key] = value;
      }
    }

    const { error, value: validatedValue } = schema.validate(params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return {
        isValid: false,
        errors: error.details.map(detail => detail.message),
      };
    }

    return {
      isValid: true,
      data: validatedValue,
    };
  };
}

/**
 * Enhanced security validation schemas
 */

// Password reset request
export const passwordResetRequestSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
});

// Password reset confirmation
export const passwordResetConfirmSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required',
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
      'any.required': 'Password is required',
    }),
});

// Image upload validation
export const imageUploadSchema = Joi.object({
  files: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        size: Joi.number().max(5 * 1024 * 1024).required().messages({
          'number.max': 'File size must not exceed 5MB',
        }),
        type: Joi.string()
          .valid('image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif')
          .required()
          .messages({
            'any.only': 'Only JPEG, PNG, WebP, and AVIF images are allowed',
          }),
      })
    )
    .max(10)
    .required()
    .messages({
      'array.max': 'Cannot upload more than 10 files at once',
      'any.required': 'At least one file is required',
    }),
});

// Search and filtering schemas
export const productSearchSchema = Joi.object({
  search: Joi.string().max(200).optional(),
  category: Joi.string().max(50).optional(),
  subcategory: Joi.string().max(50).optional(),
  min_price: Joi.number().min(0).optional(),
  max_price: Joi.number().min(0).optional(),
  featured: Joi.boolean().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort_by: Joi.string()
    .valid('name', 'price', 'created_at', 'rating', 'stock')
    .default('created_at'),
  sort_order: Joi.string().valid('asc', 'desc').default('desc'),
});

export const orderSearchSchema = Joi.object({
  customer_contact: Joi.string().max(100).optional(),
  status: Joi.string()
    .valid(OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED)
    .optional(),
  payment_status: Joi.string()
    .valid(PaymentStatus.PENDING, PaymentStatus.PAID, PaymentStatus.UNPAID, PaymentStatus.REFUNDED)
    .optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  date_from: Joi.date().optional(),
  date_to: Joi.date().min(Joi.ref('date_from')).optional(),
});

// Admin dashboard filters
export const dashboardFiltersSchema = Joi.object({
  date_range: Joi.string().valid('7d', '30d', '90d', '1y').default('30d'),
  category: Joi.string().max(50).optional(),
  status: Joi.string().optional(),
});

// Bulk operations validation
export const bulkUpdateSchema = Joi.object({
  ids: Joi.array().items(Joi.string()).min(1).max(100).required().messages({
    'array.min': 'At least one ID must be provided',
    'array.max': 'Cannot process more than 100 items at once',
    'any.required': 'IDs are required',
  }),
  updates: Joi.object().min(1).required().messages({
    'object.min': 'At least one field must be updated',
    'any.required': 'Update data is required',
  }),
});

// File upload security validation
export const secureFileUploadSchema = Joi.object({
  file: Joi.object({
    name: Joi.string()
      .pattern(/^[a-zA-Z0-9\-_. ]+$/)
      .required()
      .messages({
        'string.pattern.base': 'File name contains invalid characters',
      }),
    size: Joi.number().max(10 * 1024 * 1024).required().messages({
      'number.max': 'File size must not exceed 10MB',
    }),
    type: Joi.string()
      .valid(
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/avif',
        'application/pdf',
        'text/csv'
      )
      .required()
      .messages({
        'any.only': 'File type not allowed',
      }),
    lastModified: Joi.number().optional(),
  }).required(),
});

// API key validation (for external integrations)
export const apiKeyValidationSchema = Joi.object({
  key: Joi.string().min(32).max(256).required().messages({
    'string.min': 'API key must be at least 32 characters',
    'any.required': 'API key is required',
  }),
  permissions: Joi.array()
    .items(Joi.string().valid('read', 'write', 'admin'))
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one permission must be specified',
      'any.required': 'Permissions are required',
    }),
  expires_at: Joi.date().min('now').optional(),
});

// Newsletter subscription
export const newsletterSubscribeSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  preferences: Joi.array()
    .items(Joi.string().valid('products', 'services', 'promotions', 'news'))
    .default(['products', 'promotions']),
});

// Contact form validation with enhanced security
export const contactFormSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  phone: Joi.string().pattern(patterns.kenyanPhone).optional(),
  subject: Joi.string().min(5).max(200).required().messages({
    'string.min': 'Subject must be at least 5 characters',
    'any.required': 'Subject is required',
  }),
  message: Joi.string().min(20).max(2000).required().messages({
    'string.min': 'Message must be at least 20 characters',
    'string.max': 'Message must not exceed 2000 characters',
    'any.required': 'Message is required',
  }),
  recaptcha_token: Joi.string().required().messages({
    'any.required': 'reCAPTCHA verification is required',
  }),
});

/**
 * Security middleware validation functions
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePhone = (phone: string): boolean => {
  return patterns.kenyanPhone.test(phone);
};

export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9\-_.]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
};

export const validateObjectId = (id: string): boolean => {
  return patterns.objectId.test(id);
};