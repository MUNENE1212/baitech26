'use client'

import { useState, useEffect, useMemo } from 'react'
import { ProductCard } from './ProductCard'
import { Product } from '@/types'
import { Grid, List, SlidersHorizontal, X } from 'lucide-react'

interface ProductShowcaseProps {
  category?: string
  searchQuery?: string
  priceRange?: { min: number; max: number }
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'name'
}

export function ProductShowcase({
  category,
  searchQuery = '',
  priceRange,
  sortBy = 'newest'
}: ProductShowcaseProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>(category || 'all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (category) {
      setSelectedCategory(category)
    }
  }, [category])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/v1/products`)

      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const data = await response.json()
      const productsData = data.products || []
      setProducts(productsData)

      // Extract unique categories
      const uniqueCategories = [...new Set(productsData.map((p: Product) => p.category))]
      setCategories(uniqueCategories as string[])

      setError(null)
    } catch (err) {
      setError('Unable to load products')
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products]

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      )
    }

    // Price range filter
    if (priceRange) {
      filtered = filtered.filter(p =>
        p.price >= priceRange.min && p.price <= priceRange.max
      )
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'newest':
      default:
        filtered.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
    }

    return filtered
  }, [products, selectedCategory, searchQuery, priceRange, sortBy])

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-8 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchProducts}
          className="mt-4 rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with View Toggle and Filters */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{filteredAndSortedProducts.length}</span>{' '}
            {filteredAndSortedProducts.length === 1 ? 'product' : 'products'} found
          </p>

          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 hover:bg-amber-200 transition-colors"
            >
              {selectedCategory}
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>

          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-300 bg-white">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${
                viewMode === 'grid'
                  ? 'bg-amber-400 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50'
              } rounded-l-lg transition-colors`}
              aria-label="Grid view"
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${
                viewMode === 'list'
                  ? 'bg-amber-400 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50'
              } rounded-r-lg transition-colors`}
              aria-label="List view"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`
              rounded-full px-4 py-2 text-sm font-medium transition-all
              ${selectedCategory === 'all'
                ? 'bg-amber-400 text-gray-900 shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                rounded-full px-4 py-2 text-sm font-medium transition-all
                ${selectedCategory === cat
                  ? 'bg-amber-400 text-gray-900 shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className={`
          grid gap-6
          ${viewMode === 'grid'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
          }
        `}>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`
                animate-pulse rounded-lg bg-gray-200
                ${viewMode === 'grid' ? 'h-[400px]' : 'h-[200px]'}
              `}
            />
          ))}
        </div>
      )}

      {/* Products Display */}
      {!loading && filteredAndSortedProducts.length > 0 && (
        <div className={`
          grid gap-6
          ${viewMode === 'grid'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
          }
        `}>
          {filteredAndSortedProducts.map((product, index) => (
            <div
              key={product._id}
              className="animate-fadeIn"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredAndSortedProducts.length === 0 && (
        <div className="py-16 text-center">
          <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center">
            <SlidersHorizontal className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="mt-6 text-lg font-semibold text-gray-900">
            No products found
          </h3>
          <p className="mt-2 text-gray-600">
            Try adjusting your filters or search query
          </p>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="mt-4 rounded-lg bg-amber-400 px-6 py-2 text-sm font-medium text-gray-900 hover:bg-amber-500 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
