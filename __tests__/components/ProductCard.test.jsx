/**
 * ProductCard Component Tests
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProductCard from '../../components/products/ProductCard'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }) => <img alt={alt} {...props} />
}))

describe('ProductCard Component', () => {
  const mockProduct = {
    id: '1',
    product_id: 'PROD-001',
    name: 'Test Product',
    description: 'A great test product',
    price: 99.99,
    stock: 10,
    category: 'electronics',
    images: ['test-image.jpg'],
    featured: false,
    rating: 4.5,
    num_reviews: 25
  }

  const mockOnAddToCart = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} onAddToCart={mockOnAddToCart} />)

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('KES 99.99')).toBeInTheDocument()
    expect(screen.getByText('A great test product')).toBeInTheDocument()
    expect(screen.getByAltText('Test Product')).toBeInTheDocument()
  })

  it('displays stock status correctly', () => {
    render(<ProductCard product={mockProduct} onAddToCart={mockOnAddToCart} />)

    expect(screen.getByText('In Stock')).toBeInTheDocument()
  })

  it('shows out of stock when stock is 0', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 }

    render(<ProductCard product={outOfStockProduct} onAddToCart={mockOnAddToCart} />)

    expect(screen.getByText('Out of Stock')).toBeInTheDocument()
    expect(screen.getByText('Notify Me')).toBeInTheDocument()
  })

  it('displays rating when available', () => {
    render(<ProductCard product={mockProduct} onAddToCart={mockOnAddToCart} />)

    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('(25 reviews)')).toBeInTheDocument()
  })

  it('hides rating when not available', () => {
    const productWithoutRating = { ...mockProduct, rating: 0, num_reviews: 0 }

    render(<ProductCard product={productWithoutRating} onAddToCart={mockOnAddToCart} />)

    expect(screen.queryByText('4.5')).not.toBeInTheDocument()
    expect(screen.queryByText('25 reviews')).not.toBeInTheDocument()
  })

  it('shows featured badge when product is featured', () => {
    const featuredProduct = { ...mockProduct, featured: true }

    render(<ProductCard product={featuredProduct} onAddToCart={mockOnAddToCart} />)

    expect(screen.getByText('Featured')).toBeInTheDocument()
  })

  it('shows discount badge when product is on sale', () => {
    const saleProduct = {
      ...mockProduct,
      is_on_sale: true,
      original_price: 149.99,
      discount_percentage: 33
    }

    render(<ProductCard product={saleProduct} onAddToCart={mockOnAddToCart} />)

    expect(screen.getByText('33% OFF')).toBeInTheDocument()
    expect(screen.getByText('KES 149.99')).toBeInTheDocument()
  })

  it('calls onAddToCart when add to cart button is clicked', () => {
    render(<ProductCard product={mockProduct} onAddToCart={mockOnAddToCard} />)

    const addToCartButton = screen.getByText('Add to Cart')
    fireEvent.click(addToCartButton)

    expect(mockOnAddToCart).toHaveBeenCalledTimes(1)
    expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct)
  })

  it('disables add to cart button when out of stock', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 }

    render(<ProductCard product={outOfStockProduct} onAddToCart={mockOnAddToCart} />)

    const addToCartButton = screen.queryByText('Add to Cart')
    expect(addToCartButton).not.toBeInTheDocument()
  })

  it('shows hot deal badge when applicable', () => {
    const hotDealProduct = { ...mockProduct, is_hot_deal: true }

    render(<ProductCard product={hotDealProduct} onAddToCart={mockOnAddToCart} />)

    expect(screen.getByText('Hot Deal')).toBeInTheDocument()
  })

  it('shows loading state during add to cart', async () => {
    // Mock the onAddToCart to return a promise
    mockOnAddToCart.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<ProductCard product={mockProduct} onAddToCart={mockOnAddToCart} />)

    const addToCartButton = screen.getByText('Add to Cart')
    fireEvent.click(addToCartButton)

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('Adding...')).toBeInTheDocument()
      expect(addToCartButton).toBeDisabled()
    })

    // Should return to normal after promise resolves
    await waitFor(() => {
      expect(screen.getByText('Add to Cart')).toBeInTheDocument()
      expect(addToCartButton).not.toBeDisabled()
    }, { timeout: 200 })
  })

  it('handles missing images gracefully', () => {
    const productWithoutImages = { ...mockProduct, images: [] }

    render(<ProductCard product={productWithoutImages} onAddToCart={mockOnAddToCart} />)

    expect(screen.getByAltText('Product image')).toBeInTheDocument()
  })

  it('formats price correctly for large amounts', () => {
    const expensiveProduct = { ...mockProduct, price: 125000 }

    render(<ProductCard product={expensiveProduct} onAddToCart={mockOnAddToCart} />)

    expect(screen.getByText('KES 125,000')).toBeInTheDocument()
  })

  it('shows low stock warning when applicable', () => {
    const lowStockProduct = { ...mockProduct, stock: 2 }

    render(<ProductCard product={lowStockProduct} onAddToCart={mockOnAddToCart} />)

    expect(screen.getByText('Only 2 left!')).toBeInTheDocument()
  })
})