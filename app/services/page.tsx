'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, X, ArrowUpRight, Phone, Mail, MessageCircle } from 'lucide-react'
import type { Service } from 'src/types'
import { generateGeneralInquiryUrl, openWhatsApp } from '@/lib/utils/whatsapp'

function ServicesContent() {
  const searchParams = useSearchParams()
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  // Set category from URL on mount
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
  }, [searchParams])

  // Fetch services
  useEffect(() => {
    async function fetchServices() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
        const response = await fetch(`${apiUrl}/api/services`)
        const data = await response.json()
        // API returns array directly
        setServices(Array.isArray(data) ? data : [])
        setFilteredServices(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch services:', error)
        setServices([])
        setFilteredServices([])
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  // Get unique categories (only if services is loaded)
  const categories = ['all', ...new Set(services?.map(s => s.category) || [])]

  // Apply filters
  useEffect(() => {
    if (!services || services.length === 0) {
      setFilteredServices([])
      return
    }

    let result = [...services]

    // Search filter
    if (searchQuery) {
      result = result.filter(
        s =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.category?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(s => s.category === selectedCategory)
    }

    setFilteredServices(result)
  }, [services, searchQuery, selectedCategory])

  if (loading) {
    return <ServicesLoadingSkeleton />
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="border-b border-zinc-200 bg-zinc-50 py-16">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-4 inline-block rounded-full border border-amber-300 bg-amber-50 px-4 py-1 text-sm font-medium text-amber-900">
            Expert Solutions
          </div>
          <h1 className="mb-4 text-4xl font-light tracking-tight text-zinc-900 lg:text-5xl">
            Professional <span className="font-semibold text-amber-600">Services</span>
          </h1>
          <p className="max-w-2xl text-zinc-600">
            Technical expertise and professional services delivered by certified technicians
          </p>
        </div>
      </section>

      {/* Search and Filter Bar */}
      <section className="border-b border-zinc-200 bg-white">
        <div className="container mx-auto px-6 py-6 lg:px-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search services..."
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

            {/* Result Count */}
            <p className="text-sm text-zinc-600">
              Showing {filteredServices.length} of {services.length} services
            </p>
          </div>

          {/* Category Filter */}
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => category && setSelectedCategory(category)}
                className={`border px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-900'
                }`}
              >
                {category === 'all' ? 'All Services' : category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12">
        <div className="container mx-auto px-6 lg:px-12">
          {filteredServices.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <p className="mb-2 text-lg font-medium text-zinc-900">No services found</p>
                <p className="mb-4 text-sm text-zinc-600">
                  Try adjusting your filters or search query
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all')
                    setSearchQuery('')
                  }}
                  className="border border-zinc-900 bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-900"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-px bg-zinc-200 md:grid-cols-2 lg:grid-cols-3">
              {filteredServices.filter(service => service && service.id).map(service => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onClick={() => setSelectedService(service)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-zinc-200 bg-zinc-50 py-16">
        <div className="container mx-auto px-6 text-center lg:px-12">
          <h2 className="mb-4 text-3xl font-light text-zinc-900">
            Need a <span className="font-semibold">Custom Solution?</span>
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-zinc-600">
            Can&apos;t find what you&apos;re looking for? Contact us directly and we&apos;ll create a tailored
            service package for your specific needs.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={() => openWhatsApp(generateGeneralInquiryUrl('Custom Service Request'))}
              className="flex items-center gap-2 border border-emerald-600 bg-emerald-600 px-8 py-4 font-medium text-white transition-all hover:bg-emerald-700"
            >
              <MessageCircle className="h-5 w-5" />
              Chat on WhatsApp
            </button>
            <a
              href="tel:+254799954672"
              className="flex items-center gap-2 border border-zinc-900 bg-white px-8 py-4 font-medium text-zinc-900 transition-all hover:bg-zinc-50"
            >
              <Phone className="h-5 w-5" />
              Call Us
            </a>
            <a
              href="mailto:mnent2025@gmail.com"
              className="flex items-center gap-2 border border-zinc-300 bg-white px-8 py-4 font-medium text-zinc-700 transition-all hover:border-zinc-900"
            >
              <Mail className="h-5 w-5" />
              Email Us
            </a>
          </div>
        </div>
      </section>

      {/* Service Detail Modal */}
      {selectedService && (
        <ServiceDetailModal service={selectedService} onClose={() => setSelectedService(null)} />
      )}
    </div>
  )
}

function ServiceCard({ service, onClick }: { service: Service; onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white p-8 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      {/* Category badge */}
      <div className="mb-4 inline-block rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium uppercase tracking-wider text-amber-900">
        {service.category}
      </div>

      {/* Service name */}
      <h3 className="mb-3 text-xl font-semibold text-zinc-900">{service.name}</h3>

      {/* Description */}
      <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-zinc-600">
        {service.description}
      </p>

      {/* Pricing */}
      {service.pricing?.base_price && (
        <div className="mb-6">
          <span className="text-2xl font-bold text-amber-600">
            Ksh {service.pricing.base_price.toLocaleString()}
          </span>
          <span className="ml-2 text-sm text-zinc-500">starting from</span>
        </div>
      )}

      {/* Learn more indicator */}
      <div
        className={`flex items-center gap-2 text-sm font-medium text-amber-600 transition-all duration-300 ${
          isHovered ? 'translate-x-1' : 'translate-x-0'
        }`}
      >
        <span>View details</span>
        <ArrowUpRight className="h-4 w-4" />
      </div>

      {/* Bottom border accent */}
      <div
        className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300 ${
          isHovered ? 'w-full' : 'w-0'
        }`}
      />
    </button>
  )
}

function ServiceDetailModal({ service, onClose }: { service: Service; onClose: () => void }) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-3xl max-h-[90vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-200 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 p-8">
          <div className="mb-4 inline-block rounded-full bg-white border border-amber-200 px-3 py-1 text-xs font-medium uppercase tracking-wider text-amber-900">
            {service.category}
          </div>
          <h2 className="mb-2 text-3xl font-bold text-zinc-900">{service.name}</h2>
          {service.pricing?.base_price && (
            <div className="mt-4">
              <span className="text-3xl font-bold text-amber-600">
                Ksh {service.pricing.base_price.toLocaleString()}
              </span>
              <span className="ml-2 text-sm text-zinc-600">starting from</span>
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-600 transition-colors hover:bg-zinc-100 hover:border-zinc-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Description */}
          <div className="mb-8">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-900">
              Description
            </h3>
            <p className="leading-relaxed text-zinc-700">{service.description}</p>
          </div>

          {/* Features (if available) */}
          {service.features && service.features.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-900">
                What&apos;s Included
              </h3>
              <div className="grid gap-3">
                {service.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-zinc-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estimated Duration */}
          {service.estimated_duration && (
            <div className="mb-8 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
              <h3 className="mb-2 text-sm font-semibold text-zinc-900">
                Estimated Duration
              </h3>
              <p className="text-zinc-700">{service.estimated_duration}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                openWhatsApp(
                  generateGeneralInquiryUrl(`Service Request: ${service.name}`)
                )
                onClose()
              }}
              className="flex items-center justify-center gap-2 rounded-lg border border-emerald-600 bg-emerald-600 px-6 py-4 font-semibold text-white transition-all hover:bg-emerald-700 hover:shadow-lg"
            >
              <MessageCircle className="h-5 w-5" />
              Request via WhatsApp
            </button>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="tel:+254799954672"
                className="flex items-center justify-center gap-2 rounded-lg border border-amber-600 bg-white px-6 py-4 font-medium text-amber-600 transition-all hover:bg-amber-50"
              >
                <Phone className="h-5 w-5" />
                Call Us
              </a>
              <a
                href="mailto:mnent2025@gmail.com"
                className="flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-6 py-4 font-medium text-zinc-700 transition-all hover:border-zinc-900"
              >
                <Mail className="h-5 w-5" />
                Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<ServicesLoadingSkeleton />}>
      <ServicesContent />
    </Suspense>
  )
}

function ServicesLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <section className="border-b border-zinc-200 bg-zinc-50 py-16">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-4 h-8 w-32 animate-pulse bg-zinc-200" />
          <div className="mb-4 h-12 w-96 animate-pulse bg-zinc-200" />
          <div className="h-6 w-80 animate-pulse bg-zinc-200" />
        </div>
      </section>
      <section className="py-12">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4 border border-zinc-200 p-8">
                <div className="h-6 w-20 animate-pulse bg-zinc-200" />
                <div className="h-6 w-full animate-pulse bg-zinc-200" />
                <div className="h-20 w-full animate-pulse bg-zinc-200" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
