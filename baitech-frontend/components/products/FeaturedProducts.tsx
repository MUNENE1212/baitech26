'use client'

import { useState, useEffect } from 'react'
import { ProductCard } from './ProductCard'
import { Product } from '@/types'
import { Sparkles, TrendingUp, Zap } from 'lucide-react'

interface FeaturedProductsProps {
  initialProducts?: Product[]
  maxProducts?: number
  title?: string
  showFilters?: boolean
}

type FilterType = 'all' | 'trending' | 'new' | 'deals'

export function FeaturedProducts({
  initialProducts = [],
  maxProducts = 8,
  title = "Featured Products",
  showFilters = true
}: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [filter, setFilter] = useState<FilterType>('all')
  const [loading, setLoading] = useState(!initialProducts.length)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!initialProducts.length) {
      fetchProducts()
    }
  }, [initialProducts.length])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/v1/products?featured=true&limit=${maxProducts}`)

      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const data = await response.json()
      // Handle both response formats: direct array or object with products property
      setProducts(Array.isArray(data) ? data : (data.products || []))
      setError(null)
    } catch (err) {
      setError('Unable to load featured products')
      console.error('Error fetching featured products:', err)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredProducts = () => {
    let filtered = [...products]

    switch (filter) {
      case 'trending':
        // Sort by some popularity metric - here we'll use featured flag and stock
        filtered = filtered.sort((a, b) => {
          const aScore = (a.featured ? 10 : 0) + (100 - a.stock)
          const bScore = (b.featured ? 10 : 0) + (100 - b.stock)
          return bScore - aScore
        })
        break
      case 'new':
        // Sort by newest first
        filtered = filtered.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        break
      case 'deals':
        // Show items with lower prices first
        filtered = filtered.sort((a, b) => a.price - b.price)
        break
      default:
        // Default: featured first, then by creation date
        filtered = filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
    }

    return filtered.slice(0, maxProducts)
  }

  const filterButtons = [
    { id: 'all' as FilterType, label: 'All', icon: Sparkles },
    { id: 'trending' as FilterType, label: 'Trending', icon: TrendingUp },
    { id: 'new' as FilterType, label: 'New Arrivals', icon: Zap },
    { id: 'deals' as FilterType, label: 'Best Deals', icon: Sparkles },
  ]

  if (error) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="rounded-lg bg-red-50 p-8 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchProducts}
              className="mt-4 rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    )
  }

  const filteredProducts = getFilteredProducts()

  return (
    <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {title}
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Discover our hand-picked selection of premium tech products
          </p>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
            {filterButtons.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`
                  flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium
                  transition-all duration-200
                  ${filter === id
                    ? 'bg-amber-400 text-gray-900 shadow-md scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(maxProducts)].map((_, i) => (
              <div
                key={i}
                className="h-[400px] animate-pulse rounded-lg bg-gray-200"
              />
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!loading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product, index) => (
              <div
                key={product._id}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <div className="py-12 text-center">
            <Sparkles className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No products found
            </h3>
            <p className="mt-2 text-gray-600">
              Try changing your filter or check back later
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
