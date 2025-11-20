'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight, Flame, ShoppingCart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/types'
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

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setLoadingStates(prev => ({ ...prev, [product._id]: true }))

    try {
      addToCart({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        category: product.category,
        quantity: 1
      })
      toast.success(`${product.name} added to cart!`)
    } catch (error) {
      toast.error('Failed to add to cart')
    } finally {
      setLoadingStates(prev => ({ ...prev, [product._id]: false }))
    }
  }

  const calculateDiscount = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100)
  }

  if (!products || products.length === 0) return null

  return (
    <section className="relative py-12 bg-gradient-to-br from-red-50 via-orange-50 to-amber-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Flame className="w-8 h-8 text-red-500" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-red-500 rounded-full blur-md opacity-30"
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Hot Deals
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Limited time offers - Grab them before they're gone!
              </p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </motion.div>

        {/* Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4 md:gap-6">
            {products.map((product, index) => {
              const discount = product.originalPrice
                ? calculateDiscount(product.originalPrice, product.price)
                : null

              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-[0_0_85%] sm:flex-[0_0_45%] md:flex-[0_0_32%] lg:flex-[0_0_24%] min-w-0"
                >
                  <Link href={`/products/${product._id}`}>
                    <div className="group relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden h-full">
                      {/* Discount Badge */}
                      {discount && (
                        <div className="absolute top-3 right-3 z-10">
                          <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg"
                          >
                            -{discount}%
                          </motion.div>
                        </div>
                      )}

                      {/* Hot Badge */}
                      <div className="absolute top-3 left-3 z-10">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                          <Flame className="w-3 h-3" />
                          HOT
                        </div>
                      </div>

                      {/* Product Image */}
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        <Image
                          src={product.images[0] || '/placeholder-product.jpg'}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 640px) 85vw, (max-width: 768px) 45vw, (max-width: 1024px) 32vw, 24vw"
                        />

                        {/* Overlay on Hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

                        {/* Add to Cart Button */}
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => handleAddToCart(product, e)}
                          disabled={loadingStates[product._id] || product.stock === 0}
                          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {loadingStates[product._id] ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <ShoppingCart className="w-4 h-4" />
                          )}
                          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </motion.button>
                      </div>

                      {/* Product Details */}
                      <div className="p-4">
                        <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide mb-1">
                          {product.category}
                        </p>
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors min-h-[2.5rem]">
                          {product.name}
                        </h3>

                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-xl font-bold text-gray-900">
                            KSh {product.price.toLocaleString()}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              KSh {product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Stock Indicator */}
                        {product.stock < 5 && product.stock > 0 && (
                          <p className="text-xs text-red-600 font-semibold">
                            Only {product.stock} left!
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden justify-center gap-2 mt-6">
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>
    </section>
  )
}
