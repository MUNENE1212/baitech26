'use client'

import { useState } from 'react'
import type { Service } from '@/types'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

interface ServiceGridProps {
  services: Service[]
}

export function ServiceGrid({ services }: ServiceGridProps) {
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
        {services.map((service) => (
          <ServiceCard key={service._id} service={service} />
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
    </>
  )
}

function ServiceCard({ service }: { service: Service }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="group relative bg-white p-8 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Category badge */}
      <div className="mb-4 inline-block border border-zinc-200 px-3 py-1 text-xs font-medium uppercase tracking-wider text-zinc-600">
        {service.category}
      </div>

      {/* Service name */}
      <h3 className="mb-3 text-xl font-medium text-zinc-900 transition-colors">
        {service.name}
      </h3>

      {/* Description */}
      <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-zinc-600">
        {service.description}
      </p>

      {/* Hover indicator */}
      <div className={`flex items-center gap-2 text-sm font-medium text-zinc-900 transition-all duration-300 ${isHovered ? 'translate-x-1' : 'translate-x-0'}`}>
        <span>Learn more</span>
        <ArrowUpRight className="h-4 w-4" />
      </div>

      {/* Bottom border accent */}
      <div className={`absolute bottom-0 left-0 h-0.5 bg-black transition-all duration-300 ${isHovered ? 'w-full' : 'w-0'}`} />
    </div>
  )
}
