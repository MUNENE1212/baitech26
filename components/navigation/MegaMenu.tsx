'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Zap, Sparkles, TrendingUp, ChevronRight } from 'lucide-react'
import type { Product, Service } from 'src/types'
import { PRODUCT_CATEGORIES, type Category } from '@/lib/categories'

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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
        const endpoint = type === 'products' ? '/api/products' : '/api/services'
        const response = await fetch(`${apiUrl}${endpoint}`)
        const result = await response.json()

        if (type === 'products') {
          setData(result.products || [])
        } else {
          // Safely check if result exists and has services array
          if (result && Array.isArray(result.services)) {
            setData(result.services)
          } else if (result && Array.isArray(result)) {
            setData(result)
          } else {
            // Fallback: try to access services array directly
            setData(Array.isArray(result) ? result : [])
          }
        }
      } catch (error) {
        console.error(`Failed to fetch ${type}:`, error)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    if (isOpen && (data.length === 0 || !data)) {
      fetchData()
    }
  }, [isOpen, type, data.length, data])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="absolute left-0 top-full w-full border-t border-zinc-200 bg-white shadow-2xl"
      >
        <div className="container mx-auto px-6 py-8 lg:px-12">
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
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [hoveredSubcategory, setHoveredSubcategory] = useState<string | null>(null)
  const hotDeals = products.filter(p => p.isHotDeal || p.originalPrice).slice(0, 3)

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* All Categories List - Scrollable */}
      <div className="lg:col-span-4">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-900">
          <Sparkles className="h-4 w-4 text-amber-600" />
          All Categories
        </h3>
        <div className="max-h-[500px] overflow-y-auto pr-4 space-y-1 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-zinc-100">
          {PRODUCT_CATEGORIES.map((category) => (
            <div
              key={category.slug}
              onMouseEnter={() => setHoveredCategory(category.slug)}
              className="relative"
            >
              <Link
                href={`/catalogue?category=${category.slug}`}
                onClick={onClose}
                className={`group flex items-center justify-between rounded-lg px-4 py-3 transition-all ${
                  hoveredCategory === category.slug
                    ? 'bg-amber-50 border-amber-200'
                    : 'border-transparent hover:bg-zinc-50'
                } border`}
              >
                <span className={`font-medium transition-colors ${
                  hoveredCategory === category.slug ? 'text-amber-600' : 'text-zinc-900'
                }`}>
                  {category.name}
                </span>
                <ChevronRight className={`h-4 w-4 transition-all ${
                  hoveredCategory === category.slug
                    ? 'text-amber-600 translate-x-1'
                    : 'text-zinc-400'
                }`} />
              </Link>
            </div>
          ))}
        </div>
        <Link
          href="/catalogue"
          onClick={onClose}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700"
        >
          View All Products
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Subcategories Panel - Shows on hover */}
      <div
        className="lg:col-span-5"
        onMouseEnter={() => {
          // Keep the current hovered category active when entering subcategories panel
        }}
        onMouseLeave={() => {
          // Clear hovered states when leaving subcategories panel
          setHoveredCategory(null)
          setHoveredSubcategory(null)
        }}
      >
        <AnimatePresence mode="wait">
          {hoveredCategory ? (
            <motion.div
              key={hoveredCategory}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {(() => {
                const category = PRODUCT_CATEGORIES.find(cat => cat.slug === hoveredCategory)
                if (!category) return null

                return (
                  <div>
                    <h4 className="mb-4 text-lg font-semibold text-zinc-900">
                      {category.name}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-zinc-100">
                      {category.subcategories.map((subcategory) => {
                        const subcategoryProducts = products.filter(
                          p => p.subcategory === subcategory.slug ||
                               (p.category === category.slug && !p.subcategory)
                        )

                        return (
                          <Link
                            key={subcategory.slug}
                            href={`/catalogue?category=${category.slug}&subcategory=${subcategory.slug}`}
                            onClick={onClose}
                            onMouseEnter={() => setHoveredSubcategory(subcategory.slug)}
                            onMouseLeave={() => setHoveredSubcategory(null)}
                            className={`group flex items-start gap-2 rounded-lg border px-3 py-2 text-sm transition-all ${
                              hoveredSubcategory === subcategory.slug
                                ? 'border-amber-300 bg-amber-50'
                                : 'border-transparent hover:border-amber-200 hover:bg-amber-50'
                            }`}
                          >
                            <ChevronRight className={`h-4 w-4 flex-shrink-0 transition-colors mt-0.5 ${
                              hoveredSubcategory === subcategory.slug ? 'text-amber-600' : 'text-zinc-400 group-hover:text-amber-600'
                            }`} />
                            <div className="flex-1">
                              <span className={`line-clamp-2 ${
                                hoveredSubcategory === subcategory.slug ? 'text-amber-600 font-medium' : 'text-zinc-700 group-hover:text-amber-600'
                              }`}>
                                {subcategory.name}
                              </span>
                              {subcategoryProducts.length > 0 && (
                                <span className="text-xs text-zinc-500 mt-0.5 block">
                                  {subcategoryProducts.length} {subcategoryProducts.length === 1 ? 'product' : 'products'}
                                </span>
                              )}
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-full items-center justify-center"
            >
              <div className="text-center text-zinc-500">
                <Sparkles className="mx-auto mb-3 h-12 w-12 text-zinc-300" />
                <p className="text-sm">Hover over a category to view subcategories</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Products Preview Sidebar */}
      <div
        className="lg:col-span-3"
        onMouseEnter={() => {
          // Keep the current hovered states active when entering products panel
        }}
        onMouseLeave={() => {
          // Clear hovered subcategory when leaving products panel
          setHoveredSubcategory(null)
        }}
      >
        <AnimatePresence mode="wait">
          {hoveredSubcategory && hoveredCategory ? (
            <motion.div
              key={hoveredSubcategory}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              {(() => {
                const category = PRODUCT_CATEGORIES.find(cat => cat.slug === hoveredCategory)
                const subcategory = category?.subcategories.find(sub => sub.slug === hoveredSubcategory)
                const subcategoryProducts = products
                  .filter(p => p.subcategory === hoveredSubcategory)
                  .slice(0, 4)

                return (
                  <div>
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-900">
                      <TrendingUp className="h-4 w-4 text-amber-600" />
                      {subcategory?.name}
                    </h3>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-zinc-100">
                      {subcategoryProducts.length > 0 ? (
                        <React.Fragment key="subcategory-products-list">
                          {subcategoryProducts.map((product) => (
                            <Link
                              key={product._id}
                              href={`/products/${product._id}`}
                              onClick={onClose}
                              className="group block rounded-lg border border-zinc-200 bg-white p-4 transition-all hover:border-amber-300 hover:shadow-md"
                            >
                              {product.isHotDeal && (
                                <div className="mb-2">
                                  <span className="inline-block rounded-full bg-orange-600 px-2 py-0.5 text-xs font-semibold text-white">
                                    HOT DEAL
                                  </span>
                                </div>
                              )}
                              <h4 className="mb-2 text-sm font-medium text-zinc-900 group-hover:text-amber-600 line-clamp-2">
                                {product.name}
                              </h4>
                              <div className="flex flex-col gap-1">
                                <span className="text-base font-bold text-amber-600">
                                  Ksh {product.price.toLocaleString()}
                                </span>
                                {product.originalPrice && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-zinc-500 line-through">
                                      Ksh {product.originalPrice.toLocaleString()}
                                    </span>
                                    <span className="text-xs font-semibold text-orange-600">
                                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                                    </span>
                                  </div>
                                )}
                              </div>
                            </Link>
                          ))}
                          <Link
                            href={`/catalogue?category=${hoveredCategory}&subcategory=${hoveredSubcategory}`}
                            onClick={onClose}
                            className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 p-3 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-100"
                          >
                            View All
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </React.Fragment>
                      ) : (
                        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-center">
                          <p className="text-sm text-zinc-500">No products in this subcategory yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-full items-center justify-center"
            >
              <div className="text-center text-zinc-500">
                <Zap className="mx-auto mb-3 h-12 w-12 text-zinc-300" />
                <p className="text-sm mb-4">Hover over a subcategory to see products</p>
                {hotDeals.length > 0 && (
                  <div className="mt-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-orange-600 mb-3">
                      Hot Deals
                    </p>
                    <div className="space-y-2">
                      {hotDeals.slice(0, 2).map((product) => (
                        <Link
                          key={product._id}
                          href={`/products/${product._id}`}
                          onClick={onClose}
                          className="block rounded-lg border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-3 text-left transition-all hover:border-orange-300"
                        >
                          <h4 className="text-xs font-medium text-zinc-900 line-clamp-2 mb-1">
                            {product.name}
                          </h4>
                          <span className="text-sm font-bold text-orange-600">
                            Ksh {product.price.toLocaleString()}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function ServicesMegaMenu({ services, onClose }: { services: Service[]; onClose: () => void }) {
  // Get unique categories
  const categories = Array.from(new Set(services.map(s => s.category)))

  // Get featured services (first 6)
  const featuredServices = services.slice(0, 6)

  // Debug logging
  console.log('Services data:', services)
  console.log('Featured services:', featuredServices)
  console.log('Featured services length:', featuredServices.length)
  console.log('Component rendering - services length:', services.length)

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
                href={category ? `/services?category=${encodeURIComponent(category)}` : '/services'}
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
                key={service.id}
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
                    Ksh {typeof service.pricing?.base_price === 'number' ? service.pricing.base_price.toLocaleString() : service.pricing?.base_price || 'Price not available'}
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
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <div className="mb-4 h-6 w-40 animate-pulse rounded bg-zinc-200" />
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-zinc-100" />
          ))}
        </div>
      </div>
      <div className="lg:col-span-5">
        <div className="h-[400px] animate-pulse rounded-lg bg-zinc-100" />
      </div>
      <div className="lg:col-span-3">
        <div className="mb-4 h-6 w-24 animate-pulse rounded bg-zinc-200" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-zinc-100" />
          ))}
        </div>
      </div>
    </div>
  )
}
