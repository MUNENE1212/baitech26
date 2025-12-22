'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight, Flame, ShoppingCart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from 'src/types'
import { useCart } from '@/hooks/useCart'
import { toast } from 'sonner'

interface HotDealsSliderProps {
  products: Product[]
}

export default function HotDealsSlider({ products }: HotDealsSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      slidesToScroll: 1,
      breakpoints: {
        '(min-width: 768px)': { slidesToScroll: 2 },
        '(min-width: 1024px)': { slidesToScroll: 3 }
      }
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  )

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const { addToCart } = useCart()
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

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

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setLoadingStates(prev => ({ ...prev, [product.id]: true }))
    
    try {
      await addToCart({
        id: product.id,
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.images?.[0] || '',
        total: product.price
      })
      
      toast.success('Added to cart!', {
        duration: 2000,
        position: 'bottom-right',
      })
    } catch (error) {
      toast.error('Failed to add to cart', {
        duration: 3000,
        position: 'bottom-right',
      })
    } finally {
      setLoadingStates(prev => ({ ...prev, [product.id]: false }))
    }
  }

  if (!products || products.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p>No hot deals available at the moment</p>
      </div>
    )
  }

  return (
    <section className="py-12 bg-gradient-to-br from-red-50 to-orange-50">
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
            <Flame className="h-8 w-8 text-red-600" />
          </motion.div>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex-[0_0_85%] min-w-0 pl-4 md:flex-[0_0_45%] lg:flex-[0_0_30%]"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden group cursor-pointer"
                  >
                    {/* Product Image */}
                    <div className="relative h-48 md:h-56 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-orange-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative h-full w-full">
                        <Image
                          src={product.images?.[0] || '/placeholder-product.jpg'}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          unoptimized={product.images?.[0]?.includes('cloudinary')}
                        />
                      </div>
                      
                      {/* Hot Deal Badge */}
                      <div className="absolute top-4 left-4 z-10">
                        <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                          <Flame className="h-4 w-4" />
                          <span>Hot Deal</span>
                        </div>
                      </div>

                      {/* Discount Badge */}
                      {product.original_price && product.original_price > product.price && (
                        <div className="absolute top-4 right-4 z-10">
                          <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                            <span>
                              {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="p-6">
                      {/* Category */}
                      <div className="mb-4">
                        <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                          {product.category}
                        </span>
                      </div>

                      {/* Product Name */}
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                        {product.name}
                      </h3>

                      {/* Price */}
                      <div className="mb-4">
                        {product.original_price && product.original_price > product.price ? (
                          <div className="flex items-center gap-3">
                            <span className="text-lg text-gray-500 line-through">
                              Ksh {product.original_price.toLocaleString()}
                            </span>
                            <span className="text-2xl font-bold text-red-600">
                              Ksh {product.price.toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-2xl font-bold text-gray-900">
                            Ksh {product.price.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Stock Status */}
                      <div className="mb-4">
                        {product.stock > 0 ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                            <span className="text-sm font-medium">
                              {product.stock} in stock
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-600">
                            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                            <span className="text-sm font-medium">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Add to Cart Button */}
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={loadingStates[product.id] || product.stock === 0}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {loadingStates[product.id] ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <ShoppingCart className="w-4 h-4" />
                        )}
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-6 w-6 text-gray-800" />
          </button>

          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-6 w-6 text-gray-800" />
          </button>
        </div>
      </div>
    </section>
  )
}