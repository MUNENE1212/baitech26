/**
 * JWT Authentication Tests
 */

import {
  createAccessToken,
  verifyAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  extractTokenFromHeader,
  generatePasswordResetToken,
  verifyPasswordResetToken
} from '../../src/lib/auth/jwt'

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key-for-testing'

describe('JWT Authentication', () => {
  const mockUser = {
    user_id: '12345',
    email: 'test@example.com',
    role: 'admin'
  }

  describe('createAccessToken', () => {
    it('should create a valid access token', () => {
      const token = createAccessToken(mockUser)

      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
    })

    it('should create tokens with correct payload', () => {
      const token = createAccessToken(mockUser)
      const decoded = Buffer.from(token.split('.')[1], 'base64url').toString()
      const payload = JSON.parse(decoded)

      expect(payload.user_id).toBe(mockUser.user_id)
      expect(payload.email).toBe(mockUser.email)
      expect(payload.role).toBe(mockUser.role)
      expect(payload.iat).toBeDefined()
      expect(payload.exp).toBeDefined()
    })
  })

  describe('verifyAccessToken', () => {
    it('should verify a valid token', () => {
      const token = createAccessToken(mockUser)
      const decoded = verifyAccessToken(token)

      expect(decoded.user_id).toBe(mockUser.user_id)
      expect(decoded.email).toBe(mockUser.email)
      expect(decoded.role).toBe(mockUser.role)
    })

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here'

      expect(() => {
        verifyAccessToken(invalidToken)
      }).toThrow('Invalid token')
    })

    it('should throw error for expired token', () => {
      // Import the actual jsonwebtoken library to use its TokenExpiredError
      const jwt = require('jsonwebtoken')

      // Create a proper TokenExpiredError instance
      const tokenExpiredError = new jwt.TokenExpiredError('jwt expired', new Date(Date.now() - 1000))

      // Mock verify to throw the proper error
      const originalVerify = jwt.verify
      jwt.verify = jest.fn().mockImplementation(() => {
        throw tokenExpiredError
      })

      try {
        expect(() => {
          verifyAccessToken('expired-token')
        }).toThrow('Token expired')
      } finally {
        // Restore original function
        jwt.verify = originalVerify
      }
    })
  })

  describe('createRefreshToken', () => {
    it('should create a valid refresh token', () => {
      const token = createRefreshToken(mockUser)

      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3)
    })

    it('should have longer expiry than access token', () => {
      const accessToken = createAccessToken(mockUser)
      const refreshToken = createRefreshToken(mockUser)

      const accessDecoded = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64url').toString())
      const refreshDecoded = JSON.parse(Buffer.from(refreshToken.split('.')[1], 'base64url').toString())

      expect(refreshDecoded.exp).toBeGreaterThan(accessDecoded.exp)
    })
  })

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const token = createRefreshToken(mockUser)
      const decoded = verifyRefreshToken(token)

      expect(decoded.user_id).toBe(mockUser.user_id)
      expect(decoded.email).toBe(mockUser.email)
    })

    it('should throw error for invalid refresh token', () => {
      const invalidToken = 'invalid.refresh.token'

      expect(() => {
        verifyRefreshToken(invalidToken)
      }).toThrow('Invalid refresh token')
    })
  })

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Authorization header', () => {
      const token = createAccessToken(mockUser)
      const header = `Bearer ${token}`

      expect(extractTokenFromHeader(header)).toBe(token)
    })

    it('should return null for missing header', () => {
      expect(extractTokenFromHeader(undefined)).toBeNull()
    })

    it('should return null for invalid header format', () => {
      expect(extractTokenFromHeader('InvalidHeader')).toBeNull()
      expect(extractTokenFromHeader('Bearer')).toBeNull()
      expect(extractTokenFromHeader('Basic dGVzdA==')).toBeNull()
    })
  })

  describe('generatePasswordResetToken', () => {
    it('should create a password reset token', () => {
      const token = generatePasswordResetToken()

      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3)
    })

    it('should include password reset type in payload', () => {
      const token = generatePasswordResetToken()
      const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())

      expect(decoded.type).toBe('password_reset')
    })
  })

  describe('verifyPasswordResetToken', () => {
    it('should verify a valid password reset token', () => {
      const token = generatePasswordResetToken()

      expect(verifyPasswordResetToken(token)).toBe(true)
    })

    it('should reject invalid token', () => {
      const invalidToken = 'invalid.token.here'

      expect(verifyPasswordResetToken(invalidToken)).toBe(false)
    })

    it('should reject token with wrong type', () => {
      const { sign } = require('jsonwebtoken')
      const wrongTypeToken = sign(
        { type: 'email_verification' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      )

      expect(verifyPasswordResetToken(wrongTypeToken)).toBe(false)
    })
  })
})