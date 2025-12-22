import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    const isValid = await bcrypt.compare(password, hashedPassword);
    return isValid;
  } catch (error) {
    // If comparison fails, return false instead of throwing
    return false;
  }
}

/**
 * Generate a random password
 */
export function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  // Ensure password has at least one of each: lowercase, uppercase, number, special char
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);

  if (!hasLowercase || !hasUppercase || !hasNumber || !hasSpecial) {
    // If missing any required character type, generate again
    return generateRandomPassword(length);
  }

  return password;
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
  score: number; // 0-100
} {
  const errors: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score += 20;
  }

  // Contains lowercase
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 20;
  }

  // Contains uppercase
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 20;
  }

  // Contains number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 20;
  }

  // Contains special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    score += 20;
  }

  // Additional score for longer passwords
  if (password.length >= 12) {
    score = Math.min(100, score + 10);
  }

  return {
    isValid: errors.length === 0,
    errors,
    score,
  };
}

/**
 * Check if password has been pwned (basic implementation)
 */
export async function checkPasswordPwned(password: string): Promise<{
  isPwned: boolean;
  occurrences?: number;
}> {
  // This is a simplified implementation
  // In production, you'd use the HaveIBeenPwned API

  // Check against common weak passwords
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey',
    '1234567890', 'password1', '123123', 'qwerty123', 'starwars'
  ];

  const isPwned = commonPasswords.includes(password.toLowerCase());

  return {
    isPwned,
    occurrences: isPwned ? 1000000 : undefined,
  };
}