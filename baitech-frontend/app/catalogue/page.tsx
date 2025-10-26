'use client'

import { useEffect, useState } from 'react'
import { ProductGrid } from '@/components/products/ProductGrid'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { Product } from '@/types'

export default function CataloguePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [showFilters, setShowFilters] = useState(false)

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products`)
        const data = await response.json()
        setProducts(data)
        setFilteredProducts(data)
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Get unique categories
  const categories = ['all', ...new Set(products.map(p => p.category))]

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
      {/* Header Section */}
      <section className="border-b border-zinc-200 bg-zinc-50 py-16">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-4 inline-block rounded-full border border-amber-300 bg-amber-50 px-4 py-1 text-sm font-medium text-amber-900">
            Shop All
          </div>
          <h1 className="mb-4 text-4xl font-light tracking-tight text-zinc-900 lg:text-5xl">
            Product <span className="font-semibold text-amber-600">Catalogue</span>
          </h1>
          <p className="max-w-2xl text-zinc-600">
            Discover our complete collection of premium tech products
          </p>
        </div>
      </section>

      {/* Search and Filter Bar */}
      <section className="sticky top-20 z-40 border-b border-zinc-200 bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 lg:px-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full border border-zinc-300 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-500 transition-colors focus:border-amber-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter and Sort */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-900 hover:bg-zinc-50"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </button>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-900 focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
              </select>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 grid gap-6 border-t border-zinc-200 pt-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Category Filter */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-900">
                  Category
                </label>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`block w-full border px-4 py-2 text-left text-sm transition-colors ${
                        selectedCategory === category
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-900'
                      }`}
                    >
                      {category === 'all' ? 'All Categories' : category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-900">
                  Price Range
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All Prices' },
                    { value: 'under5k', label: 'Under Ksh 5,000' },
                    { value: '5k-10k', label: 'Ksh 5,000 - 10,000' },
                    { value: '10k-20k', label: 'Ksh 10,000 - 20,000' },
                    { value: '20k-50k', label: 'Ksh 20,000 - 50,000' },
                    { value: 'over50k', label: 'Over Ksh 50,000' },
                  ].map(range => (
                    <button
                      key={range.value}
                      onClick={() => setPriceRange(range.value)}
                      className={`block w-full border px-4 py-2 text-left text-sm transition-colors ${
                        priceRange === range.value
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-900'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Filters Summary */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-900">
                  Active Filters
                </label>
                <div className="space-y-2">
                  <div className="border border-zinc-200 bg-zinc-50 p-4">
                    <p className="mb-2 text-sm text-zinc-600">
                      Showing {filteredProducts.length} of {products.length} products
                    </p>
                    {(selectedCategory !== 'all' || priceRange !== 'all' || searchQuery) && (
                      <button
                        onClick={() => {
                          setSelectedCategory('all')
                          setPriceRange('all')
                          setSearchQuery('')
                        }}
                        className="text-sm font-medium text-zinc-900 underline hover:no-underline"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-6 lg:px-12">
          {filteredProducts.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <p className="mb-2 text-lg font-medium text-zinc-900">No products found</p>
                <p className="mb-4 text-sm text-zinc-600">
                  Try adjusting your filters or search query
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all')
                    setPriceRange('all')
                    setSearchQuery('')
                  }}
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
      <section className="border-b border-zinc-200 bg-zinc-50 py-16">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-4 h-8 w-24 animate-pulse bg-zinc-200" />
          <div className="mb-4 h-12 w-96 animate-pulse bg-zinc-200" />
          <div className="h-6 w-80 animate-pulse bg-zinc-200" />
        </div>
      </section>
      <section className="py-12">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[3/4] animate-pulse bg-zinc-200" />
                <div className="h-4 w-3/4 animate-pulse bg-zinc-200" />
                <div className="h-6 w-1/2 animate-pulse bg-zinc-200" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
