'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProductGrid } from '@/components/products/ProductGrid'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { Product } from '@/types'
import HotDealsSlider from '@/components/products/HotDealsSlider'

function CatalogueContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [showFilters, setShowFilters] = useState(false)

  // Set category from URL on mount
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
  }, [searchParams])

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products`)
        const data = await response.json()
        // Handle both response formats: direct array or object with products property
        const productsData = Array.isArray(data) ? data : (data.products || [])
        setProducts(productsData)
        setFilteredProducts(productsData)
      } catch (error) {
        console.error('Failed to fetch products:', error)
        setProducts([])
        setFilteredProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Get unique categories
  const categories = ['all', ...new Set((products || []).map(p => p.category))]

  // Get featured/hot deals products (discounted items)
  const featuredProducts = (products || []).filter(p => p.originalPrice && p.originalPrice > p.price)

  // Handle reset all filters
  const resetFilters = () => {
    setSelectedCategory('all')
    setPriceRange('all')
    setSearchQuery('')
  }

  // Apply filters
  useEffect(() => {
    let result = [...products]

    // Search filter
    if (searchQuery) {
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory)
    }

    // Price range filter
    if (priceRange !== 'all') {
      const ranges: Record<string, [number, number]> = {
        under5k: [0, 5000],
        '5k-10k': [5000, 10000],
        '10k-20k': [10000, 20000],
        '20k-50k': [20000, 50000],
        over50k: [50000, Infinity],
      }
      const [min, max] = ranges[priceRange] || [0, Infinity]
      result = result.filter(p => p.price >= min && p.price < max)
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        result.sort((a, b) => b.price - a.price)
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    setFilteredProducts(result)
  }, [products, searchQuery, selectedCategory, priceRange, sortBy])

  if (loading) {
    return <CatalogueLoadingSkeleton />
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section - Compact */}
      <section className="border-b border-zinc-200 bg-zinc-50 py-8">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-2 inline-block rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">
            Shop All
          </div>
          <h1 className="mb-2 text-3xl font-light tracking-tight text-zinc-900 lg:text-4xl">
            Product <span className="font-semibold text-amber-600">Catalogue</span>
          </h1>
          <p className="text-sm text-zinc-600">
            Discover our complete collection of premium tech products
          </p>
        </div>
      </section>

      {/* Featured Products Slider - Compact */}
      {featuredProducts.length > 0 && (
        <section className="bg-gradient-to-br from-amber-50 to-orange-50 border-b border-amber-100">
          <div className="container mx-auto px-6 lg:px-12 py-4">
            <h2 className="text-base font-bold text-gray-900 mb-3">
              Featured Deals
            </h2>
            <HotDealsSlider products={featuredProducts} />
          </div>
        </section>
      )}

      {/* Search and Filter Bar - Compact */}
      <section className="sticky top-20 z-40 border-b border-zinc-200 bg-white shadow-sm">
        <div className="container mx-auto px-6 py-3 lg:px-12">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full border border-zinc-300 bg-white py-2 pl-9 pr-4 text-sm text-zinc-900 placeholder-zinc-500 transition-colors focus:border-amber-500 focus:outline-none rounded-md"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Filter and Sort */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 border px-3 py-2 text-xs font-medium transition-colors rounded-md ${
                  showFilters
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-900 hover:bg-zinc-50'
                }`}
              >
                <SlidersHorizontal className="h-3 w-3" />
                Price
              </button>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-900 focus:outline-none rounded-md"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low-High</option>
                <option value="price-high">Price: High-Low</option>
                <option value="name">Name: A-Z</option>
              </select>
            </div>
          </div>

          {/* Filter Panel - Compact */}
          {showFilters && (
            <div className="mt-3 border-t border-zinc-200 pt-3">
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'All Prices' },
                  { value: 'under5k', label: 'Under 5K' },
                  { value: '5k-10k', label: '5K - 10K' },
                  { value: '10k-20k', label: '10K - 20K' },
                  { value: '20k-50k', label: '20K - 50K' },
                  { value: 'over50k', label: 'Over 50K' },
                ].map(range => (
                  <button
                    key={range.value}
                    onClick={() => setPriceRange(range.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      priceRange === range.value
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
                {(selectedCategory !== 'all' || priceRange !== 'all' || searchQuery) && (
                  <button
                    onClick={resetFilters}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-all"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Compact Category Filter */}
      <section className="bg-white border-b border-zinc-100">
        <div className="container mx-auto px-6 lg:px-12 py-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium text-gray-600 whitespace-nowrap">Filter:</h3>
            <div className="flex-1 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <div className="flex gap-2">
                {/* All Categories Button */}
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({(products || []).length})
                </button>

                {/* Category Pills */}
                {categories.filter(c => c !== 'all').map(category => {
                  const count = (products || []).filter(p => p.category === category).length
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                        selectedCategory === category
                          ? 'bg-amber-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category} ({count})
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid - Dominant Section */}
      <section className="py-8">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Results Count */}
          {filteredProducts.length > 0 && (
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> {filteredProducts.length === 1 ? 'product' : 'products'}
                {selectedCategory !== 'all' && (
                  <span> in <span className="font-semibold text-amber-600">{selectedCategory}</span></span>
                )}
              </p>
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <p className="mb-2 text-lg font-medium text-zinc-900">No products found</p>
                <p className="mb-4 text-sm text-zinc-600">
                  Try adjusting your filters or search query
                </p>
                <button
                  onClick={resetFilters}
                  className="border border-zinc-900 bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-900"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          ) : (
            <ProductGrid products={filteredProducts} />
          )}
        </div>
      </section>
    </div>
  )
}

function CatalogueLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <section className="border-b border-zinc-200 bg-zinc-50 py-8">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-2 h-6 w-20 animate-pulse rounded-full bg-zinc-200" />
          <div className="mb-2 h-10 w-80 animate-pulse bg-zinc-200" />
          <div className="h-4 w-64 animate-pulse bg-zinc-200" />
        </div>
      </section>
      <section className="border-b border-zinc-100 py-3">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="h-6 w-full animate-pulse bg-zinc-200 rounded" />
        </div>
      </section>
      <section className="py-8">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[3/4] animate-pulse bg-zinc-200 rounded" />
                <div className="h-4 w-3/4 animate-pulse bg-zinc-200 rounded" />
                <div className="h-6 w-1/2 animate-pulse bg-zinc-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default function CataloguePage() {
  return (
    <Suspense fallback={<CatalogueLoadingSkeleton />}>
      <CatalogueContent />
    </Suspense>
  )
}
