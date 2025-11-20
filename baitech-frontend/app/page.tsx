'use client'

import { useEffect, useState } from 'react'
import { Hero } from '@/components/homepage/Hero'
import { ProductGrid } from '@/components/products/ProductGrid'
import HotDealsSlider from '@/components/products/HotDealsSlider'
import StaticDeals from '@/components/products/StaticDeals'
import CategoryHierarchy from '@/components/categories/CategoryHierarchy'
import { ServiceGrid } from '@/components/services/ServiceGrid'
import { ReviewSection } from '@/components/reviews/ReviewSection'
import { getHomeData } from '@/lib/api/home'
import { getAllProducts } from '@/lib/api/products'
import type { HomePageData, Product } from '@/types'

export default function HomePage() {
  const [data, setData] = useState<HomePageData | null>(null)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [homeData, products] = await Promise.all([
          getHomeData(),
          getAllProducts()
        ])
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

  // Filter products for hot deals (products with originalPrice or low stock)
  const hotDeals = data?.featured_products?.filter((product: Product) =>
    product.originalPrice || (product.stock && product.stock < 10)
  ).slice(0, 8) || []

  return (
    <>
      <Hero />

      {/* Hot Deals Slider */}
      {hotDeals.length > 0 && (
        <HotDealsSlider products={hotDeals} />
      )}

      {/* Static Deals Section */}
      <StaticDeals />

      {/* Category Hierarchy */}
      <CategoryHierarchy products={allProducts} />

      {/* Featured Products */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Section Header */}
          <div className="mb-12 text-center">
            <div className="mb-4 inline-block rounded-full border border-amber-300 bg-amber-50 px-4 py-1 text-sm font-medium text-amber-900">
              Curated Selection
            </div>
            <h2 className="text-3xl font-light tracking-tight text-zinc-900 lg:text-4xl">
              Featured <span className="font-semibold text-amber-600">Products</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-zinc-600">
              Handpicked premium tech essentials
            </p>
          </div>

          <ProductGrid
            products={data?.featured_products || []}
            variant="compact"
            columns={5}
          />
        </div>
      </section>

      {/* Featured Services */}
      <section className="bg-zinc-50 py-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Section Header */}
          <div className="mb-12 text-center">
            <div className="mb-4 inline-block rounded-full border border-amber-300 bg-white px-4 py-1 text-sm font-medium text-amber-900">
              Expert Solutions
            </div>
            <h2 className="text-3xl font-light tracking-tight text-zinc-900 lg:text-4xl">
              Professional <span className="font-semibold text-amber-600">Services</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-zinc-600">
              Technical expertise at your fingertips
            </p>
          </div>

          <ServiceGrid services={data?.featured_services || []} />
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Section Header */}
          <div className="mb-12 text-center">
            <div className="mb-4 inline-block rounded-full border border-amber-300 bg-amber-50 px-4 py-1 text-sm font-medium text-amber-900">
              Testimonials
            </div>
            <h2 className="text-3xl font-light tracking-tight text-zinc-900 lg:text-4xl">
              Client <span className="font-semibold text-amber-600">Feedback</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-zinc-600">
              Hear from our satisfied customers
            </p>
          </div>

          <ReviewSection reviews={data?.reviews || []} />
        </div>
      </section>
    </>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="h-96 bg-gradient-to-r from-purple-200 to-pink-200" />
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8 h-8 w-64 rounded bg-gray-200" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 rounded-xl bg-gray-200" />
          ))}
        </div>
      </div>
    </div>
  )
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-xl bg-red-50 p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold text-red-700">
          Failed to Load Data
        </h2>
        <p className="mb-4 text-red-600">{message}</p>
        <p className="text-sm text-gray-600">
          Make sure the FastAPI backend is running at http://localhost:8000
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-red-600 px-6 py-2 font-semibold text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    </div>
  )
}
