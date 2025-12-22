/**
 * Environment Variables Validation and Security Manager
 */

import { z } from 'zod';

// Environment variable schema with validation
const envSchema = z.object({
  // Database
  MONGODB_URI: z.string().url('MongoDB URI must be a valid URL'),

  // JWT Configuration
  JWT_SECRET: z.string().min(64, 'JWT secret must be at least 64 characters'),
  JWT_EXPIRES_IN: z.string().default('24h'),

  // Next.js
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),

  // CORS
  ALLOWED_ORIGINS: z.string().optional(),

  // File Upload
  MAX_FILE_SIZE: z.coerce.number().int().min(1).default(5 * 1024 * 1024),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'Cloudinary cloud name is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'Cloudinary API key is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'Cloudinary API secret is required'),

  // Security
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  SESSION_SECRET: z.string().min(32, 'Session secret must be at least 32 characters'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1000).default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().min(1).default(50),

  // API
  NEXT_PUBLIC_API_URL: z.string().url().optional(),

  // Email (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().optional(),
  SMTP_USER: z.string().email().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),

  // Redis (optional)
  REDIS_URL: z.string().url().optional(),
  REDIS_URI: z.string().url().optional(),
});

// Validate environment variables
function validateEnv() {
  try {
    const env = envSchema.parse(process.env);

    // Additional security checks
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check for default/weak secrets
    if (env.JWT_SECRET.includes('your-secret') ||
        env.JWT_SECRET.includes('change-in-production')) {
      errors.push('JWT_SECRET appears to be using default value. Change immediately!');
    }

    if (env.SESSION_SECRET.includes('your-secret') ||
        env.SESSION_SECRET.includes('change-in-production')) {
      errors.push('SESSION_SECRET appears to be using default value. Change immediately!');
    }

    // Check if secrets are sufficiently random
    const secretEntropy = new Set(env.JWT_SECRET).size;
    if (secretEntropy < 20) {
      warnings.push('JWT_SECRET may not be sufficiently random');
    }

    // Check if running in development with production-like values
    if (env.NODE_ENV === 'development') {
      if (!env.MONGODB_URI.includes('localhost') && !env.MONGODB_URI.includes('127.0.0.1')) {
        warnings.push('Using production database in development mode');
      }

      if (env.NEXT_PUBLIC_API_URL?.includes('baitech.co.ke')) {
        warnings.push('Using production API in development mode');
      }
    }

    // Security configuration checks
    if (env.JWT_EXPIRES_IN.includes('7d') && env.NODE_ENV === 'production') {
      warnings.push('Consider reducing JWT expiry time for production');
    }

    if (env.MAX_FILE_SIZE > 10 * 1024 * 1024) {
      warnings.push('Large file upload size may pose security risks');
    }

    return {
      env,
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
    }
    throw error;
  }
}

// Secure credentials manager class
export class CredentialsManager {
  private static instance: CredentialsManager;
  private validatedEnv: z.infer<typeof envSchema>;
  private securityChecks: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };

  private constructor() {
    const validation = validateEnv();
    this.validatedEnv = validation.env;
    this.securityChecks = {
      isValid: validation.isValid,
      errors: validation.errors,
      warnings: validation.warnings,
    };

    // Log security issues
    if (validation.errors.length > 0) {
      console.error('🚨 CRITICAL SECURITY ISSUES:');
      validation.errors.forEach(error => console.error(`  - ${error}`));
    }

    if (validation.warnings.length > 0) {
      console.warn('⚠️  SECURITY WARNINGS:');
      validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
    }

    // In production, fail on critical errors
    if (this.validatedEnv.NODE_ENV === 'production' && validation.errors.length > 0) {
      throw new Error('Production deployment blocked due to security configuration errors');
    }
  }

  static getInstance(): CredentialsManager {
    if (!CredentialsManager.instance) {
      CredentialsManager.instance = new CredentialsManager();
    }
    return CredentialsManager.instance;
  }

  // Safe getters for environment variables
  get mongodbUri(): string {
    return this.validatedEnv.MONGODB_URI;
  }

  get jwtSecret(): string {
    return this.validatedEnv.JWT_SECRET;
  }

  get jwtExpiresIn(): string {
    return this.validatedEnv.JWT_EXPIRES_IN;
  }

  get isDevelopment(): boolean {
    return this.validatedEnv.NODE_ENV === 'development';
  }

  get isProduction(): boolean {
    return this.validatedEnv.NODE_ENV === 'production';
  }

  get maxFileSize(): number {
    return this.validatedEnv.MAX_FILE_SIZE;
  }

  get bcryptRounds(): number {
    return this.validatedEnv.BCRYPT_ROUNDS;
  }

  get sessionSecret(): string {
    return this.validatedEnv.SESSION_SECRET;
  }

  get cloudinaryConfig() {
    return {
      cloudName: this.validatedEnv.CLOUDINARY_CLOUD_NAME,
      apiKey: this.validatedEnv.CLOUDINARY_API_KEY,
      apiSecret: this.validatedEnv.CLOUDINARY_API_SECRET,
    };
  }

  get rateLimitConfig() {
    return {
      windowMs: this.validatedEnv.RATE_LIMIT_WINDOW_MS,
      maxRequests: this.validatedEnv.RATE_LIMIT_MAX_REQUESTS,
    };
  }

  get allowedOrigins(): string[] {
    if (!this.validatedEnv.ALLOWED_ORIGINS) {
      return this.isDevelopment
        ? ['http://localhost:3000', 'http://localhost:3001']
        : ['https://baitech.co.ke', 'https://www.baitech.co.ke'];
    }
    return this.validatedEnv.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
  }

  get emailConfig() {
    return {
      host: this.validatedEnv.SMTP_HOST,
      port: this.validatedEnv.SMTP_PORT,
      user: this.validatedEnv.SMTP_USER,
      pass: this.validatedEnv.SMTP_PASS,
      fromEmail: this.validatedEnv.FROM_EMAIL,
    };
  }

  // Security checks
  getSecurityStatus() {
    return this.securityChecks;
  }

  // Generate secure secrets
  static generateSecureSecret(length: number = 64): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let result = '';
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);

    for (let i = 0; i < length; i++) {
      result += charset[bytes[i] % charset.length];
    }

    return result;
  }

  // Method to rotate secrets
  static generateNewSecrets() {
    return {
      jwtSecret: this.generateSecureSecret(64),
      sessionSecret: this.generateSecureSecret(64),
      nextauthSecret: this.generateSecureSecret(64),
    };
  }
}

// Export singleton instance
export const credentialsManager = CredentialsManager.getInstance();

// Export safe getters for backward compatibility
export const env = {
  MONGODB_URI: credentialsManager.mongodbUri,
  JWT_SECRET: credentialsManager.jwtSecret,
  JWT_EXPIRES_IN: credentialsManager.jwtExpiresIn,
  NODE_ENV: credentialsManager.isDevelopment ? 'development' : 'production',
  MAX_FILE_SIZE: credentialsManager.maxFileSize,
  BCRYPT_ROUNDS: credentialsManager.bcryptRounds,
  SESSION_SECRET: credentialsManager.sessionSecret,
};