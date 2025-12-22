/**
 * Products API Routes Tests
 */

import { NextRequest } from 'next/server'
import { GET, POST } from '../../app/api/products/route'

// Mock the dependencies
jest.mock('../../src/lib/database/connection')
jest.mock('../../src/lib/cache/cache')
jest.mock('../../src/lib/auth/middleware')

const mockDb = {
  collection: jest.fn(() => ({
    find: jest.fn(() => ({
      toArray: jest.fn(),
      countDocuments: jest.fn(),
      sort: jest.fn(() => ({
        skip: jest.fn(() => ({
          limit: jest.fn(() => ({
            toArray: jest.fn()
          }))
        }))
      }))
    })),
    insertOne: jest.fn(),
    findOne: jest.fn()
  }))
}

const mockCacheService = {
  get: jest.fn(),
  set: jest.fn(),
  invalidateProductCaches: jest.fn()
}

// Setup mocks before all tests
beforeAll(() => {
  const { connectMongoDB } = require('../../src/lib/database/connection')
  const { cacheService } = require('../../src/lib/cache/cache')

  connectMongoDB.mockResolvedValue(mockDb)
  Object.assign(cacheService, mockCacheService)
})

describe('Products API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/products', () => {
    it('should return products list successfully', async () => {
      // Arrange
      const mockProducts = [
        {
          _id: { toString: () => '1' },
          product_id: 'prod1',
          name: 'Test Product 1',
          price: 99.99,
          stock: 10,
          category: 'electronics',
          images: ['image1.jpg'],
          featured: false,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]

      mockDb.collection().find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue(mockProducts)
            })
          })
        })
      })

      mockDb.collection().countDocuments.mockResolvedValue(1)
      mockCacheService.get.mockResolvedValue(null)

      // Act
      const request = new NextRequest('http://localhost:3000/api/products')
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.products)).toBe(true)
      expect(data.products).toHaveLength(1)
      expect(data.pagination).toBeDefined()
    })

    it('should use cached products when available', async () => {
      // Arrange
      const cachedResponse = {
        products: [{ id: '1', name: 'Cached Product' }],
        pagination: { current_page: 1, total_pages: 1 }
      }

      mockCacheService.get.mockResolvedValue(cachedResponse)

      // Act
      const request = new NextRequest('http://localhost:3000/api/products')
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.cached).toBe(true)
      expect(data.products).toEqual(cachedResponse.products)

      // Should not hit database
      expect(mockDb.collection().find).not.toHaveBeenCalled()
    })

    it('should filter products by category', async () => {
      // Arrange
      mockDb.collection().find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([])
            })
          })
        })
      })

      mockDb.collection().countDocuments.mockResolvedValue(0)
      mockCacheService.get.mockResolvedValue(null)

      // Act
      const request = new NextRequest('http://localhost:3000/api/products?category=electronics')
      const response = await GET(request)

      // Assert
      expect(response.status).toBe(200)
      expect(mockDb.collection().find).toHaveBeenCalledWith({
        category: 'electronics'
      })
    })

    it('should handle search functionality', async () => {
      // Arrange
      mockDb.collection().find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([])
            })
          })
        })
      })

      mockDb.collection().countDocuments.mockResolvedValue(0)
      mockCacheService.get.mockResolvedValue(null)

      // Act
      const request = new NextRequest('http://localhost:3000/api/products?search=laptop')
      const response = await GET(request)

      // Assert
      expect(response.status).toBe(200)
      expect(mockDb.collection().find).toHaveBeenCalledWith({
        $or: [
          { name: { $regex: 'laptop', $options: 'i' } },
          { description: { $regex: 'laptop', $options: 'i' } },
          { category: { $regex: 'laptop', $options: 'i' } },
          { subcategory: { $regex: 'laptop', $options: 'i' } }
        ]
      })
    })
  })

  describe('POST /api/products', () => {
    it('should reject unauthorized requests', async () => {
      // Arrange
      const { requireAdmin } = require('../../src/lib/auth/middleware')
      requireAdmin.mockImplementation((handler) => async () => {
        return new Response(JSON.stringify({
          success: false,
          error: 'Authorization required'
        }), { status: 401 })
      })

      // Act
      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({
          product_id: 'test-product',
          name: 'Test Product',
          price: 99.99,
          stock: 10
        })
      })
      const response = await POST(request)

      // Assert
      expect(response.status).toBe(401)
    })

    it('should validate product creation data', async () => {
      // Mock requireAdmin to allow the request through
      const { requireAdmin } = require('../../src/lib/auth/middleware')
      requireAdmin.mockImplementation((handler) => async (req) => {
        return handler(req, { user_id: 'test-user', role: 'admin' })
      })

      // Act
      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({
          // Missing required fields
          name: 'Test Product'
        })
      })
      const response = await POST(request)

      // Assert
      expect(response.status).toBe(400)
    })

    it('should handle database errors gracefully', async () => {
      // Mock authentication to pass
      const { requireAdmin } = require('../../src/lib/auth/middleware')
      requireAdmin.mockImplementation((handler) => async (req) => {
        return handler(req, { user_id: 'test-user', role: 'admin' })
      })

      // Mock database error
      mockDb.collection().findOne.mockRejectedValue(new Error('Database connection failed'))

      // Act
      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({
          product_id: 'test-product',
          name: 'Test Product',
          price: 99.99,
          stock: 10
        })
      })
      const response = await POST(request)

      // Assert
      expect(response.status).toBe(500)
    })
  })
})