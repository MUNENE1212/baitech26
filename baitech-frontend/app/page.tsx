'use client'

import { useEffect, useState } from 'react'
import { Hero } from '@/components/homepage/Hero'
import { ProductGrid } from '@/components/products/ProductGrid'
import { ServiceGrid } from '@/components/services/ServiceGrid'
import { ReviewSection } from '@/components/reviews/ReviewSection'
import { getHomeData } from '@/lib/api/home'
import type { HomePageData } from '@/types'

export default function HomePage() {
  const [data, setData] = useState<HomePageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadHomeData() {
      try {
        const homeData = await getHomeData()
        setData(homeData)
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

  return (
    <>
      <Hero />

      {/* Featured Products */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <div className="mb-4 inline-block rounded-full border border-amber-300 bg-amber-50 px-4 py-1 text-sm font-medium text-amber-900">
              Curated Selection
            </div>
            <h2 className="text-4xl font-light tracking-tight text-zinc-900 lg:text-5xl">
              Featured <span className="font-semibold text-amber-600">Products</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-zinc-600">
              Handpicked premium tech essentials
            </p>
          </div>

          <ProductGrid products={data?.featured_products || []} />
        </div>
      </section>

      {/* Featured Services */}
      <section className="bg-zinc-50 py-24">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <div className="mb-4 inline-block rounded-full border border-amber-300 bg-white px-4 py-1 text-sm font-medium text-amber-900">
              Expert Solutions
            </div>
            <h2 className="text-4xl font-light tracking-tight text-zinc-900 lg:text-5xl">
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
      <section className="bg-white py-24">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <div className="mb-4 inline-block rounded-full border border-amber-300 bg-amber-50 px-4 py-1 text-sm font-medium text-amber-900">
              Testimonials
            </div>
            <h2 className="text-4xl font-light tracking-tight text-zinc-900 lg:text-5xl">
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
