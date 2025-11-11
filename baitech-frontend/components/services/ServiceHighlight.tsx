'use client'

import { useState, useEffect } from 'react'
import { Service } from '@/types'
import {
  Wrench,
  Shield,
  Laptop,
  Smartphone,
  Wifi,
  Settings,
  ArrowRight,
  Check,
  Star,
  Clock
} from 'lucide-react'

interface ServiceHighlightProps {
  maxServices?: number
  showCTA?: boolean
  layout?: 'grid' | 'carousel'
}

const iconMap: Record<string, any> = {
  'Software Installation': Laptop,
  'Hardware Repair': Wrench,
  'Network Setup': Wifi,
  'Data Recovery': Shield,
  'Phone Repair': Smartphone,
  'System Optimization': Settings
}

export function ServiceHighlight({
  maxServices = 6,
  showCTA = true,
  layout = 'grid'
}: ServiceHighlightProps) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/v1/services?limit=${maxServices}`)

      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }

      const data = await response.json()
      setServices(data || [])
      setError(null)
    } catch (err) {
      setError('Unable to load services')
      console.error('Error fetching services:', err)
    } finally {
      setLoading(false)
    }
  }

  const getServiceIcon = (category: string) => {
    const Icon = iconMap[category] || Wrench
    return Icon
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-8 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchServices}
          className="mt-4 rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-amber-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800">
            <Star className="h-4 w-4" />
            Professional Services
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Expert Tech Support at Your Fingertips
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            From repairs to installations, our certified technicians are here to help
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className={`
            grid gap-6
            ${layout === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
            }
          `}>
            {[...Array(maxServices)].map((_, i) => (
              <div
                key={i}
                className="h-[280px] animate-pulse rounded-2xl bg-gray-200"
              />
            ))}
          </div>
        )}

        {/* Services Grid */}
        {!loading && services.length > 0 && (
          <div className={`
            grid gap-6
            ${layout === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
            }
          `}>
            {services.map((service, index) => {
              const Icon = getServiceIcon(service.category)
              const isHovered = hoveredIndex === index

              return (
                <div
                  key={service._id}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Gradient Background */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-br from-amber-400/10 via-transparent to-emerald-400/10
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  `} />

                  <div className="relative p-6">
                    {/* Icon & Category */}
                    <div className="mb-4 flex items-start justify-between">
                      <div className={`
                        rounded-xl p-3 transition-all duration-300
                        ${isHovered
                          ? 'bg-amber-400 text-gray-900 scale-110'
                          : 'bg-amber-100 text-amber-700'
                        }
                      `}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                        {service.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                      {service.name}
                    </h3>

                    {/* Description */}
                    <p className="mb-4 text-sm text-gray-600 line-clamp-3">
                      {service.description}
                    </p>

                    {/* Pricing */}
                    <div className="mb-4 flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        Ksh {service.pricing.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500">starting from</span>
                    </div>

                    {/* Features */}
                    {service.features && service.features.length > 0 && (
                      <div className="mb-4 space-y-2">
                        {service.features.slice(0, 3).map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Duration */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                      <Clock className="h-4 w-4" />
                      <span>Estimated: {service.estimated_duration || '1-2 hours'}</span>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedService(service)}
                        className="flex-1 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          const message = `Hi! I'm interested in ${service.name}. Can you provide more information?`
                          window.open(`https://wa.me/254726366248?text=${encodeURIComponent(message)}`, '_blank')
                        }}
                        className="rounded-lg border border-emerald-500 p-2.5 text-emerald-500 hover:bg-emerald-50 transition-colors"
                        title="Contact via WhatsApp"
                      >
                        <ArrowRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Hover Effect Border */}
                  <div className={`
                    absolute inset-0 rounded-2xl border-2 border-amber-400
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300
                    pointer-events-none
                  `} />
                </div>
              )
            })}
          </div>
        )}

        {/* CTA Section */}
        {showCTA && !loading && services.length > 0 && (
          <div className="mt-12 text-center">
            <div className="inline-flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-r from-amber-400 to-emerald-400 p-8 text-gray-900">
              <h3 className="text-2xl font-bold">Need Custom Support?</h3>
              <p className="max-w-md text-gray-800">
                Can't find what you're looking for? Our team is ready to provide tailored solutions for your unique needs.
              </p>
              <button
                onClick={() => {
                  window.open('https://wa.me/254726366248?text=Hi! I need custom tech support.', '_blank')
                }}
                className="flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white hover:bg-gray-800 transition-colors"
              >
                Contact Us Now
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && services.length === 0 && (
          <div className="py-16 text-center">
            <Wrench className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No services available
            </h3>
            <p className="mt-2 text-gray-600">
              Check back soon for our professional services
            </p>
          </div>
        )}
      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedService(null)}
        >
          <div
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 mb-2">
                  {selectedService.category}
                </span>
                <h3 className="text-3xl font-bold text-gray-900">{selectedService.name}</h3>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <p className="mb-6 text-gray-600">{selectedService.description}</p>

            <div className="mb-6">
              <div className="text-3xl font-bold text-gray-900">
                Ksh {selectedService.pricing.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Starting price</div>
            </div>

            {selectedService.features && selectedService.features.length > 0 && (
              <div className="mb-6">
                <h4 className="mb-3 font-semibold text-gray-900">What's Included:</h4>
                <div className="space-y-2">
                  {selectedService.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                const message = `Hi! I'd like to book ${selectedService.name}. When is the earliest available slot?`
                window.open(`https://wa.me/254726366248?text=${encodeURIComponent(message)}`, '_blank')
              }}
              className="w-full rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-white hover:bg-emerald-600 transition-colors"
            >
              Book This Service via WhatsApp
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
