/**
 * Product API endpoints
 */

import { api } from './client'
import type { Product } from '@/types'

/**
 * Fetch a single product by ID
 */
export async function getProductById(id: string): Promise<Product> {
  try {
    // Try to fetch single product from backend
    return await api.get<Product>(`/api/v1/products/${id}`)
  } catch (error) {
    // If single product endpoint doesn't exist, fall back to fetching all products
    console.warn(`Single product endpoint failed, falling back to all products`)

    try {
      const allProducts = await getAllProducts()
      const product = allProducts.find(p => p._id === id)

      if (!product) {
        throw new Error(`Product with ID ${id} not found`)
      }

      return product
    } catch (fallbackError) {
      console.error(`Failed to fetch product ${id}:`, fallbackError)
      throw fallbackError
    }
  }
}

/**
 * Fetch all products
 */
export async function getAllProducts(): Promise<Product[]> {
  const response = await api.get<Product[] | {products: Product[], total: number}>('/api/v1/products')

  // Handle both response formats: direct array or object with products property
  if (Array.isArray(response)) {
    return response
  }

  return response.products || []
}

/**
 * Fetch related products (same category, excluding current product)
 */
export async function getRelatedProducts(
  productId: string,
  category: string,
  limit: number = 8
): Promise<Product[]> {
  try {
    // Fetch all products and filter on client side
    // In production, this should be done on the backend
    const allProducts = await getAllProducts()

    return allProducts
      .filter(product =>
        product._id !== productId && // Exclude current product
        product.category === category // Same category
      )
      .slice(0, limit) // Limit results
  } catch (error) {
    console.error('Failed to fetch related products:', error)
    return []
  }
}

/**
 * Search products by query
 */
export async function searchProducts(query: string): Promise<Product[]> {
  return api.get<Product[]>(`/api/v1/products/search?q=${encodeURIComponent(query)}`)
}

/**
 * Fetch products by category
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const allProducts = await getAllProducts()
    return allProducts.filter(product => product.category === category)
  } catch (error) {
    console.error('Failed to fetch products by category:', error)
    return []
  }
}
