'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Zap, Sparkles, TrendingUp } from 'lucide-react'
import type { Product, Service } from '@/types'

interface MegaMenuProps {
  isOpen: boolean
  type: 'products' | 'services'
  onClose: () => void
}

export function MegaMenu({ isOpen, type, onClose }: MegaMenuProps) {
  const [data, setData] = useState<Product[] | Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const endpoint = type === 'products' ? '/api/v1/products' : '/api/v1/services'
        const response = await fetch(`${apiUrl}${endpoint}`)
        const result = await response.json()

        if (type === 'products') {
          setData(result.products || [])
        } else {
          setData(Array.isArray(result) ? result : [])
        }
      } catch (error) {
        console.error(`Failed to fetch ${type}:`, error)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    if (isOpen && data.length === 0) {
      fetchData()
    }
  }, [isOpen, type, data.length])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="absolute left-0 top-full w-full border-t border-zinc-200 bg-white shadow-2xl"
        onMouseLeave={onClose}
      >
        <div className="container mx-auto px-6 py-12 lg:px-12">
          {loading ? (
            <LoadingSkeleton />
          ) : type === 'products' ? (
            <ProductsMegaMenu products={data as Product[]} onClose={onClose} />
          ) : (
            <ServicesMegaMenu services={data as Service[]} onClose={onClose} />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

function ProductsMegaMenu({ products, onClose }: { products: Product[]; onClose: () => void }) {
  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category)))

  // Get featured and hot deal products
  const featuredProducts = products.filter(p => p.featured).slice(0, 3)
  const hotDeals = products.filter(p => p.isHotDeal || p.originalPrice).slice(0, 3)

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
      {/* Categories Section */}
      <div className="lg:col-span-4">
        <h3 className="mb-6 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-900">
          <Sparkles className="h-4 w-4 text-amber-600" />
          Shop by Category
        </h3>
        <div className="grid gap-2">
          {categories.slice(0, 8).map((category) => {
            const categoryProducts = products.filter(p => p.category === category)
            return (
              <Link
                key={category}
                href={`/catalogue?category=${encodeURIComponent(category)}`}
                onClick={onClose}
                className="group flex items-center justify-between rounded-lg border border-transparent px-4 py-3 transition-all hover:border-amber-200 hover:bg-amber-50"
              >
                <div>
                  <div className="font-medium text-zinc-900 group-hover:text-amber-600">
                    {category}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {categoryProducts.length} {categoryProducts.length === 1 ? 'item' : 'items'}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-amber-600" />
              </Link>
            )
          })}
        </div>
        <Link
          href="/catalogue"
          onClick={onClose}
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700"
        >
          View All Products
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Featured Products */}
      <div className="lg:col-span-4">
        <h3 className="mb-6 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-900">
          <TrendingUp className="h-4 w-4 text-amber-600" />
          Featured Products
        </h3>
        <div className="space-y-4">
          {featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <Link
                key={product._id}
                href={`/products/${product._id}`}
                onClick={onClose}
                className="group block rounded-lg border border-zinc-200 p-4 transition-all hover:border-amber-300 hover:bg-amber-50"
              >
                <div className="mb-2 flex items-start justify-between">
                  <h4 className="font-medium text-zinc-900 group-hover:text-amber-600 line-clamp-2">
                    {product.name}
                  </h4>
                </div>
                <p className="mb-3 text-sm text-zinc-600 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-amber-600">
                    Ksh {product.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-zinc-500">{product.category}</span>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-zinc-500">No featured products available</p>
          )}
        </div>
      </div>

      {/* Hot Deals */}
      <div className="lg:col-span-4">
        <h3 className="mb-6 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-900">
          <Zap className="h-4 w-4 text-orange-600" />
          Hot Deals
        </h3>
        <div className="space-y-4">
          {hotDeals.length > 0 ? (
            hotDeals.map((product) => (
              <Link
                key={product._id}
                href={`/products/${product._id}`}
                onClick={onClose}
                className="group block rounded-lg border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-4 transition-all hover:border-orange-300 hover:shadow-md"
              >
                <div className="mb-2">
                  <span className="inline-block rounded-full bg-orange-600 px-2 py-1 text-xs font-semibold text-white">
                    HOT DEAL
                  </span>
                </div>
                <h4 className="mb-2 font-medium text-zinc-900 group-hover:text-orange-600 line-clamp-2">
                  {product.name}
                </h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-orange-600">
                    Ksh {product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <>
                      <span className="text-sm text-zinc-500 line-through">
                        Ksh {product.originalPrice.toLocaleString()}
                      </span>
                      <span className="text-xs font-semibold text-orange-600">
                        Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </span>
                    </>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-zinc-500">No hot deals available</p>
          )}
        </div>
      </div>
    </div>
  )
}

function ServicesMegaMenu({ services, onClose }: { services: Service[]; onClose: () => void }) {
  // Get unique categories
  const categories = Array.from(new Set(services.map(s => s.category)))

  // Get featured services (first 6)
  const featuredServices = services.slice(0, 6)

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
      {/* Categories Section */}
      <div className="lg:col-span-4">
        <h3 className="mb-6 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-900">
          <Sparkles className="h-4 w-4 text-amber-600" />
          Service Categories
        </h3>
        <div className="grid gap-2">
          {categories.map((category) => {
            const categoryServices = services.filter(s => s.category === category)
            return (
              <Link
                key={category}
                href={`/services?category=${encodeURIComponent(category)}`}
                onClick={onClose}
                className="group flex items-center justify-between rounded-lg border border-transparent px-4 py-3 transition-all hover:border-amber-200 hover:bg-amber-50"
              >
                <div>
                  <div className="font-medium text-zinc-900 group-hover:text-amber-600">
                    {category}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {categoryServices.length} {categoryServices.length === 1 ? 'service' : 'services'}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-amber-600" />
              </Link>
            )
          })}
        </div>
        <Link
          href="/services"
          onClick={onClose}
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700"
        >
          View All Services
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Featured Services Grid */}
      <div className="lg:col-span-8">
        <h3 className="mb-6 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-900">
          <TrendingUp className="h-4 w-4 text-amber-600" />
          Popular Services
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {featuredServices.length > 0 ? (
            featuredServices.map((service) => (
              <Link
                key={service._id}
                href="/services"
                onClick={onClose}
                className="group block rounded-lg border border-zinc-200 p-6 transition-all hover:border-amber-300 hover:bg-amber-50 hover:shadow-md"
              >
                <div className="mb-3">
                  <span className="inline-block rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium uppercase tracking-wider text-amber-900">
                    {service.category}
                  </span>
                </div>
                <h4 className="mb-2 text-lg font-semibold text-zinc-900 group-hover:text-amber-600">
                  {service.name}
                </h4>
                <p className="mb-4 text-sm text-zinc-600 line-clamp-2">
                  {service.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-amber-600">
                    Ksh {typeof service.pricing === 'number' ? service.pricing.toLocaleString() : service.pricing}
                  </span>
                  <ArrowRight className="h-4 w-4 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-amber-600" />
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-zinc-500">No services available</p>
          )}
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <div className="mb-6 h-6 w-32 animate-pulse rounded bg-zinc-200" />
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-zinc-100" />
          ))}
        </div>
      </div>
      <div className="lg:col-span-4">
        <div className="mb-6 h-6 w-32 animate-pulse rounded bg-zinc-200" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded bg-zinc-100" />
          ))}
        </div>
      </div>
      <div className="lg:col-span-4">
        <div className="mb-6 h-6 w-32 animate-pulse rounded bg-zinc-200" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded bg-zinc-100" />
          ))}
        </div>
      </div>
    </div>
  )
}
