'use client'

import { useEffect, useState } from 'react'
import { CategorySelectionModal } from '@/components/homepage/CategorySelectionModal'
import { FeaturedShowcase } from '@/components/homepage/FeaturedShowcase'
import HotDealsSlider from '@/components/products/HotDealsSlider'
import { ReviewSection } from '@/components/reviews/ReviewSection'
import { getHomeData } from '@/lib/api/home'
import { getAllProducts } from '@/lib/api/products'
import type { HomePageData, Product } from 'src/types'

export default function HomePage() {
  const [data, setData] = useState<HomePageData | null>(null)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadHomeData() {
      try {
        console.log('Loading home data...')
        const [homeData, products] = await Promise.all([
          getHomeData(),
          getAllProducts()
        ])
        console.log('Home data received:', homeData)
        console.log('Products received:', products?.length)
        setData(homeData)
        setAllProducts(products)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
        console.error('Failed to load homepage data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadHomeData()
  }, [])

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorDisplay message={error} />
  }

  // Filter for hot deals - products marked as hot deals, on sale, or with discounts
  const hotDeals = allProducts.filter((product: Product) =>
    product.is_hot_deal || product.isHotDeal || product.is_on_sale || product.original_price || product.originalPrice
  ).slice(0, 12) // Increased to 12 since this is now the main section

  // If no hot deals found, show first 12 featured products
  const displayHotDeals = hotDeals.length > 0 ? hotDeals : allProducts.filter(p => p.featured).slice(0, 12)

  return (
    <>
      <CategorySelectionModal />

      {/* Hot Deals - Now the main attraction at the top */}
      <section className="bg-gradient-to-b from-amber-50 to-white py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-block rounded-full bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-1 text-sm font-semibold text-white shadow-lg">
              🔥 Hot Deals
            </div>
            <h2 className="text-2xl font-light tracking-tight text-zinc-900 lg:text-3xl">
              Today's <span className="font-bold text-amber-600">Best Offers</span>
            </h2>
          </div>
          <HotDealsSlider products={displayHotDeals} />
        </div>
      </section>

      {/* Combined Products and Services Section */}
      <FeaturedShowcase
        products={data?.featured_products || []}
        services={data?.featured_services || []}
      />

      {/* Customer Reviews - Only show if we have reviews */}
      {data?.recent_reviews && data.recent_reviews.length > 0 && (
        <section className="bg-white py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <ReviewSection reviews={data.recent_reviews} />
          </div>
        </section>
      )}
    </>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Hero Placeholder */}
      <div className="relative min-h-[60vh] bg-gradient-to-br from-zinc-900 via-black to-zinc-900 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent h-32" />
      </div>

      {/* Content Placeholder */}
      <div className="container mx-auto px-6 lg:px-12 py-16 space-y-20">
        {/* Section Headers */}
        <div className="text-center space-y-4">
          <div className="h-4 w-32 bg-amber-200 rounded-full mx-auto animate-pulse" />
          <div className="h-12 w-96 bg-gray-200 rounded-lg mx-auto animate-pulse" />
          <div className="h-6 w-64 bg-gray-200 rounded-lg mx-auto animate-pulse" />
        </div>

        {/* Product Grid Skeleton */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="space-y-3 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-xl" />
              <div className="h-4 bg-gray-200 rounded-lg" />
              <div className="h-4 w-3/4 bg-gray-200 rounded-lg" />
              <div className="h-3 w-1/2 bg-amber-200 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Services Grid Skeleton */}
        <div className="text-center space-y-4">
          <div className="h-4 w-32 bg-amber-200 rounded-full mx-auto animate-pulse" />
          <div className="h-12 w-80 bg-gray-200 rounded-lg mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-xl" />
              <div className="h-4 bg-gray-200 rounded-lg" />
              <div className="h-3 w-3/4 bg-gray-200 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-xl bg-red-50 p-8 text-center max-w-md">
        <div className="mb-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
        <h2 className="mb-3 text-2xl font-bold text-red-700">
          Unable to Load Data
        </h2>
        <p className="mb-4 text-red-600">{message}</p>
        <div className="space-y-2 text-sm text-gray-600">
          <p>This might be due to:</p>
          <ul className="text-left">
            <li>• Database connection issues</li>
            <li>• Network connectivity problems</li>
            <li>• Server maintenance</li>
          </ul>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-lg bg-red-600 px-6 py-2 font-semibold text-white hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
