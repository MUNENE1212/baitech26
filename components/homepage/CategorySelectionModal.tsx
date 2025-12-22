'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ChevronRight, Package, Wrench } from 'lucide-react'
import Link from 'next/link'
import { PRODUCT_CATEGORIES, type Category, type SubCategory } from '@/lib/categories'
import type { Service } from 'src/types'

interface ExpandedCategory {
  type: 'product' | 'service'
  slug: string
}

export function CategorySelectionModal() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategory, setExpandedCategory] = useState<ExpandedCategory | null>(null)
  const [serviceCategories, setServiceCategories] = useState<string[]>([])
  const [services, setServices] = useState<Service[]>([])

  // Fetch service categories
  useEffect(() => {
    async function fetchServices() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
        const response = await fetch(`${apiUrl}/api/services`)
        const data = await response.json()
        const servicesData = Array.isArray(data) ? data : []
        setServices(servicesData)

        // Extract unique service categories
        const uniqueCategories = [...new Set(servicesData.map((s: Service) => s.category).filter((cat): cat is string => Boolean(cat)))]
        setServiceCategories(uniqueCategories)
      } catch (error) {
        console.error('Failed to fetch services:', error)
      }
    }

    fetchServices()
  }, [])

  // Filter product categories based on search
  const filteredProductCategories = PRODUCT_CATEGORIES.filter(category => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    const categoryMatch = category.name.toLowerCase().includes(query)
    const subcategoryMatch = category.subcategories.some(sub =>
      sub.name.toLowerCase().includes(query)
    )

    return categoryMatch || subcategoryMatch
  })

  // Filter service categories based on search
  const filteredServiceCategories = serviceCategories.filter(category => {
    if (!searchQuery) return true
    return category.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Get subcategories for a product category
  const getFilteredSubcategories = (category: Category) => {
    if (!searchQuery) return category.subcategories

    const query = searchQuery.toLowerCase()
    return category.subcategories.filter(sub =>
      sub.name.toLowerCase().includes(query)
    )
  }

  // Get services for a service category
  const getServicesForCategory = (categoryName: string) => {
    if (!searchQuery) {
      return services.filter(s => s.category === categoryName)
    }

    const query = searchQuery.toLowerCase()
    return services.filter(s =>
      s.category === categoryName &&
      s.name.toLowerCase().includes(query)
    )
  }

  return (
    <section className="relative min-h-[40vh] flex items-center bg-gradient-to-br from-zinc-50 via-white to-amber-50 py-12">
      <div className="container relative z-10 mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4 inline-block rounded-full border border-amber-300 bg-amber-50 px-4 py-1 text-sm font-medium text-amber-900">
              Explore Our Offerings
            </div>
            <h1 className="text-4xl font-light tracking-tight text-zinc-900 lg:text-5xl mb-4">
              What are you <span className="font-semibold text-amber-600">looking for?</span>
            </h1>
            <p className="mx-auto max-w-2xl text-zinc-600">
              Browse our comprehensive catalog of products and services
            </p>
          </motion.div>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mb-8 max-w-2xl"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search categories, products, or services..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-full border-2 border-zinc-200 bg-white py-4 pl-12 pr-12 text-base text-zinc-900 placeholder-zinc-500 shadow-sm transition-all focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Categories Grid - Only show when searching */}
        <AnimatePresence>
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 20, height: 0 }}
              transition={{ duration: 0.3 }}
              className="grid gap-8 lg:grid-cols-2"
            >
          {/* Product Categories */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="mb-4 flex items-center gap-2">
              <Package className="h-6 w-6 text-amber-600" />
              <h2 className="text-2xl font-semibold text-zinc-900">Product Categories</h2>
              <span className="ml-auto rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900">
                {filteredProductCategories.length}
              </span>
            </div>

            <div className="max-h-[500px] space-y-2 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              {filteredProductCategories.length === 0 ? (
                <div className="py-12 text-center text-zinc-500">
                  No product categories found
                </div>
              ) : (
                filteredProductCategories.map(category => {
                  const filteredSubs = getFilteredSubcategories(category)
                  const isExpanded = expandedCategory?.type === 'product' && expandedCategory?.slug === category.slug

                  return (
                    <div key={category.slug} className="border-b border-zinc-100 last:border-0">
                      <button
                        onMouseEnter={() => setExpandedCategory({ type: 'product', slug: category.slug })}
                        onClick={() => setExpandedCategory(
                          isExpanded ? null : { type: 'product', slug: category.slug }
                        )}
                        className="flex w-full items-center justify-between rounded-lg p-3 text-left transition-all hover:bg-amber-50"
                      >
                        <span className="font-medium text-zinc-900">{category.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-zinc-500">{filteredSubs.length}</span>
                          <ChevronRight
                            className={`h-5 w-5 text-zinc-400 transition-transform ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                          />
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="ml-4 space-y-1 pb-2">
                              {filteredSubs.map(subcategory => (
                                <Link
                                  key={subcategory.slug}
                                  href={`/catalogue?category=${category.slug}&subcategory=${subcategory.slug}`}
                                  className="block rounded-md px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-amber-100 hover:text-amber-900"
                                >
                                  {subcategory.name}
                                </Link>
                              ))}
                              <Link
                                href={`/catalogue?category=${category.slug}`}
                                className="block rounded-md px-3 py-2 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-100"
                              >
                                View all {category.name} →
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>

          {/* Service Categories */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="mb-4 flex items-center gap-2">
              <Wrench className="h-6 w-6 text-amber-600" />
              <h2 className="text-2xl font-semibold text-zinc-900">Service Categories</h2>
              <span className="ml-auto rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900">
                {filteredServiceCategories.length}
              </span>
            </div>

            <div className="max-h-[500px] space-y-2 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              {filteredServiceCategories.length === 0 ? (
                <div className="py-12 text-center text-zinc-500">
                  No service categories found
                </div>
              ) : (
                filteredServiceCategories.map(categoryName => {
                  const categoryServices = getServicesForCategory(categoryName)
                  const isExpanded = expandedCategory?.type === 'service' && expandedCategory?.slug === categoryName

                  return (
                    <div key={categoryName} className="border-b border-zinc-100 last:border-0">
                      <button
                        onMouseEnter={() => setExpandedCategory({ type: 'service', slug: categoryName })}
                        onClick={() => setExpandedCategory(
                          isExpanded ? null : { type: 'service', slug: categoryName }
                        )}
                        className="flex w-full items-center justify-between rounded-lg p-3 text-left transition-all hover:bg-amber-50"
                      >
                        <span className="font-medium text-zinc-900">{categoryName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-zinc-500">{categoryServices.length}</span>
                          <ChevronRight
                            className={`h-5 w-5 text-zinc-400 transition-transform ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                          />
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="ml-4 space-y-1 pb-2">
                              {categoryServices.map(service => (
                                <div
                                  key={service.id}
                                  className="block rounded-md px-3 py-2 text-sm text-zinc-700"
                                >
                                  <div className="font-medium">{service.name}</div>
                                  {service.pricing?.base_price && (
                                    <div className="text-xs text-amber-600">
                                      From Ksh {service.pricing.base_price.toLocaleString()}
                                    </div>
                                  )}
                                </div>
                              ))}
                              <Link
                                href={`/services?category=${categoryName}`}
                                className="block rounded-md px-3 py-2 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-100"
                              >
                                View all {categoryName} →
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Links - Only show when not searching */}
        <AnimatePresence>
          {!searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-8 flex flex-wrap justify-center gap-4"
            >
              <Link
                href="/catalogue"
                className="inline-flex items-center gap-2 rounded-full border-2 border-amber-500 bg-amber-500 px-6 py-3 font-medium text-white transition-all hover:bg-amber-600 hover:border-amber-600"
              >
                <Package className="h-5 w-5" />
                Browse All Products
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-full border-2 border-zinc-900 bg-white px-6 py-3 font-medium text-zinc-900 transition-all hover:bg-zinc-50"
              >
                <Wrench className="h-5 w-5" />
                Browse All Services
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
