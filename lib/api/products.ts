/**
 * Product API endpoints
 */

import { apiClient } from './client-nextjs-only'
import type { Product } from 'src/types'

/**
 * Fetch a single product by ID
 */
export async function getProductById(id: string): Promise<Product> {
  console.log(`getProductById called with ID: ${id}`)

  try {
    console.log(`Fetching product with ID: ${id}`)

    // Try to fetch single product from backend
    const response = await apiClient.getProduct(id)
    console.log(`API response for product ${id}:`, response)

    if (response.success && response.data) {
      console.log(`Successfully got product data:`, response.data)
      // The API returns {success: true, data: product}, and apiClient wraps it again
      // So response.data is {success: true, data: product}, and response.data.data is the product
      return (response.data as any).data
    } else {
      console.log(`API call failed, response:`, response)
      throw new Error(response.error || 'Failed to fetch product')
    }
  } catch (error) {
    console.log(`Single product endpoint failed, falling back to all products. Error:`, error)

    try {
      const allProducts = await getAllProducts()
      console.log(`Fetched ${allProducts.length} products, searching for ID: ${id}`)

      // Log first few products to see their structure
      console.log(`Sample products:`, allProducts.slice(0, 2))

      const product = allProducts.find(p => {
        const matches = p.id === id || p._id === id || p.product_id === id
        if (matches) {
          console.log(`Found matching product:`, p)
        }
        return matches
      })

      if (!product) {
        console.log(`Product with ID ${id} not found in all products`)
        throw new Error(`Product with ID ${id} not found`)
      }

      console.log(`Found product:`, product.name)
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
  try {
    // Direct fetch to bypass complex API client and ensure we get the right data
    const response = await fetch('/api/products')
    const responseData = await response.json()

    console.log('getAllProducts API response:', responseData)

    // Handle both cached and fresh response structures
    // Fresh: { products: [...], pagination: {...} }
    // Cached: { success: true, data: { products: [...], pagination: {...} }, cached: true }
    if (Array.isArray(responseData)) {
      return responseData
    }
    return responseData.data?.products || responseData.products || []
  } catch (error) {
    console.error('Failed to fetch all products:', error)
    return []
  }
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
  try {
    const response = await apiClient.getProducts({ search: query })
    if (response.success && response.data) {
      if (Array.isArray(response.data)) {
        return response.data
      }
      return response.data.products || []
    }
    return []
  } catch (error) {
    console.error('Failed to search products:', error)
    return []
  }
}

/**
 * Fetch products by category
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const response = await apiClient.getProducts({ category })
    if (response.success && response.data) {
      if (Array.isArray(response.data)) {
        return response.data
      }
      return response.data.products || []
    }
    return []
  } catch (error) {
    console.error('Failed to fetch products by category:', error)
    return []
  }
}
