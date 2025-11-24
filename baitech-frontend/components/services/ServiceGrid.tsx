'use client'

import { useState } from 'react'
import type { Service } from '@/types'
import Link from 'next/link'
import { ArrowUpRight, X, MessageCircle, Phone, Mail } from 'lucide-react'
import { generateGeneralInquiryUrl, openWhatsApp } from '@/lib/utils/whatsapp'

interface ServiceGridProps {
  services: Service[]
}

export function ServiceGrid({ services }: ServiceGridProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  if (services.length === 0) {
    return (
      <div className="py-12 text-center text-zinc-500">
        <p className="text-sm">No services available at the moment</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-px bg-zinc-200 sm:grid-cols-2 lg:grid-cols-4">
        {services.filter(service => service && service._id).map((service) => (
          <ServiceCard
            key={service._id}
            service={service}
            onClick={() => setSelectedService(service)}
          />
        ))}
      </div>

      <div className="mt-16 text-center">
        <Link
          href="/services"
          className="group inline-flex items-center justify-center gap-2 border border-zinc-900 bg-black px-8 py-4 font-medium text-white transition-all hover:bg-zinc-900"
        >
          View All Services
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <ServiceDetailModal service={selectedService} onClose={() => setSelectedService(null)} />
      )}
    </>
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
      <h3 className="mb-3 text-xl font-semibold text-zinc-900">
        {service.name}
      </h3>

      {/* Description */}
      <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-zinc-600">
        {service.description}
      </p>

      {/* Pricing */}
      {service.pricing && (
        <div className="mb-6">
          <span className="text-2xl font-bold text-amber-600">
            Ksh {typeof service.pricing === 'number' ? service.pricing.toLocaleString() : service.pricing}
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
          {service.pricing && (
            <div className="mt-4">
              <span className="text-3xl font-bold text-amber-600">
                Ksh {typeof service.pricing === 'number' ? service.pricing.toLocaleString() : service.pricing}
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
                What's Included
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
