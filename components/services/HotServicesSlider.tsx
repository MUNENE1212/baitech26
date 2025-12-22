'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight, Wrench, MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import type { Service } from 'src/types'

interface HotServicesSliderProps {
  services: Service[]
}

export default function HotServicesSlider({ services }: HotServicesSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'center',
      slidesToScroll: 1,
      breakpoints: {
        '(min-width: 768px)': { slidesToScroll: 1, align: 'center' },
        '(min-width: 1024px)': { slidesToScroll: 1, align: 'center' }
      }
    },
    [Autoplay({ delay: 6000, stopOnInteraction: false })] // Slower autoplay for readability
  )

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])


  if (!services || services.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p>No hot services available at the moment</p>
      </div>
    )
  }

  return (
    <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            whileInView={{ scale: 1 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <Wrench className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Hot Services
            </h2>
            <div className="h-1 w-16 bg-gradient-to-l from-blue-600 to-indigo-600 rounded-full" />
          </motion.div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Professional services to keep your devices running smoothly
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex-[0_0_85%] min-w-0 pl-4 md:flex-[0_0_70%] lg:flex-[0_0_60%]"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden group cursor-pointer"
                  >
                    {/* Service Image */}
                    <div className="relative h-56 md:h-64 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative h-full w-full">
                        <Image
                          src={service.image || '/logo-md.png'}
                          alt={service.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 55vw, 40vw"
                        />
                      </div>

                      {/* Hot Service Badge */}
                      <div className="absolute top-4 left-4 z-10">
                        <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                          <Wrench className="h-4 w-4" />
                          <span>Hot Service</span>
                        </div>
                      </div>
                    </div>

                    {/* Service Details */}
                    <div className="p-8">
                      {/* Category */}
                      <div className="mb-4">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {service.category || 'Service'}
                        </span>
                      </div>

                      {/* Service Name */}
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {service.name}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {service.description}
                      </p>

                      {/* Price Range */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-blue-600">
                            Ksh {service.pricing?.base_price ? service.pricing.base_price.toLocaleString() : '0'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">Starting price</p>
                      </div>

                      {/* Features */}
                      {service.features && service.features.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {service.features.slice(0, 2).map((feature, idx) => (
                              <span key={idx} className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Book Service Button */}
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          // Open WhatsApp or service booking
                          const message = `Hi, I'm interested in ${service.name}. Can you provide more details?`
                          window.open(`https://wa.me/254700000000?text=${encodeURIComponent(message)}`, '_blank')
                        }}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Book Service
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Modern Navigation Buttons */}
          <motion.button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group"
          >
            <ChevronLeft className="h-6 w-6 transition-transform duration-300 group-hover:-translate-x-1" />
            <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          </motion.button>

          <motion.button
            onClick={scrollNext}
            disabled={!canScrollNext}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group"
          >
            <ChevronRight className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
            <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          </motion.button>

          {/* Navigation Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {services.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (emblaApi) {
                    emblaApi.scrollTo(index)
                  }
                }}
                className="h-2 w-2 rounded-full bg-white/50 transition-all duration-300 hover:bg-white/70"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}